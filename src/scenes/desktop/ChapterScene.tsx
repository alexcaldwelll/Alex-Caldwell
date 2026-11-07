import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  Mesh,
  MeshStandardMaterial,
} from "three";
import { MEMORY_SKETCHES } from "../../assets/scenes/memorySketches";
import {
  MEMORY_EVENTS,
  ease,
  memoryPhase,
  memoryStrokes,
  type MemoryEvent,
} from "./storyProgress";
import { MEMORY_PLACEMENTS } from "./memoryRoute";
import { Landmark } from "./Landmarks";
import type { StoryChapter } from "./sceneData";
import type { ProgressRef } from "./route";

export type ChapterSceneProps = {
  chapter: StoryChapter;
  progress: number;
  progressRef?: ProgressRef;
};
const graphite = new Color("#77776d");
function Memory({
  event,
  progress,
  progressRef,
}: {
  event: MemoryEvent;
  progress: number;
  progressRef?: ProgressRef;
}) {
  const root = useRef<Group>(null),
    solid = useRef<Group>(null),
    material = useRef<LineBasicMaterial>(null);
  const colors = useRef<{ material: MeshStandardMaterial; color: Color }[]>([]);
  const geometry = useMemo(() => {
    const points = MEMORY_SKETCHES[event.kind],
      vertices: number[] = [];
    for (let i = 1; i < points.length; i++) {
      vertices.push(...points[i - 1], ...points[i]);
    }
    const buffer = new BufferGeometry();
    buffer.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    buffer.setDrawRange(0, 0);
    return buffer;
  }, [event.kind]);
  useEffect(() => {
    colors.current = [];
    solid.current?.traverse((object) => {
      if (
        object instanceof Mesh &&
        object.material instanceof MeshStandardMaterial
      )
        colors.current.push({
          material: object.material,
          color: object.material.color.clone(),
        });
    });
    return () => geometry.dispose();
  }, [geometry]);
  useFrame(() => {
    if (!root.current || !solid.current || !material.current) return;
    const p = progressRef?.current ?? progress,
      phase = memoryPhase(event, p);
    // Keep objects spatially present throughout their chapter; cull only well behind camera.
    root.current.visible = p > event.start && p < event.start + 0.24;
    if (!root.current.visible) return;
    const future = event.chapter === "future";
    const strokes = memoryStrokes(event, p),
      volume = ease((phase - 0.53) / 0.32) * (future ? 0.24 : 1);
    geometry.setDrawRange(
      0,
      Math.floor((strokes * geometry.attributes.position.count) / 2) * 2,
    );
    material.current.opacity = future ? 1 : 1 - ease((phase - 0.7) / 0.3);
    solid.current.visible = volume > 0;
    solid.current.scale.y = Math.max(0.004, volume);
    for (const entry of colors.current)
      entry.material.color.lerpColors(graphite, entry.color, volume);
  });
  return (
    <group
      ref={root}
      position={MEMORY_PLACEMENTS[event.id]}
      name={event.id}
      visible={false}
    >
      <lineSegments geometry={geometry}>
        <lineBasicMaterial
          ref={material}
          color="#5f625a"
          transparent
          depthWrite={false}
        />
      </lineSegments>
      <group ref={solid} visible={false}>
        <Landmark kind={event.kind} />
      </group>
    </group>
  );
}
export function ChapterScene({
  chapter,
  progress,
  progressRef,
}: ChapterSceneProps) {
  return (
    <group name={`chapter-${chapter.id}`}>
      {MEMORY_EVENTS.filter((event) => event.chapter === chapter.id).map(
        (event) => (
          <Memory
            key={event.id}
            event={event}
            progress={progress}
            progressRef={progressRef}
          />
        ),
      )}
    </group>
  );
}
