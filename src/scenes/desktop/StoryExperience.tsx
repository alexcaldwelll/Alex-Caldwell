import { useEffect, useRef, type CSSProperties } from "react";
import type { StoryCanvasProps } from "./StoryCanvas";
import { OpeningPoster } from "./OpeningPoster";
import { RoadPencil } from "../shared/RoadPencil";
import { LANDSCAPES, type Landscape } from "./landscapes";
import { drawRoad } from "./drawRoad";

const cities = [
  { id: "seattle", name: "Seattle", distances: [0, 7, 31, 58] },
  { id: "charleston", name: "Charleston", distances: [0, 23, 46, 69, 92] },
  { id: "dc", name: "Washington, DC", distances: [0, 23, 46, 69] },
  { id: "nashville", name: "Nashville", distances: [0, 23] },
] as const;
const arrival = 1.35;
const span = 1.13;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

let total = 0;
let routeDistance = 0;
const chapters = cities.map((city, index) => {
  const start = total;
  const drawEnd = arrival + city.distances.length * span;
  const ending = index === cities.length - 1;
  const routeStart = routeDistance + 23;
  total += drawEnd + (ending ? 1.05 : 1.68);
  routeDistance = routeStart + city.distances[city.distances.length - 1] + 22;
  const scene: Landscape = LANDSCAPES[city.id];
  return { ...city, scene, start, drawEnd, routeStart, ending };
});
type Chapter = typeof chapters[number];

function cameraDistance(chapter: Chapter, local: number, leaving: number) {
  let distance = -23 * (1 - clamp(local / arrival)) ** 2;
  for (const [index, stop] of chapter.distances.entries()) {
    const previous = chapter.distances[index - 1] ?? 0;
    const start = arrival + index * span - .22 * span;
    distance += (stop - previous) * ease((local - start) / (.35 * span));
  }
  return distance + leaving * 22;
}

function renderLandscape(
  scene: Landscape, node: HTMLElement, width: number, height: number,
  local: number, distance: number, wipe: number,
) {
  const [vanishingX, vanishingY] = scene.vanishing;
  const scenicWidth = Math.max(width, height * 1.5);
  const scenicHeight = scenicWidth / 1.5;
  const travelZoom = clamp((distance + 23) / 81) * .12;
  const lastApproach = arrival + (scene.frames.length - 2 - .22) * span;
  const zoom = 1 + mix(travelZoom, .02, ease((local - lastApproach) / (.35 * span)));
  const scaledWidth = scenicWidth * zoom;
  const scaledHeight = scenicHeight * zoom;
  const left = (width - scenicWidth) / 2 - (scaledWidth - scenicWidth) * vanishingX;
  const top = (height - scenicHeight) / 2 - (scaledHeight - scenicHeight) * vanishingY;
  Object.assign(node.style, {
    left: left + "px", top: top + "px", width: scaledWidth + "px", height: scaledHeight + "px",
    clipPath: `inset(0 0 0 ${wipe * 100}%)`,
    opacity: String(1 - ease((wipe - .93) / .07)),
  });
  const roadX = left + scaledWidth * scene.roadCenter;
  const roadY = Math.min(height * .78, top + scaledHeight * .85);
  let x = roadX, y = roadY, angle = -73;
  for (const [index, [, , range]] of scene.frames.slice(1).entries()) {
    if (!range) continue;
    const step = (local - arrival - index * span) / span;
    const [start, end, vertical] = range;
    const front = mix(start, end, ease((step - .13) / .65));
    const layer = node.children[index + 1] as HTMLImageElement;
    layer.hidden = step <= .13;
    layer.style.setProperty("--front", mix(front, 1, ease((step - .78) / .22)) * 100 + "%");
    const lastStroke = scene.finishAtEdge && index === scene.frames.length - 2;
    if (step >= 0 && (step < 1 || lastStroke)) {
      const weight = ease(step / .13) * (lastStroke ? 1 : 1 - ease((step - .78) / .22));
      x = mix(roadX, left + scaledWidth * front, weight);
      y = mix(roadY, top + scaledHeight * vertical, weight);
      angle = mix(-73, -12, weight);
    }
  }
  return { x, y, angle };
}

