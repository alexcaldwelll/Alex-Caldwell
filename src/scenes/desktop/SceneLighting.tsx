import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Object3D, Vector3 } from 'three';
import { writeStoryPosition, type SceneProgressProps } from './route';

/** A small moving studio rig keeps shadow resolution consistent along the long paper. */
export function SceneLighting({ progress, progressRef }: SceneProgressProps) {
  const root = useRef<Group>(null);
  const position = useRef(new Vector3());
  const target = useMemo(() => new Object3D(), []);
  useFrame(() => {
    writeStoryPosition(progressRef?.current ?? progress, position.current);
    root.current?.position.copy(position.current);
  });
  return <group ref={root}>
    <primitive object={target} />
    <ambientLight intensity={1.25} color="#fff8e9" />
    <hemisphereLight args={['#f4f5ff', '#d2c4aa', 1.6]} />
    <directionalLight target={target} castShadow position={[-8, 14, 6]} intensity={3.2} color="#fff4df" shadow-mapSize={[1024, 1024]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} shadow-bias={-0.0003} shadow-normalBias={0.035} />
  </group>;
}
