import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import { ARTWORK_DRAWINGS, artworkFraming } from "./artworkDrawing";
import { clampProgress, writeStoryPosition, type SceneProgressProps } from "./route";
import { ease, travelProgress } from "./storyProgress";

export function StoryCamera({ progress, progressRef }: SceneProgressProps) {
  const position = useRef(new Vector3());
  const target = useRef(new Vector3());
  const framedTarget = useRef(new Vector3());
  const framedCamera = useRef(new Vector3());
  useFrame(({ camera }) => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const p = clampProgress(progressRef?.current ?? progress);
    writeStoryPosition(travelProgress(p), position.current);
    const opening = 1 - ease(p / 0.04);
    camera.position.set(
      position.current.x - 8 * opening,
      8.8 - 3.3 * opening,
      position.current.z + 12 - 1.5 * opening,
    );
    target.current.set(
      position.current.x,
      1.3 - 0.1 * opening,
      position.current.z - 2.6 + 5.7 * opening,
    );

    const fov = 42 - 17 * opening;
    const halfFovTangent = Math.tan(fov * Math.PI / 360);
    for (const drawing of ARTWORK_DRAWINGS) {
      const weight = artworkFraming(drawing, p);
      if (weight <= 0) continue;
      const distance = Math.max(
        drawing.height / 0.74,
        drawing.width / (camera.aspect * 0.88),
      ) / (2 * halfFovTangent);
      framedTarget.current.copy(drawing.center);
      framedTarget.current.x -= Math.sign(drawing.side) * 1.2;
      framedTarget.current.y -= 2.35;
      framedCamera.current.copy(framedTarget.current);
      framedCamera.current.y += 2.6;
      framedCamera.current.z += distance;
      camera.position.lerp(framedCamera.current, weight);
      target.current.lerp(framedTarget.current, weight);
      break;
    }

    camera.up.set(0.18 * opening, 1, 0);
    camera.lookAt(target.current);
    if (Math.abs(camera.fov - fov) > 0.001) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });
  return null;
}
