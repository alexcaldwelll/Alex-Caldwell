import { travelProgress } from "./storyProgress";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, DoubleSide, Mesh, Vector3 } from "three";
import {
  BRANCH_PROGRESS,
  ROAD_ROUTES,
  clampProgress,
  type SceneProgressProps,
} from "./route";
export { ROAD_ROUTES, sampleStoryRoute } from "./route";

export function getRoadReveal(progress: number) {
  return writeRoadReveal(progress, { opacity: 0, soccer: 0, branch: 0 });
}
function writeRoadReveal(
  progress: number,
  target: { opacity: number; soccer: number; branch: number },
) {
  const p = clampProgress(progress);
  target.opacity = Math.min(1, p / 0.035);
  target.soccer =
    p === 0
      ? 0
      : Math.min(1, p < BRANCH_PROGRESS ? p + 0.4 : BRANCH_PROGRESS + 0.4);
  target.branch = Math.max(
    0,
    Math.min(
      1,
      (p - BRANCH_PROGRESS + 0.025) / (1 - BRANCH_PROGRESS) +
        (p > BRANCH_PROGRESS ? 0.32 : 0),
    ),
  );
  return target;
}
const SEGMENTS = 320;
type RibbonRoute = Pick<(typeof ROAD_ROUTES)[number], "id" | "curve">;
const continuation: RibbonRoute = {
  id: "new-road",
  curve: new CatmullRomCurve3([
    new Vector3(-8, 0, -104),
    new Vector3(-6, 0, -118),
    new Vector3(-9, 0, -142),
  ]),
};
function makeRibbon(
  curve: (typeof ROAD_ROUTES)[number]["curve"],
  width: number,
  fade = false,
) {
  const positions = new Float32Array((SEGMENTS + 1) * 6);
  const colors = new Float32Array((SEGMENTS + 1) * 8);
  const normals = new Float32Array((SEGMENTS + 1) * 6);
  const indices = new Uint16Array(SEGMENTS * 6);
  const point = new Vector3();
  const tangent = new Vector3();
  for (let i = 0; i <= SEGMENTS; i++) {
    curve.getPoint(i / SEGMENTS, point);
    curve.getTangent(i / SEGMENTS, tangent);
    const length = Math.hypot(tangent.x, tangent.z);
    const x = ((-tangent.z / length) * width) / 2;
    const z = ((tangent.x / length) * width) / 2;
    positions.set(
      [point.x - x, 0.014, point.z - z, point.x + x, 0.014, point.z + z],
      i * 6,
    );
    const alpha = fade ? Math.max(0, 1 - i / SEGMENTS) : 1;
    colors.set([1, 1, 1, alpha, 1, 1, 1, alpha], i * 8);
    normals.set([0, 1, 0, 0, 1, 0], i * 6);
    if (i < SEGMENTS)
      indices.set(
        [i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2],
        i * 6,
      );
  }
  return { positions, normals, indices, colors };
}
function RouteRibbon({
  route,
  progress,
  progressRef,
  inner = false,
  future = false,
}: SceneProgressProps & {
  route: RibbonRoute;
  inner?: boolean;
  future?: boolean;
}) {
  const mesh = useRef<Mesh>(null);
  const revealState = useRef({ opacity: 0, soccer: 0, branch: 0 });
  const geometry = useMemo(
    () => makeRibbon(route.curve, inner ? 1.35 : 1.43, future),
    [route, inner, future],
  );
  useFrame(() => {
    if (!mesh.current) return;
    const reveal = writeRoadReveal(
      travelProgress(progressRef?.current ?? progress),
      revealState.current,
    );
    if (future) {
      reveal.opacity = Math.max(
        0,
        Math.min(1, ((progressRef?.current ?? progress) - 0.8) / 0.1),
      );
      reveal.branch = 1;
    }
    mesh.current.visible = reveal.opacity > 0;
    mesh.current.geometry.setDrawRange(
      0,
      Math.floor(
        (route.id === "soccer" ? reveal.soccer : reveal.branch) * SEGMENTS,
      ) * 6,
    );
    const material = mesh.current.material;
    if (!Array.isArray(material)) material.opacity = reveal.opacity;
  });
  return (
    <mesh
      ref={mesh}
      visible={progress > 0}
      receiveShadow
      position={[0, inner ? 0.003 : 0, 0]}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[geometry.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-normal"
          args={[geometry.normals, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[geometry.colors, 4]}
        />
        <bufferAttribute attach="index" args={[geometry.indices, 1]} />
      </bufferGeometry>
      <meshBasicMaterial
        color={inner ? "#ded6c5" : "#89816f"}
        toneMapped={false}
        vertexColors
        side={DoubleSide}
        transparent
      />
    </mesh>
  );
}
export function Road(props: SceneProgressProps) {
  return (
    <group name="automatic-story-roads">
      {ROAD_ROUTES.map((route) => (
        <group key={route.id} name={route.id}>
          <RouteRibbon {...props} route={route} />
          <RouteRibbon {...props} route={route} inner />
        </group>
      ))}
      <RouteRibbon {...props} route={continuation} future />
      <RouteRibbon {...props} route={continuation} future inner />
    </group>
  );
}
