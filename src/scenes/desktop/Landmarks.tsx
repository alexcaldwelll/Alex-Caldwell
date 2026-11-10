import type { ReactNode } from "react";
type LandmarkKind =
  | "needle" | "lake" | "rainier" | "coast" | "travel" | "tournament"
  | "monument" | "medical" | "patrick" | "vanderbilt" | "joy" | "immaculate"
  | "possibilities";

const C = {
  green: "#48715c",
  leaf: "#729570",
  blue: "#91bdc7",
  brick: "#b8735e",
  stone: "#e0d7c4",
  roof: "#687b73",
  white: "#f8f3e8",
  dark: "#42564f",
  gold: "#d4ad54",
};
export function Box({
  p = [0, 0, 0],
  s = [1, 1, 1],
  color = C.stone,
  rotation = 0,
}: {
  p?: [number, number, number];
  s?: [number, number, number];
  color?: string;
  rotation?: number;
}) {
  return (
    <mesh castShadow receiveShadow position={p} rotation={[0, rotation, 0]}>
      <boxGeometry args={s} />
      <meshStandardMaterial color={color} roughness={0.83} />
    </mesh>
  );
}
function Cone({
  p,
  s,
  color = C.green,
  vertices = 12,
}: {
  p: [number, number, number];
  s: [number, number];
  color?: string;
  vertices?: number;
}) {
  return (
    <mesh castShadow position={p}>
      <coneGeometry args={[...s, vertices]} />
      <meshStandardMaterial color={color} roughness={0.88} />
    </mesh>
  );
}
function Sphere({
  p,
  r,
  color = C.white,
  scale,
}: {
  p: [number, number, number];
  r: number;
  color?: string;
  scale?: [number, number, number];
}) {
  return (
    <mesh castShadow position={p} scale={scale}>
      <sphereGeometry args={[r, 16, 10]} />
      <meshStandardMaterial color={color} roughness={0.65} />
    </mesh>
  );
}
function Cylinder({
  p,
  r,
  h,
  color = C.stone,
}: {
  p: [number, number, number];
  r: number;
  h: number;
  color?: string;
}) {
  return (
    <mesh castShadow position={p}>
      <cylinderGeometry args={[r, r, h, 12]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}
function Tree({
  p = [0, 0, 0],
  palm = false,
  scale = 1,
}: {
  p?: [number, number, number];
  palm?: boolean;
  scale?: number;
}) {
  return (
    <group position={p} scale={scale}>
      <Cylinder p={[0, 1, 0]} r={0.1} h={2} color="#9b8063" />
      {palm ? (
        [0, 1, 2, 3, 4, 5].map((i) => (
          <group key={i} rotation={[0, (i * Math.PI) / 3, 0]}>
            <mesh
              castShadow
              position={[0.55, 2.1, 0]}
              rotation={[0, 0, -0.3]}
              scale={[1, 0.2, 0.5]}
            >
              <sphereGeometry args={[0.82, 10, 6]} />
              <meshStandardMaterial color={C.leaf} />
            </mesh>
          </group>
        ))
      ) : (
        <>
          <Cone p={[0, 1.2, 0]} s={[0.75, 1.7]} />
          <Cone p={[0, 1.95, 0]} s={[0.59, 1.6]} color={C.leaf} />
        </>
      )}
    </group>
  );
}
function Water({ ocean = false }: { ocean?: boolean }) {
  return (
    <group>
      <mesh
        receiveShadow
        position={[0, 0.045, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={ocean ? [1.2, 1, 1] : [1, 1, 1]}
      >
        <circleGeometry args={[2.6, 48]} />
        <meshStandardMaterial color={C.blue} roughness={0.4} metalness={0.08} />
      </mesh>
      {[-0.8, 0.1, 0.9].map((z, i) => (
        <Box
          key={z}
          p={[i * 0.15, 0.06, z]}
          s={[2.6 - i * 0.4, 0.015, 0.025]}
          color="#c8e2df"
        />
      ))}
    </group>
  );
}
function Goal({ z = 0 }: { z?: number }) {
  return (
    <group position={[0, 0, z]}>
      <Box p={[-1.25, 0.65, 0]} s={[0.05, 1.3, 0.05]} color={C.white} />
      <Box p={[1.25, 0.65, 0]} s={[0.05, 1.3, 0.05]} color={C.white} />
      <Box p={[0, 1.3, 0]} s={[2.55, 0.05, 0.05]} color={C.white} />
      {[-1, -0.5, 0, 0.5, 1].map((x) => (
        <Box
          key={x}
          p={[x, 0.6, -0.25]}
          s={[0.012, 1.2, 0.012]}
          color="#b7c2aa"
        />
      ))}
    </group>
  );
}
export function SoccerBall({
  p = [0, 0.3, 0],
  scale = 1,
}: {
  p?: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={p} scale={scale} name="soccer-ball">
      <mesh castShadow>
        <icosahedronGeometry args={[0.32, 1]} />
        <meshStandardMaterial color={C.white} roughness={0.7} />
      </mesh>
      {[
        [0, 0.3, 0],
        [0.27, 0.1, 0.1],
        [-0.27, 0.1, 0.1],
        [0, 0.02, 0.31],
        [0.1, -0.27, 0.1],
      ].map((p, i) => (
        <mesh
          key={i}
          position={p as [number, number, number]}
          rotation={[i * 0.8, 0, i * 0.9]}
        >
          <dodecahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color="#414b49" />
        </mesh>
      ))}
    </group>
  );
}
function Person({
  p = [0, 0, 0],
  running = false,
  doctor = false,
}: {
  p?: [number, number, number];
  running?: boolean;
  doctor?: boolean;
}) {
  return (
    <group position={p}>
      <Sphere p={[0, 1.4, 0]} r={0.18} color="#c5a383" />
      <Box
        p={[0, 0.95, 0]}
        s={[0.4, 0.65, 0.28]}
        color={doctor ? C.white : C.blue}
      />
      {[-1, 1].map((side) => (
        <group key={side} rotation={[running ? side * 0.5 : 0, 0, 0]}>
          <Box p={[side * 0.12, 0.4, 0]} s={[0.13, 0.7, 0.14]} color={C.dark} />
          <Box
            p={[side * 0.31, 1, 0]}
            s={[0.13, 0.55, 0.13]}
            color={doctor ? C.white : C.blue}
          />
        </group>
      ))}
    </group>
  );
}
function Field({
  coaches = false,
  ball = true,
}: {
  coaches?: boolean;
  ball?: boolean;
}) {
  return (
    <group>
      <Box p={[0, 0.025, 0]} s={[4, 0.05, 4.5]} color="#8ba785" />
      {[-1.85, 1.85].map((x) => (
        <Box key={x} p={[x, 0.055, 0]} s={[0.035, 0.01, 4.2]} color={C.white} />
      ))}
      {[-2, 0, 2].map((z) => (
        <Box key={z} p={[0, 0.06, z]} s={[3.7, 0.01, 0.035]} color={C.white} />
      ))}
      <Goal z={-1.95} />
      {ball && <SoccerBall p={[0.2, 0.32, 0.4]} scale={0.7} />}
      {coaches && (
        <>
          <Person p={[-2.4, 0, -0.7]} />
          <Person p={[-2.4, 0, 0.35]} />
          <Box p={[-2.15, 0.85, 0.45]} s={[0.28, 0.35, 0.04]} color={C.stone} />
        </>
      )}
    </group>
  );
}
function Church({ nashville = false }: { nashville?: boolean }) {
  return (
    <group>
      <Box
        p={[0, 1, 0]}
        s={[2.7, 2, 2.3]}
        color={nashville ? "#c58c79" : C.stone}
      />
      <mesh
        castShadow
        position={[0, 2.28, 0]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[1, 1, 1.1]}
      >
        <coneGeometry args={[2, 1.3, 4]} />
        <meshStandardMaterial color={C.roof} />
      </mesh>
      <Box p={[1.7, 1.8, -0.2]} s={[0.8, 3.6, 0.8]} color={C.stone} />
      <Cone p={[1.7, 4, -0.2]} s={[0.65, 1.15]} color={C.roof} vertices={4} />
      <Box p={[1.7, 4.75, -0.2]} s={[0.065, 0.6, 0.065]} color={C.gold} />
      <Box p={[1.7, 4.85, -0.2]} s={[0.36, 0.065, 0.065]} color={C.gold} />
      <Box p={[0, 0.55, 1.17]} s={[0.55, 1.1, 0.05]} color={C.dark} />
      {[-0.85, 0.85].map((x) => (
        <Box key={x} p={[x, 1.35, 1.18]} s={[0.3, 0.7, 0.04]} color={C.blue} />
      ))}
      <Sphere p={[0, 1.8, 1.19]} r={0.24} color={C.gold} scale={[1, 1, 0.14]} />
      <Box p={[0, 0.08, 1.65]} s={[3.2, 0.16, 0.9]} color={C.stone} />
    </group>
  );
}
function Campus() {
  return (
    <group>
      <Box p={[0, 0.95, 0]} s={[4.1, 1.9, 2.1]} color={C.brick} />
      <Box p={[0, 2.05, 0]} s={[1, 4.1, 1.25]} color={C.brick} />
      <Cone p={[0, 4.35, 0]} s={[0.86, 0.9]} color={C.roof} vertices={4} />
      <Sphere
        p={[0, 3.45, 0.65]}
        r={0.24}
        color={C.white}
        scale={[1, 1, 0.12]}
      />
      {[-1.5, -0.9, 0.9, 1.5].map((x) => (
        <Box key={x} p={[x, 1.25, 1.07]} s={[0.3, 0.65, 0.03]} color={C.blue} />
      ))}
      <Box p={[0, 0.55, 1.07]} s={[0.55, 1.1, 0.05]} color={C.dark} />
      <Tree p={[-2.8, 0, -0.4]} scale={0.85} />
    </group>
  );
}
function MusicFood() {
  return (
    <group>
      <Person p={[-1.8, 0, 0.4]} running />
      <group position={[0.2, 0, 0]}>
        <Cylinder p={[0, 0.8, 0]} r={0.07} h={1.6} color={C.dark} />
        <Cylinder p={[0, 1.6, 0]} r={0.8} h={0.07} color="#c4a37c" />
        <Cylinder p={[0, 1.67, 0]} r={0.35} h={0.05} color={C.white} />
        <Sphere p={[0, 1.76, 0]} r={0.18} color="#d4a264" scale={[1, 0.5, 1]} />
        <Cylinder p={[0.48, 1.8, 0.05]} r={0.1} h={0.3} color={C.blue} />
      </group>
      <group position={[2, 1.2, -0.3]} rotation={[0, 0, -0.18]}>
        <Sphere p={[0, 0, 0]} r={0.55} color="#b58a51" scale={[0.75, 1, 0.3]} />
        <Sphere
          p={[0, 0.55, 0]}
          r={0.4}
          color="#b58a51"
          scale={[0.85, 1, 0.3]}
        />
        <Box p={[0, 1.35, 0]} s={[0.14, 1.5, 0.11]} color={C.dark} />
        <Sphere p={[0, 0.3, 0.16]} r={0.16} color={C.dark} />
        {[-0.04, 0, 0.04].map((x) => (
          <Box
            key={x}
            p={[x, 0.8, 0.19]}
            s={[0.008, 2, 0.008]}
            color={C.stone}
          />
        ))}
      </group>
    </group>
  );
}
export function Landmark({ kind }: { kind: LandmarkKind }): ReactNode {
  switch (kind) {
    case "needle":
      return (
        <>
          <Cylinder p={[0, 1.7, 0]} r={0.1} h={3.4} />
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              castShadow
              position={[s * 0.23, 1.65, 0]}
              rotation={[0, 0, s * 0.08]}
            >
              <cylinderGeometry args={[0.045, 0.075, 3.3, 8]} />
              <meshStandardMaterial color={C.stone} />
            </mesh>
          ))}
          <mesh castShadow position={[0, 3.35, 0]}>
            <cylinderGeometry args={[0.85, 0.5, 0.25, 32]} />
            <meshStandardMaterial color={C.stone} />
          </mesh>
          <Sphere
            p={[0, 3.54, 0]}
            r={0.59}
            color={C.roof}
            scale={[1, 0.24, 1]}
          />
          <Cylinder p={[0, 3.9, 0]} r={0.035} h={0.7} />
          <Tree p={[-2, 0, 0.5]} />
          <Tree p={[1.8, 0, -0.7]} scale={0.8} />
        </>
      );
    case "lake":
      return (
        <>
          <Water />
          <Box p={[-1.5, 1.2, -1]} s={[0.12, 2.4, 0.12]} color={C.stone} />
          <Box p={[-0.5, 2.4, -1]} s={[2.2, 0.1, 0.5]} color={C.white} />
          {[0.3, 0.65, 1, 1.35, 1.7, 2.05].map((y) => (
            <Box
              key={y}
              p={[-1.65, y, -0.7]}
              s={[0.45, 0.04, 0.06]}
              color={C.roof}
            />
          ))}
          <Tree p={[2.4, 0, -2]} scale={0.85} />
        </>
      );
    case "rainier":
      return (
        <>
          <Cone p={[0, 1.6, 0]} s={[3.6, 3.2]} color="#9eaeb0" vertices={7} />
          <Cone p={[0, 2.7, 0]} s={[1.15, 1.08]} color={C.white} vertices={7} />
          <Cone
            p={[-2, 0.7, -0.6]}
            s={[1.8, 1.4]}
            color="#a8b8ac"
            vertices={7}
          />
          <Tree p={[2, 0, 1]} />
        </>
      );
    case "coast":
      return (
        <>
          <Water ocean />
          <Tree p={[0, 0, 0]} palm />
          <Tree p={[-1.7, 0, -1]} palm scale={0.7} />
          <Box p={[0, -0.005, 1.5]} s={[5, 0.05, 1.3]} color="#ded1ac" />
        </>
      );
    case "travel":
      return (
        <>
          <Box p={[0, 0.08, 0]} s={[5, 0.1, 1.5]} color="#b7b4a5" />
          <Box p={[0, 0.62, 0]} s={[2.8, 0.9, 1.1]} color={C.blue} />
          <Box p={[0.05, 1.18, 0]} s={[1.5, 0.5, 1]} color={C.blue} />
          <Box p={[0.05, 1.2, 0.51]} s={[1.25, 0.3, 0.03]} color={C.white} />
          {[-0.9, 0.9].flatMap((x) =>
            [-0.58, 0.58].map((z) => (
              <mesh
                key={`${x}-${z}`}
                position={[x, 0.3, z]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry args={[0.3, 0.3, 0.16, 16]} />
                <meshStandardMaterial color={C.dark} />
              </mesh>
            )),
          )}
          <Tree p={[-2.5, 0, -1.6]} palm scale={0.6} />
        </>
      );
    case "tournament":
      return (
        <>
          <Field coaches />
          <Tree p={[2.7, 0, -2]} palm scale={0.85} />
        </>
      );
    case "monument":
      return (
        <>
          <group position={[-1, 0, -1.8]}>
            <Box p={[0, 1.85, 0]} s={[0.6, 3.7, 0.6]} color={C.stone} />
            <Cone
              p={[0, 3.95, 0]}
              s={[0.425, 0.5]}
              color={C.stone}
              vertices={4}
            />
          </group>
          <group position={[1, 0, 1]} scale={0.65}>
            <Field ball={false} />
          </group>
        </>
      );
    case "medical":
      return (
        <>
          <Person p={[-0.8, 0, 0]} doctor />
          <Box p={[1, 0.65, -0.3]} s={[1.3, 1.3, 0.7]} color="#deded1" />
          <Box p={[1, 1.65, -0.3]} s={[0.14, 0.7, 0.1]} color="#91ada7" />
          <Box p={[1, 1.65, -0.3]} s={[0.65, 0.14, 0.1]} color="#91ada7" />
          <group position={[-1.8, 0, 0]} scale={0.75}>
            <Person />
          </group>
        </>
      );
    case "patrick":
      return <Church />;
    case "vanderbilt":
      return <Campus />;
    case "joy":
      return <MusicFood />;
    case "immaculate":
      return <Church nashville />;
    case "possibilities":
      return (
        <>
          <Box p={[-0.5, 1, 0]} s={[3, 2, 2]} color={C.stone} />
          <Cone
            p={[-0.5, 2.55, 0]}
            s={[2.2, 1.1]}
            color={C.roof}
            vertices={4}
          />
          <Tree p={[2.5, 0, 0]} scale={1.1} />
        </>
      );
  }
}
