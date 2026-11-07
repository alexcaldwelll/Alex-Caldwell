import { Vector3 } from "three";
import { MEMORY_SKETCHES } from "../../assets/scenes/memorySketches";
import {
  MEMORY_EVENTS,
  activeMemory,
  drawingWeight,
  memoryStrokes,
  travelProgress,
} from "./storyProgress";
import { sampleStoryRoute, writeStoryPosition } from "./route";

export const MEMORY_PLACEMENTS = Object.fromEntries(
  MEMORY_EVENTS.map((event) => {
    const route = sampleStoryRoute(event.start + event.duration * 0.5);
    return [
      event.id,
      [
        route[0] + event.side * 4.5,
        0,
        route[2] - 1.7 - (event.kind === "monument" ? 5 : 0),
      ] as const,
    ];
  }),
);
/** Pencil graphite tip follows the very same contour buffer that appears on the page. */
export function writePencilPosition(progress: number, target: Vector3) {
  writeStoryPosition(travelProgress(progress), target);
  const event = activeMemory(progress);
  if (!event) return target;
  const weight = drawingWeight(event, progress),
    points = MEMORY_SKETCHES[event.kind];
  const t = memoryStrokes(event, progress) * (points.length - 1);
  const index = Math.min(points.length - 2, Math.floor(t)),
    blend = t - index;
  const a = points[index],
    b = points[index + 1],
    origin = MEMORY_PLACEMENTS[event.id];
  target.x += (origin[0] + a[0] + (b[0] - a[0]) * blend - target.x) * weight;
  target.y +=
    (origin[1] + a[1] + (b[1] - a[1]) * blend + 0.04 - target.y) * weight;
  target.z += (origin[2] + a[2] + (b[2] - a[2]) * blend - target.z) * weight;
  return target;
}
