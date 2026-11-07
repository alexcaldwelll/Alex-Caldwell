import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { OpeningPoster } from "./OpeningPoster";
import type { StoryCanvasProps } from "./StoryCanvas";
import type { SceneProgressProps } from "./route";
import "./desktop-story.css";

export const DESKTOP_STORY_QUERY =
  "(min-width: 64rem) and (pointer: fine) and (hover: hover)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const loadDesktopScene = () => import("./StoryExperience");
type SceneLoader = () => Promise<{ default: ComponentType<StoryCanvasProps> }>;

function useDesktopEligibility() {
  const [eligible, setEligible] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const desktop = window.matchMedia(DESKTOP_STORY_QUERY);
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => setEligible(desktop.matches && !reduced.matches);
    update();
    desktop.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      desktop.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);
  return eligible;
}

/** Import is invoked only after desktop eligibility is known; poster is complete while loading. */
export function DesktopStory({
  progress,
  progressRef,
  loadScene = loadDesktopScene,
}: SceneProgressProps & { loadScene?: SceneLoader }) {
  const eligible = useDesktopEligibility();
  const [failed, setFailed] = useState(false);
  const LazyScene = useMemo(() => lazy(loadScene), [loadScene]);
  const fail = useCallback(() => setFailed(true), []);
  return (
    <div className="story-opening" aria-label="Alexandra’s story begins">
      <LazyBoundary onFailure={fail}>
        {eligible && !failed ? (
          <Suspense fallback={<OpeningPoster />}>
            <LazyScene
              progress={progress}
              progressRef={progressRef}
              reducedMotion={false}
              onContextFailure={fail}
            />
          </Suspense>
        ) : (
          <OpeningPoster />
        )}
      </LazyBoundary>
    </div>
  );
}

// Loading failures (network/GPU bundle) retain the same complete initial presentation.
class LazyBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? <OpeningPoster /> : this.props.children;
  }
}
