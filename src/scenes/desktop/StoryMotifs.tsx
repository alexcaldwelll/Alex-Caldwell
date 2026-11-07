import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import {
  ROAD_ROUTES,
  writeStoryPosition,
  type SceneProgressProps,
} from "./route";
import { MEMORY_PLACEMENTS } from "./memoryRoute";
import { ease, travelProgress } from "./storyProgress";
import { Box, SoccerBall } from "./Landmarks";

const ball = ROAD_ROUTES[0].curve.getPoint(0.535);
export function StoryMotifs({ progress, progressRef }: SceneProgressProps) {
  const plane = useRef<Group>(null),
    faith = useRef<Group>(null),
    abandoned = useRef<Group>(null),
    position = useRef(new Vector3());
  useFrame(() => {
    const p = progressRef?.current ?? progress;
    if (plane.current) {
      plane.current.visible = p > 0.185 && p < 0.225;
      const t = (p - 0.185) / 0.04;
      writeStoryPosition(0.205, position.current);
      plane.current.position.set(
        position.current.x - 12 + t * 24,
        4 + Math.sin(t * Math.PI),
        position.current.z - 3,
      );
    }
    if (abandoned.current) {
      abandoned.current.visible = p > 0.462 && p < 0.67;
      const t = ease((p - 0.477) / 0.014),
        origin = MEMORY_PLACEMENTS["dc-retirement"];
      abandoned.current.position.set(
        (origin[0] - 1.55) * (1 - t) + ball.x * t,
        1.3 * (1 - t) + 0.02 * t,
        origin[2] * (1 - t) + ball.z * t,
      );
    }
    if (faith.current) {
      const strength = ease((p - 0.525) / 0.035);
      faith.current.visible = strength > 0;
      writeStoryPosition(travelProgress(p), position.current);
      faith.current.position.set(
        position.current.x - 1.15,
        1.1,
        position.current.z - 0.4,
      );
      faith.current.scale.setScalar(strength);
    }
  });
  return (
    <>
      <group
        ref={plane}
        visible={false}
        name="airplane"
        rotation={[0, 0, -0.08]}
      >
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.18, 2.2, 6, 12]} />
          <meshStandardMaterial color="#e7e7db" />
        </mesh>
        <Box
          p={[0, 0, 0]}
          s={[0.6, 0.08, 2.8]}
          color="#91adb6"
          rotation={-0.15}
        />
        <Box p={[-1, 0, 0]} s={[0.4, 0.07, 1]} color="#91adb6" />
        <Box p={[-1, 0.3, 0]} s={[0.4, 0.6, 0.07]} color="#91adb6" />
      </group>
      <group
        ref={abandoned}
        visible={false}
        position={[ball.x, 0.02, ball.z]}
        name="abandoned-soccer-ball"
      >
        <SoccerBall />
      </group>
      <group ref={faith} visible={false} name="faith-light">
        <mesh>
          <sphereGeometry args={[0.13, 16, 12]} />
          <meshBasicMaterial color="#f8d885" />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.3, 16, 12]} />
          <meshBasicMaterial
            color="#e7be67"
            transparent
            opacity={0.13}
            depthWrite={false}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.06, 0]}>
          <circleGeometry args={[0.65, 32]} />
          <meshBasicMaterial
            color="#d9b45f"
            transparent
            opacity={0.13}
            depthWrite={false}
          />
        </mesh>
        <pointLight color="#e5b854" intensity={2.5} distance={5} decay={2} />
      </group>
    </>
  );
}
