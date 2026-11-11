import { travelProgress } from "./storyProgress";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, Object3D, Vector3, PMREMGenerator } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { writeStoryPosition, type SceneProgressProps } from "./route";

/** A small moving studio rig keeps shadow resolution consistent along the long paper. */
export function SceneLighting({ progress, progressRef }: SceneProgressProps) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const environment = generator.fromScene(room, 0.04);
    const previous = scene.environment;
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.35;
    room.dispose();
    generator.dispose();
    return () => {
      scene.environment = previous;
      environment.dispose();
    };
  }, [gl, scene]);
  const root = useRef<Group>(null);
  const position = useRef(new Vector3());
  const target = useMemo(() => new Object3D(), []);
  useFrame(() => {
    writeStoryPosition(
      travelProgress(progressRef?.current ?? progress),
      position.current,
    );
    root.current?.position.copy(position.current);
  });
  return (
    <group ref={root}>
      <primitive object={target} />
      <ambientLight intensity={0.55} color="#fff8e9" />
      <hemisphereLight args={["#f4f5ff", "#d2c4aa", 0.75]} />
      <directionalLight
        target={target}
        castShadow
        position={[-4, 20, 3]}
        intensity={1.8}
        color="#fff4df"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-radius={3}
        shadow-bias={-0.0003}
        shadow-normalBias={0.035}
      />
    </group>
  );
}