export default function StoryExperience({ onContextFailure }: StoryCanvasProps) {
  const worldRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const world = worldRef.current!;
    const stage = stageRef.current!;
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d");
    if (!context) { onContextFailure?.(); return; }

    const nodes = Array.from(stage.querySelectorAll<HTMLElement>(".city-landscape"));
    const title = stage.querySelector<HTMLElement>(".road-location")!;
    const pencil = stage.querySelector<SVGElement>(".travel-pencil")!;
    const plane = stage.querySelector<SVGElement>(".road-plane")!;
    const survivor = stage.querySelector<HTMLImageElement>(".landscape-survivor")!;
    const links = Array.from(stage.querySelectorAll<HTMLAnchorElement>(".road-cities a"));
    let currentIndex = -1;
    let frame = 0;
    function loadImages(parent: HTMLElement) {
      for (const image of parent.querySelectorAll<HTMLImageElement>("img[data-source]"))
        if (!image.hasAttribute("src")) image.src = image.dataset.source!;
    }

    function render() {
      frame = 0;
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (!width || !height) return;
      const bounds = world.getBoundingClientRect();
      const range = Math.max(1, bounds.height - height);
      const progress = clamp(-bounds.top / range);
      const t = progress * total;
      const next = chapters.findIndex(chapter => t < chapter.start);
      const index = next < 0 ? chapters.length - 1 : next - 1;
      const chapter = chapters[index];
      const local = t - chapter.start;
      const leaving = chapter.ending ? 0 : ease((local - chapter.drawEnd - .30) / 1.25);
      const wipe = chapter.ending ? 0 : ease((local - chapter.drawEnd - .26) / 1.05);
      const dpr = Math.min(2, devicePixelRatio);
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        context!.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      context!.clearRect(0, 0, width, height);
      const distance = cameraDistance(chapter, local, leaving);
      drawRoad(context!, width, height, chapter.routeStart + distance, ease(local / arrival) * (1 - leaving));
      if (currentIndex !== index) {
        nodes.forEach((node, i) => { node.hidden = i !== index; });
        loadImages(nodes[index]);
        title.textContent = chapter.name;
        links.forEach((link, i) => {
          if (i === index) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
        currentIndex = index;
      }
      if (nodes[index + 1] && local > chapter.drawEnd - 1) loadImages(nodes[index + 1]);
      world.dataset.chapter = chapter.id;
      world.dataset.progress = progress.toFixed(5);
      world.dataset.local = local.toFixed(4);
      title.style.opacity = String((1 - wipe) * ease(local / .32));
      const { x, y, angle } = renderLandscape(chapter.scene, nodes[index], width, height, local, distance, wipe);
      pencil.style.left = x + "px";
      pencil.style.top = y + "px";
      pencil.style.transform = `translate(-100%,-50%) rotate(${angle}deg)`;
      plane.toggleAttribute("hidden", !(wipe > 0 && wipe < 1));
      plane.style.left = (-12 + 124 * wipe) + "%";
      survivor.hidden = chapter.id !== "dc" || wipe <= .18;
      survivor.style.opacity = String(ease((wipe - .18) / .64));
      if (!survivor.hidden && !survivor.hasAttribute("src")) survivor.src = survivor.dataset.source!;
    }

    function schedule() { if (!frame) frame = requestAnimationFrame(render); }
    function jump(hash: string) {
      const chapter = chapters.find(entry => hash === "#" + entry.id);
      if (!chapter) return false;
      scrollTo(0, scrollY + world.getBoundingClientRect().top + (world.offsetHeight - stage.offsetHeight) * chapter.start / total + 1);
      return true;
    }
    function click(event: MouseEvent) {
      const link = (event.target as Element).closest<HTMLAnchorElement>(".road-cities a");
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !link || !jump(link.hash)) return;
      event.preventDefault();
      history.replaceState(history.state, "", link.hash);
    }
    const jumpToHash = () => { jump(location.hash); };
    stage.addEventListener("click", click);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    addEventListener("hashchange", jumpToHash);
    jumpToHash();
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      stage.removeEventListener("click", click);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      removeEventListener("hashchange", jumpToHash);
    };
  }, [onContextFailure]);

  return <>
    <OpeningPoster />
    <div ref={worldRef} className="road-world" style={{ "--story-height": `${100 * (total + 1)}svh` } as CSSProperties}>
      <div ref={stageRef} className="road-stage">
        <canvas ref={canvasRef} aria-hidden="true" />
        <p className="road-location" aria-hidden="true" />
        <nav className="road-cities" aria-label="Jump to a city">
          {chapters.map(chapter => <a key={chapter.id} href={`#${chapter.id}`}>{chapter.name}</a>)}
        </nav>
        <div className="road-art" aria-hidden="true">
          {chapters.map(({ id, scene }) => (
            <div key={id} className={`city-landscape ${id}-landscape`} hidden>
              {scene.frames.map(([source], index) => (
                <img key={source} data-source={source} alt="" width="1279" height="853" decoding="async" hidden={index !== 0} />
              ))}
            </div>
          ))}
          <img className="landscape-survivor" data-source={LANDSCAPES.dc.survivor} alt="" hidden />
        </div>
        <RoadPencil className="travel-pencil" />
        <svg className="road-plane" viewBox="0 0 100 64" aria-hidden="true" style={{ left: "-12%" }}>
          <path d="M97 31c0 3-4 5-10 5H62L39 62H28l14-26H20L9 45H2l5-13-5-13h7l11 9h22L28 2h11l23 26h25c6 0 10 1 10 3Z" />
        </svg>
      </div>
    </div>
  </>;
}
