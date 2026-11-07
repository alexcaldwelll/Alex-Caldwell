import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/** Small imperative boundary that can be tested without a GPU. */
export function bindResourceLifecycle(element: HTMLCanvasElement, onActive: (active: boolean) => void, onFailure: () => void) {
  let visible = true;
  let failed = false;
  const update = () => onActive(!failed && visible && document.visibilityState !== 'hidden');
  const lost = (event: Event) => {
    event.preventDefault();
    if (failed) return;
    failed = true;
    update();
    onFailure();
  };
  const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? false;
    update();
  }, { rootMargin: '0px' });
  observer?.observe(element);
  document.addEventListener('visibilitychange', update);
  element.addEventListener('webglcontextlost', lost);
  update();
  return () => {
    observer?.disconnect();
    document.removeEventListener('visibilitychange', update);
    element.removeEventListener('webglcontextlost', lost);
  };
}

export function ResourceLifecycle({ onContextFailure }: { onContextFailure: () => void }) {
  const gl = useThree(state => state.gl);
  const setFrameloop = useThree(state => state.setFrameloop);
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => bindResourceLifecycle(gl.domElement, active => {
    setFrameloop(active ? 'always' : 'never');
    if (active) invalidate();
  }, onContextFailure), [gl, setFrameloop, invalidate, onContextFailure]);
  // R3F owns declarative geometries/materials and disposes them plus the renderer on unmount.
  return null;
}
