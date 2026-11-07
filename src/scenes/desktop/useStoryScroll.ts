import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { getStoryState } from "./storyProgress";

gsap.registerPlugin(ScrollTrigger);
/** Numeric progress is a live getter; frame clients read progressRef without React renders. */
export function useStoryScroll(containerRef: RefObject<HTMLElement | null>) {
  const progressRef = useRef(0);
  useEffect(() => {
    const container = containerRef.current;
    if (!container || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    let disposed = false,
      visible = true;
    const lenis = new Lenis({ autoRaf: false, lerp: 0.085, smoothWheel: true });
    const update = () => ScrollTrigger.update();
    lenis.on("scroll", update);
    const tick = (time: number) => {
      if (visible && document.visibilityState !== "hidden")
        lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        progressRef.current = self.progress;
        container.dataset.chapter = getStoryState(self.progress).chapter;
        container.dataset.progress = self.progress.toFixed(4);
      },
    });
    let refreshFrame = 0;
    const refresh = () => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => {
        if (!disposed) {
          lenis.resize();
          trigger.refresh();
        }
      });
    };
    const resize = new ResizeObserver(refresh);
    resize.observe(container);
    const intersection = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false;
      lenis.options.smoothWheel = visible;
      if (visible) {
        lenis.start();
        refresh();
      } else lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    });
    intersection.observe(container);
    const visibility = () => {
      if (document.visibilityState === "hidden") lenis.stop();
      else {
        lenis.start();
        if (visible) refresh();
      }
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("resize", refresh);
    document.fonts?.ready.then(() => {
      if (!disposed) refresh();
    });
    document.fonts?.addEventListener("loadingdone", refresh);
    const images = Array.from(document.images);
    images.forEach((image) => image.addEventListener("load", refresh));
    refresh();
    return () => {
      disposed = true;
      cancelAnimationFrame(refreshFrame);
      trigger.kill();
      gsap.ticker.remove(tick);
      lenis.off("scroll", update);
      lenis.destroy();
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("resize", refresh);
      document.fonts?.removeEventListener("loadingdone", refresh);
      images.forEach((image) => image.removeEventListener("load", refresh));
    };
  }, [containerRef]);
  return {
    get progress() {
      return progressRef.current;
    },
    progressRef,
  };
}
