import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PENCIL_DESIGN, getPencilPose } from '../../src/scenes/desktop/Pencil';
import { getRoadReveal, ROAD_ROUTES, sampleStoryRoute } from '../../src/scenes/desktop/Road';
import { bindResourceLifecycle } from '../../src/scenes/desktop/ResourceLifecycle';
import { StoryCanvas } from '../../src/scenes/desktop/StoryCanvas';
import { DesktopStory, DESKTOP_STORY_QUERY } from '../../src/scenes/desktop/DesktopStory';

const canvasState = vi.hoisted(() => ({ fail: false }));
vi.mock('@react-three/fiber', () => ({
  Canvas: () => { if (canvasState.fail) throw new Error('WebGL initialization failed'); return <canvas data-testid="webgl" />; },
  useFrame: vi.fn(),
  useThree: vi.fn(),
}));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
beforeEach(() => { canvasState.fail = false; });

describe('authored pencil and route', () => {
  it('retains the same realistic material palette and proportions for every progress', () => {
    const design = JSON.stringify(PENCIL_DESIGN);
    for (const progress of [0, 0.2, 0.49, 0.75, 1]) {
      const pose = getPencilPose(progress);
      expect(pose.position.every(Number.isFinite)).toBe(true);
      expect(JSON.stringify(PENCIL_DESIGN)).toBe(design);
    }
    expect(PENCIL_DESIGN.barrel.radialSegments).toBe(6);
    expect(PENCIL_DESIGN.eraser.color).toBe('#d98d9a');
    expect(PENCIL_DESIGN.ferrule.metalness).toBeGreaterThan(0.8);
    expect(PENCIL_DESIGN.barrel.length / PENCIL_DESIGN.barrel.radius).toBeGreaterThan(18);
  });
  it('has a continuous automatic DC branch while the soccer road continues', () => {
    expect(ROAD_ROUTES.map(route => route.id)).toEqual(['soccer', 'new-road']);
    expect(getRoadReveal(0)).toEqual({ opacity: 0, soccer: 0, branch: 0 });
    expect(getRoadReveal(0.8).branch).toBeGreaterThan(0);
    const before = sampleStoryRoute(0.48 - 0.00001);
    const after = sampleStoryRoute(0.48 + 0.00001);
    expect(Math.hypot(...before.map((n, i) => n - after[i]))).toBeLessThan(0.02);
    expect(sampleStoryRoute(1)[0]).toBeLessThan(0);
    expect(ROAD_ROUTES[0].points.at(-1)![0]).toBeGreaterThan(0);
  });
});

describe('desktop boundary and renderer lifecycle', () => {
  it('calls the fallback on renderer initialization failure and preserves the poster', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    canvasState.fail = true;
    const onContextFailure = vi.fn();
    render(<StoryCanvas progress={0} reducedMotion={false} onContextFailure={onContextFailure} />);
    await waitFor(() => expect(onContextFailure).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('img', { name: /yellow pencil/i })).toBeDefined();
    expect(screen.queryByTestId('webgl')).toBeNull();
  });
  it.each([false, true])('does not request the lazy scene on an ineligible viewport (reduced motion %s)', async reducedMotion => {
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query.includes('prefers-reduced-motion') ? reducedMotion : false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    const loadScene = vi.fn();
    render(<DesktopStory progress={0} loadScene={loadScene} />);
    expect(loadScene).not.toHaveBeenCalled();
    expect(DESKTOP_STORY_QUERY).toContain('(pointer: fine)');
    expect(screen.getByRole('img', { name: /yellow pencil/i })).toBeDefined();
    vi.unstubAllGlobals();
  });
  it('does not request the lazy scene for reduced motion on desktop', () => {
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query.includes('prefers-reduced-motion') || query === DESKTOP_STORY_QUERY, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    const loadScene = vi.fn();
    render(<DesktopStory progress={0} loadScene={loadScene} />);
    expect(loadScene).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
  it('requests the scene only on eligible desktop and keeps the pencil poster while loading', async () => {
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query === DESKTOP_STORY_QUERY, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    const loadScene = vi.fn(() => new Promise<{ default: typeof StoryCanvas }>(() => {}));
    render(<DesktopStory progress={0} loadScene={loadScene} />);
    await waitFor(() => expect(loadScene).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('img', { name: /yellow pencil/i })).toBeDefined();
  });
  it('pauses offscreen and hidden rendering, fails on context loss, and removes all listeners', () => {
    let intersection!: IntersectionObserverCallback;
    const disconnect = vi.fn();
    vi.stubGlobal('IntersectionObserver', class { constructor(callback: IntersectionObserverCallback) { intersection = callback; } observe() {} disconnect = disconnect; });
    const element = document.createElement('canvas');
    const onActive = vi.fn();
    const onFailure = vi.fn();
    const remove = vi.spyOn(element, 'removeEventListener');
    const release = bindResourceLifecycle(element, onActive, onFailure);
    intersection([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(onActive).toHaveBeenLastCalledWith(false);
    intersection([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(onActive).toHaveBeenLastCalledWith(true);
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(onActive).toHaveBeenLastCalledWith(false);
    element.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    expect(onFailure).toHaveBeenCalledTimes(1);
    release();
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith('webglcontextlost', expect.any(Function));
    visibility.mockRestore();
    vi.unstubAllGlobals();
  });
});
