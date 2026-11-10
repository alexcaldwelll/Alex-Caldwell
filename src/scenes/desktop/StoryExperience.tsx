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
        <div className="cinematic-travel" aria-hidden="true">
          {STORY_CHAPTERS.filter((chapter) => chapter.id !== "future").map((chapter) => (
            <div key={chapter.id}>
              <span className="cinematic-location" data-location={chapter.id}>{chapter.title}</span>
              {chapter.id !== "seattle" && (
                <svg
                  data-flight={chapter.id}
                  className="cinematic-plane"
                  viewBox="0 0 100 64"
                  focusable="false"
                >
                  <path d="M97 31c0 3-4 5-10 5H62L39 62H28l14-26H20L9 45H2l5-13-5-13h7l11 9h22L28 2h11l23 26h25c6 0 10 1 10 3Z" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
