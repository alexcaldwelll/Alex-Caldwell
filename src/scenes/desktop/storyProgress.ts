import type { StoryChapter } from "./sceneData";
// This module is arithmetic only. Three/GSAP stay behind the desktop import boundary.
export const clamp = (value: number) =>
  Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
export const ease = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
export type MemoryKind =
  | "needle"
  | "lake"
  | "rainier"
  | "coast"
  | "travel"
  | "tournament"
  | "monument"
  | "medical"
  | "patrick"
  | "vanderbilt"
  | "joy"
  | "immaculate"
  | "possibilities";
export type MemoryEvent = {
  id: string;
  chapter: StoryChapter["id"];
  kind: MemoryKind;
  start: number;
  duration: number;
  side: number;
};
export const MEMORY_EVENTS: readonly MemoryEvent[] = [
  {
    id: "seattle-needle",
    chapter: "seattle",
    kind: "needle",
    start: 0.032,
    duration: 0.044,
    side: -1,
  },
  {
    id: "seattle-lake",
    chapter: "seattle",
    kind: "lake",
    start: 0.087,
    duration: 0.043,
    side: 1,
  },
  {
    id: "seattle-rainier",
    chapter: "seattle",
    kind: "rainier",
    start: 0.141,
    duration: 0.038,
    side: -1,
  },
  {
    id: "charleston-coast",
    chapter: "charleston",
    kind: "coast",
    start: 0.223,
    duration: 0.043,
    side: 1,
  },
  {
    id: "charleston-travel",
    chapter: "charleston",
    kind: "travel",
    start: 0.278,
    duration: 0.041,
    side: -1,
  },
  {
    id: "florida-tournament",
    chapter: "charleston",
    kind: "tournament",
    start: 0.335,
    duration: 0.046,
    side: 1,
  },
  {
    id: "dc-gw",
    chapter: "dc",
    kind: "monument",
    start: 0.409,
    duration: 0.039,
    side: -1,
  },
  {
    id: "dc-retirement",
    chapter: "dc",
    kind: "medical",
    start: 0.454,
    duration: 0.032,
    side: 1,
  },
  {
    id: "dc-patrick",
    chapter: "dc",
    kind: "patrick",
    start: 0.526,
    duration: 0.052,
    side: -1,
  },
  {
    id: "nashville-vanderbilt",
    chapter: "nashville",
    kind: "vanderbilt",
    start: 0.614,
    duration: 0.043,
    side: -1,
  },
  {
    id: "nashville-joy",
    chapter: "nashville",
    kind: "joy",
    start: 0.677,
    duration: 0.042,
    side: 1,
  },
  {
    id: "nashville-immaculate",
    chapter: "nashville",
    kind: "immaculate",
    start: 0.743,
    duration: 0.043,
    side: -1,
  },
  {
    id: "future-possibilities",
    chapter: "future",
    kind: "possibilities",
    start: 0.85,
    duration: 0.08,
    side: 1,
  },
];
export function memoryPhase(event: MemoryEvent, progress: number) {
  return clamp((progress - event.start) / event.duration);
}
export function memoryStrokes(event: MemoryEvent, progress: number) {
  return (
    clamp((memoryPhase(event, progress) - 0.16) / 0.39) *
    (event.chapter === "future" ? 0.72 : 1)
  );
}
export function getMemoryState(event: MemoryEvent, progress: number) {
  const phase = memoryPhase(event, progress);
  return {
    strokes: memoryStrokes(event, progress),
    volume:
      ease((phase - 0.53) / 0.32) * (event.chapter === "future" ? 0.24 : 1),
  };
}
// A monotonic distance clock with a true dwell while the pencil traces each memory.
export function travelProgress(progress: number) {
  const p = clamp(progress);
  for (const event of MEMORY_EVENTS) {
    if (p < event.start || p > event.start + event.duration) continue;
    const t = memoryPhase(event, p);
    const mapped =
      t < 0.22
        ? 0.5 * ease(t / 0.22)
        : t < 0.62
          ? 0.5
          : 0.5 + 0.5 * ease((t - 0.62) / 0.38);
    return event.start + event.duration * mapped;
  }
  return p;
}
export function activeMemory(progress: number) {
  for (const event of MEMORY_EVENTS)
    if (progress > event.start && progress < event.start + event.duration)
      return event;
  return null;
}
export function drawingWeight(event: MemoryEvent, progress: number) {
  const t = memoryPhase(event, progress);
  // Arrive on the contour before memoryStrokes starts at phase 0.16.
  return ease(t / 0.16) * (1 - ease((t - 0.62) / 0.38));
}
export function getStoryState(progress: number) {
  const p = clamp(progress);
  return {
    chapter: (["seattle", "charleston", "dc", "nashville", "future"] as const)[
      Math.min(4, Math.floor(p * 5))
    ],
    road: ease(p / 0.045),
    memory: activeMemory(p)?.id ?? null,
    airplane:
      p > 0.185 && p < 0.225 ? Math.sin(((p - 0.185) / 0.04) * Math.PI) : 0,
    route: travelProgress(p) <= 0.48 ? "soccer" : "new-road",
    ballAbandoned: p > 0.49,
    faith: ease((p - 0.525) / 0.035),
  };
}
