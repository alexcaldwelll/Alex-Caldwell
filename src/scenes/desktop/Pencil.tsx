import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import { createPencilSurface } from "../../assets/scenes/pencilSurface";
import { ARTWORK_DRAWINGS, artworkFraming, writePencilPosition } from "./artworkDrawing";
import { activeDrawing, drawingWeight, travelProgress } from "./storyProgress";
import {
  clampProgress,
  writeStoryPosition,
  type SceneProgressProps,
} from "./route";

/** One immutable design for the entire journey: scene progress changes pose only. */
export const PENCIL_DESIGN = Object.freeze({
  barrel: Object.freeze({
    color: "#e6b52e",
    length: 4.9,
    radius: 0.235,
    radialSegments: 6,
    roughness: 0.32,
  }),
  cedar: Object.freeze({ color: "#c99b6b", length: 0.74, roughness: 0.85 }),
  graphite: Object.freeze({
    color: "#30302e",
    radius: 0.052,
    length: 0.21,
    roughness: 0.5,
  }),
  ferrule: Object.freeze({
    color: "#e1e3df",
    metalness: 0.84,
    roughness: 0.28,
  }),
  eraser: Object.freeze({ color: "#d98d9a", roughness: 0.9 }),
});

export function getPencilPose(progress: number) {
  return { position: writePencilPosition(progress, new Vector3(), new Vector3()).toArray(), tilt: 1.24, heading: 0 };
}

export function Pencil({ progress, progressRef }: SceneProgressProps) {
  const root = useRef<Group>(null);
  const lacquer = useMemo(() => createPencilSurface(), []);
  const cedar = useMemo(() => createPencilSurface(true), []);
  useEffect(
    () => () => {
      lacquer.dispose();
      cedar.dispose();
    },
    [lacquer, cedar],
  );
  const position = useRef(new Vector3());
  const contact = useRef(new Vector3());
  const road = useRef(new Vector3());
  const ahead = useRef(new Vector3());
  useFrame(() => {
    if (!root.current) return;
    const p = clampProgress(progressRef?.current ?? progress);
    writePencilPosition(p, position.current, contact.current);
    root.current.position.copy(position.current);

    const routeProgress = travelProgress(p);
    writeStoryPosition(Math.min(routeProgress, 0.9998), road.current);
    writeStoryPosition(Math.min(1, routeProgress + 0.0002), ahead.current);
    const dx = ahead.current.x - road.current.x;
    const dz = ahead.current.z - road.current.z;
    let roadHeading = Math.atan2(-dx, -dz);
    // Keep the barrel visible from the city camera as the pencil rejoins the road.
    for (const artwork of ARTWORK_DRAWINGS) {
      const framing = artworkFraming(artwork, p);
      if (framing <= 0) continue;
      const restHeading = -Math.sign(artwork.side) * 0.72;
      roadHeading += (restHeading - roadHeading) * framing;
      break;
    }
    const drawing = activeDrawing(p);
    const weight = drawing ? drawingWeight(drawing, p) : 0;
    // Hold the barrel toward the viewer while the graphite moves across the illustration.
    root.current.rotation.y = roadHeading + (-0.72 - roadHeading) * weight;
  });
  const design = PENCIL_DESIGN;
  return (
    <group ref={root} name="pencil-graphite-tip" position={getPencilPose(progress).position}>
      <group rotation={[1.24, 0, -0.025]} scale={0.85}>
        <mesh castShadow position={[0, 3.4, 0]}>
          <cylinderGeometry
            args={[
              design.barrel.radius,
              design.barrel.radius,
              design.barrel.length,
              design.barrel.radialSegments,
            ]}
          />
          <meshStandardMaterial
            color={design.barrel.color}
            roughness={design.barrel.roughness}
            roughnessMap={lacquer}
            bumpMap={lacquer}
            bumpScale={0.008}
            metalness={0.05}
          />
        </mesh>
        <mesh
          castShadow
          position={[0, design.graphite.length + design.cedar.length / 2, 0]}
        >
          <cylinderGeometry
            args={[
              design.barrel.radius,
              design.graphite.radius,
              design.cedar.length,
              design.barrel.radialSegments,
            ]}
          />
          <meshStandardMaterial
            color="#ffffff"
            roughness={design.cedar.roughness}
            map={cedar}
            bumpMap={lacquer}
            bumpScale={0.012}
          />
        </mesh>
        <mesh castShadow position={[0, design.graphite.length / 2, 0]}>
          <cylinderGeometry
            args={[
              design.graphite.radius,
              0,
              design.graphite.length,
              design.barrel.radialSegments,
            ]}
          />
          <meshStandardMaterial
            color={design.graphite.color}
            roughness={design.graphite.roughness}
            metalness={0.1}
          />
        </mesh>
        {/* Slightly rounded edges and three rolled rings give the metal ferrule its scale. */}
        <mesh castShadow position={[0, 6.08, 0]}>
          <cylinderGeometry args={[0.239, 0.239, 0.49, 32]} />
          <meshStandardMaterial
            {...design.ferrule}
            emissive="#a8b0ae"
            emissiveIntensity={0.2}
          />
        </mesh>
        {[5.89, 6.03, 6.25].map((y) => (
          <mesh
            key={y}
            castShadow
            position={[0, y, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.239, 0.012, 6, 32]} />
            <meshStandardMaterial
              color="#989e9d"
              metalness={0.95}
              roughness={0.28}
            />
          </mesh>
        ))}
        <mesh castShadow position={[0, 6.59, 0]}>
          <capsuleGeometry args={[0.229, 0.34, 6, 24]} />
          <meshStandardMaterial {...design.eraser} />
        </mesh>
      </group>
    </group>
  );
}
