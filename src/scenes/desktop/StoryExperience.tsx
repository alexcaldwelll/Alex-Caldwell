import { useRef } from "react";
import { StoryCanvas, type StoryCanvasProps } from "./StoryCanvas";
import { useStoryScroll } from "./useStoryScroll";
import { STORY_CHAPTERS } from "./sceneData";

export default function StoryExperience(props: StoryCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { progressRef } = useStoryScroll(containerRef);
  return (
    <div
      className="cinematic-journey"
      ref={containerRef}
      data-chapter="seattle"
      data-progress="0"
    >
      <div className="story-stage">
        <StoryCanvas {...props} progressRef={progressRef} />
      </div>
      <div className="cinematic-captions" aria-hidden="true">
        {STORY_CHAPTERS.map((chapter) => (
          <section
            key={chapter.id}
            aria-label={chapter.title}
            className={`cinematic-caption caption-${chapter.id}`}
          >
            <h2>{chapter.title}</h2>
            <p>{chapter.context}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
