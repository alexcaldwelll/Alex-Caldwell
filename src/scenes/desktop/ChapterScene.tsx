import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, LineBasicMaterial } from "three";
import { MEMORY_SKETCHES } from "../../assets/scenes/memorySketches";
import {
  MEMORY_EVENTS,
  ease,
  memoryPhase,
  memoryStrokes,
  type MemoryEvent,
} from "./storyProgress";
import { createMemoryGeometry, updateMemoryGeometry } from "./memoryGeometry";
import { MEMORY_PLACEMENTS } from "./memoryRoute";
import { ChapterArtwork } from "./ChapterArtwork";
import type { StoryChapter } from "./sceneData";
import type { ProgressRef } from "./route";

export type ChapterSceneProps = {
  chapter: StoryChapter;
  progress: number;
  progressRef?: ProgressRef;
};
function Memory({
  event,
  progress,
  progressRef,
}: {
  event: MemoryEvent;
  progress: number;
  progressRef?: ProgressRef;
}) {
  const root = useRef<Group>(null);
  const material = useRef<LineBasicMaterial>(null);
  const geometry = useMemo(() => createMemoryGeometry(MEMORY_SKETCHES[event.kind]), [event.kind]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(() => {
    if (!root.current || !material.current) return;
    const p = progressRef?.current ?? progress,
      phase = memoryPhase(event, p);
    const future = event.chapter === "future";
    root.current.visible = p > event.start && (future || phase < 1);
    if (!root.current.visible) return;
    updateMemoryGeometry(geometry, MEMORY_SKETCHES[event.kind], memoryStrokes(event, p));
    material.current.opacity = future ? 1 : 1 - ease((phase - 0.7) / 0.3);
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
      <ChapterArtwork chapter={chapter} progress={progress} progressRef={progressRef} />
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
