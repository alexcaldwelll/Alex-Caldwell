import {
  Component,
  useCallback,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import { ChapterScene } from "./ChapterScene";
import { StoryMotifs } from "./StoryMotifs";
import { STORY_CHAPTERS } from "./sceneData";
import { Pencil } from "./Pencil";
import { Road } from "./Road";
import { StoryCamera } from "./StoryCamera";
import { ResourceLifecycle } from "./ResourceLifecycle";
import { SceneLighting } from "./SceneLighting";
import { OpeningPoster } from "./OpeningPoster";
import type { ProgressRef, SceneProgressProps } from "./route";
import "./desktop-story.css";

export type StoryCanvasProps = SceneProgressProps & {
  reducedMotion: boolean;
  onContextFailure?: () => void;
  memoryOffsetRef?: ProgressRef;
  children?: ReactNode;
};

class RendererBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function StoryCanvas({
  progress,
  progressRef,
  reducedMotion,
  onContextFailure,
  memoryOffsetRef,
  children,
}: StoryCanvasProps) {
  const [failed, setFailed] = useState(false);
  const failureReported = useRef(false);
  const fail = useCallback(() => {
    if (failureReported.current) return;
    failureReported.current = true;
    setFailed(true);
    onContextFailure?.();
  }, [onContextFailure]);
  return (
    <div className="desktop-scene">
      <OpeningPoster />
      {!reducedMotion && !failed && (
        <div className="desktop-canvas" aria-hidden="true">
          <RendererBoundary onFailure={fail}>
            <Canvas
              dpr={[1, 1.5]}
              shadows
              camera={{ position: [6, 7, 11.5], fov: 39, near: 0.1, far: 180 }}
              gl={{
                antialias: true,
                alpha: false,
                powerPreference: "default",
                toneMapping: ACESFilmicToneMapping,
              }}
              fallback={<span>Illustrated journey below</span>}
              onCreated={({ gl }) => {
                gl.setClearColor("#f6f2e9");
                gl.toneMappingExposure = 1.0;
              }}
            >
              <color attach="background" args={["#f6f2e9"]} />
              <fog attach="fog" args={["#f6f2e9", 48, 115]} />
              <SceneLighting progress={progress} progressRef={progressRef} />
              <mesh
                receiveShadow
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.015, -45]}
              >
                <planeGeometry args={[500, 500]} />
                <shadowMaterial color="#746d5e" opacity={0.09} />
              </mesh>
              <Road progress={progress} progressRef={progressRef} />
              <Pencil progress={progress} progressRef={progressRef} />
              <StoryCamera
                progress={progress}
                progressRef={progressRef}
                memoryOffsetRef={memoryOffsetRef}
              />
              {STORY_CHAPTERS.map((chapter) => (
                <ChapterScene
                  key={chapter.id}
                  chapter={chapter}
                  progress={progress}
                  progressRef={progressRef}
                />
              ))}
              <StoryMotifs progress={progress} progressRef={progressRef} />
              {children}
              <ResourceLifecycle onContextFailure={fail} />
            </Canvas>
          </RendererBoundary>
        </div>
      )}
    </div>
  );
}

export default StoryCanvas;
