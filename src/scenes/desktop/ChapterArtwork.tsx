import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, ShaderMaterial, SRGBColorSpace, TextureLoader } from "three";
import type { SceneProgressProps } from "./route";
import type { StoryChapter } from "./sceneData";
import { artworkDrawing, artworkOpacity, inkFront, SWEEP_FEATHER } from "./artworkDrawing";

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
  uniform float contactV;
  uniform float bow;
  uniform float opacity;
  uniform float maskCharlestonFlight;
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
    float stroke = paperUv.x + bow * pow(abs(paperUv.y - contactV), 1.45);
    float painted = 1.0 - smoothstep(reveal - ${SWEEP_FEATHER}, reveal + ${SWEEP_FEATHER}, stroke);
    // The Charleston plane and contrails occupy an otherwise blank patch of sky.
    vec2 flightPatch = smoothstep(vec2(0.39, 0.744), vec2(0.40, 0.754), paperUv)
      * (1.0 - smoothstep(vec2(0.657, 0.869), vec2(0.667, 0.879), paperUv));
    float retained = 1.0 - maskCharlestonFlight * flightPatch.x * flightPatch.y;
    gl_FragColor = vec4(ink, pigment * edge.x * edge.y * painted * opacity * retained);
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
  const { id, poster } = chapter;
  const uniforms = useMemo(() => ({
    illustration: { value: null },
    reveal: { value: 0 },
    contactV: { value: 0 },
    bow: { value: 0 },
    opacity: { value: 0 },
    maskCharlestonFlight: { value: id === "charleston" ? 1 : 0 },
  }), [id]);
  const drawing = artworkDrawing(id);

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
    const opacity = artworkOpacity(drawing, p);
    mesh.current.visible = !!uniforms.illustration.value?.image && p > drawing.draw && opacity > 0;
    if (!mesh.current.visible) return;
    const { u, v, bow } = inkFront(drawing, p);
    uniforms.reveal.value = u;
    uniforms.contactV.value = v;
    uniforms.bow.value = bow;
    uniforms.opacity.value = opacity;
  });

  return (
    <mesh
      ref={mesh}
      name={`illustration-${id}`}
      visible={false}
      matrix={drawing.matrix}
      matrixAutoUpdate={false}
    >
      <planeGeometry args={[drawing.width, drawing.height]} />
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
