import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, ShaderMaterial, SRGBColorSpace, TextureLoader } from "three";
import { sampleStoryRoute, type SceneProgressProps } from "./route";
import type { StoryChapter } from "./sceneData";
import { ease, MEMORY_EVENTS } from "./storyProgress";

export const ARTWORK_OFFSETS = { seattle: -7, charleston: 7, dc: 7, nashville: 7, future: 7 };
const ARTWORK_CENTERS = { seattle: 0.105, charleston: 0.3, dc: 0.505, nashville: 0.705, future: 0.9 };

const vertexShader = `
  varying vec2 paperUv;
  void main() {
    paperUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D illustration;
  uniform float reveal;
  varying vec2 paperUv;
  void main() {
    vec3 ink = texture2D(illustration, paperUv).rgb;
    vec3 paper = mix(
      texture2D(illustration, vec2(0.02, paperUv.y)).rgb,
      texture2D(illustration, vec2(0.98, paperUv.y)).rgb,
      paperUv.x
    );
    // Key out the original cream paper while retaining soft shadows and graphite.
    float pigment = smoothstep(0.025, 0.17, length(ink - paper));
    vec2 edge = smoothstep(vec2(0.0), vec2(0.08), min(paperUv, 1.0 - paperUv));
    float stroke = paperUv.x * 0.65 + paperUv.y * 0.35;
    float painted = smoothstep(stroke - 0.09, stroke + 0.09, reveal);
    gl_FragColor = vec4(ink, pigment * edge.x * edge.y * painted);
    #include <colorspace_fragment>
  }
`;

export function ChapterArtwork({
  chapter,
  progress,
  progressRef,
}: SceneProgressProps & { chapter: StoryChapter }) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    illustration: { value: null },
    reveal: { value: 0 },
  }), []);
  const { id, poster, posterWidth, posterHeight, progressEnd } = chapter;
  const center = ARTWORK_CENTERS[id];
  const [x, , z] = sampleStoryRoute(center);
  const width = id === "future" ? 14 : 17;
  const height = width * posterHeight / posterWidth;
  const firstMemory = MEMORY_EVENTS.find((event) => event.chapter === id)!;

  useEffect(() => {
    const shader = material.current!;
    const texture = new TextureLoader().load(poster);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    shader.uniforms.illustration.value = texture;
    return () => {
      shader.uniforms.illustration.value = null;
      texture.dispose();
    };
  }, [poster]);

  useFrame(() => {
    if (!mesh.current || !material.current) return;
    const uniforms = material.current.uniforms;
    const p = progressRef?.current ?? progress;
    const texture = uniforms.illustration.value;
    const start = firstMemory.start + firstMemory.duration * 0.32;
    mesh.current.visible = !!texture?.image && p > start && p < progressEnd + 0.045;
    if (mesh.current.visible)
      uniforms.reveal.value = 1.12 * ease((p - start) / (id === "future" ? 0.09 : 0.115));
  });

  return (
    <mesh
      ref={mesh}
      name={`illustration-${id}`}
      visible={false}
      position={[x + ARTWORK_OFFSETS[id], height * 0.42, z - 2.5]}
      rotation={[-0.24, 0.14, 0]}
    >
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
