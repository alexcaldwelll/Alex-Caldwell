import type { StoryChapter } from "./sceneData";

// This module is arithmetic only. Three/GSAP stay behind the desktop import boundary.
export const clamp = (value: number) =>
  Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
export const ease = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

type ChapterDrawing = {
  chapter: StoryChapter["id"];
  approach: number;
  draw: number;
  finish: number;
  rejoin: number;
  roadStop: number;
  leave: number;
  depart: number;
};

export const CHAPTER_DRAWINGS: readonly ChapterDrawing[] = [
  {
    chapter: "seattle",
    approach: 0.054,
    draw: 0.077,
    finish: 0.138,
    rejoin: 0.168,
    roadStop: 0.105,
    leave: 0.183,
    depart: 0.211,
  },
  {
    chapter: "charleston",
    approach: 0.264,
    draw: 0.282,
    finish: 0.347,
    rejoin: 0.374,
    roadStop: 0.303,
    leave: 0.387,
    depart: 0.413,
  },
  {
    chapter: "dc",
    approach: 0.495,
    draw: 0.512,
    finish: 0.563,
    rejoin: 0.582,
    roadStop: 0.525,
    leave: 0.594,
    depart: 0.622,
  },
  {
    chapter: "nashville",
    approach: 0.664,
    draw: 0.685,
    finish: 0.746,
    rejoin: 0.77,
    roadStop: 0.705,
    leave: 0.793,
    depart: 0.824,
  },
  {
    chapter: "future",
    approach: 0.85,
    draw: 0.875,
    finish: 0.94,
    rejoin: 0.968,
    roadStop: 0.901,
    leave: 1,
    depart: 1.02,
  },
];

export function activeDrawing(progress: number) {
  return CHAPTER_DRAWINGS.find(
    ({ approach, rejoin }) => progress > approach && progress < rejoin,
  );
}

export function drawingWeight(drawing: ChapterDrawing, progress: number) {
  return (
    ease((progress - drawing.approach) / (drawing.draw - drawing.approach)) *
    (1 - ease((progress - drawing.finish) / (drawing.rejoin - drawing.finish)))
  );
}

export function sweepProgress(drawing: ChapterDrawing, progress: number) {
  return ease((progress - drawing.draw) / (drawing.finish - drawing.draw));
}

/** Advance along the road, holding its position while the pencil works off-road. */
export function travelProgress(progress: number) {
  const p = clamp(progress);
  const drawing = activeDrawing(p);
  if (!drawing) return p;
  const { approach, draw, finish, rejoin, roadStop } = drawing;
  if (p < draw)
    return approach + (roadStop - approach) * ease((p - approach) / (draw - approach));
  if (p > finish)
    return roadStop + (rejoin - roadStop) * ease((p - finish) / (rejoin - finish));
  return roadStop;
}

export function getStoryState(progress: number) {
  const p = clamp(progress);
  return {
    chapter: CHAPTER_DRAWINGS[Math.min(4, Math.floor(p * 5))].chapter,
    road: ease(p / 0.045),
    drawing: activeDrawing(p)?.chapter ?? null,
    route: travelProgress(p) <= 0.48 ? "soccer" : "new-road",
    ballAbandoned: p > 0.49,
    faith: ease((p - 0.525) / 0.035),
  };
}
