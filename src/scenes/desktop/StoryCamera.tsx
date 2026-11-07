import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import {
  clampProgress,
  writeStoryPosition,
  type ProgressRef,
  type SceneProgressProps,
} from "./route";
import {
  activeMemory,
  drawingWeight,
  ease,
  travelProgress,
} from "./storyProgress";

const OVERVIEWS = [
  { center: 0.105, in: 0.166, hold: 0.18, out: 0.195, end: 0.216 },
  { center: 0.3, in: 0.37, hold: 0.387, out: 0.397, end: 0.414 },
  { center: 0.505, in: 0.577, hold: 0.592, out: 0.601, end: 0.615 },
  { center: 0.705, in: 0.777, hold: 0.795, out: 0.812, end: 0.835 },
];

export function StoryCamera({
  progress,
  progressRef,
  memoryOffset = 0,
  memoryOffsetRef,
}: SceneProgressProps & {
  memoryOffset?: number;
  memoryOffsetRef?: ProgressRef;
}) {
  const position = useRef(new Vector3());
  const target = useRef(new Vector3());
  const overviewCenter = useRef(new Vector3());
  useFrame(({ camera }) => {
    const p = clampProgress(progressRef?.current ?? progress);
    writeStoryPosition(travelProgress(p), position.current);
    const event = activeMemory(p);
    const framing = event ? drawingWeight(event, p) : 0;
    const offset =
      (memoryOffsetRef?.current ?? memoryOffset) +
      (event?.side ?? 0) * framing * 2.6;
    const opening = 1 - ease(p / 0.04);
    // Close diagonal opening; move behind and above as travel begins, then pan toward drawings.
    camera.position.set(
      position.current.x + -8 * opening + offset * 0.6,
      8.8 - 3.3 * opening + framing * 2,
      position.current.z + 12 - 1.5 * opening + framing * 2,
    );
    target.current.set(
      position.current.x + offset,
      1.3 - 0.1 * opening,
      position.current.z - 2.6 + 5.7 * opening,
    );
    for (const overview of OVERVIEWS) {
      if (p <= overview.in || p >= overview.end) continue;
      const weight =
        ease((p - overview.in) / (overview.hold - overview.in)) *
        (1 - ease((p - overview.out) / (overview.end - overview.out)));
      writeStoryPosition(overview.center, overviewCenter.current);
      camera.position.x +=
        (overviewCenter.current.x + 8 - camera.position.x) * weight;
      camera.position.y += (18 - camera.position.y) * weight;
      camera.position.z +=
        (overviewCenter.current.z + 19 - camera.position.z) * weight;
      target.current.x +=
        (overviewCenter.current.x - target.current.x) * weight;
      target.current.y += (0.7 - target.current.y) * weight;
      target.current.z +=
        (overviewCenter.current.z - 1 - target.current.z) * weight;
    }
    camera.up.set(0.18 * opening, 1, 0);
    camera.lookAt(target.current);
    if (camera instanceof PerspectiveCamera) {
      const fov = 42 - 17 * opening + framing * 2;
      if (Math.abs(camera.fov - fov) > 0.001) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    }
  });
  return null;
}
