import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import { clampProgress, writeStoryPosition, type ProgressRef, type SceneProgressProps } from './route';

/** Camera follows behind the pencil. Task 6 can add memory framing through this offset. */
export function StoryCamera({ progress, progressRef, memoryOffset = 0, memoryOffsetRef }: SceneProgressProps & { memoryOffset?: number; memoryOffsetRef?: ProgressRef }) {
  const position = useRef(new Vector3());
  const ahead = useRef(new Vector3());
  const target = useRef(new Vector3());
  useFrame(({ camera }) => {
    const p = clampProgress(progressRef?.current ?? progress);
    writeStoryPosition(p, position.current);
    writeStoryPosition(Math.min(1, p + 0.018), ahead.current);
    const offset = memoryOffsetRef?.current ?? memoryOffset;
    const opening = 1 - MathUtils.smoothstep(p, 0, 0.065);
    camera.position.set(position.current.x + 6 * opening + offset, 7.8 - opening * 0.8, position.current.z + 10 + opening * 1.5);
    target.current.set(ahead.current.x + offset * 0.5, 0.8 + opening * 0.9, ahead.current.z + opening * 4);
    camera.lookAt(target.current);
  });
  return null;
}
