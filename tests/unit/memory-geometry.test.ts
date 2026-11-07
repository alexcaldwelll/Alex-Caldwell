import { expect, it } from 'vitest';
import { Vector3 } from 'three';
import { createMemoryGeometry, updateMemoryGeometry } from '../../src/scenes/desktop/memoryGeometry';
import { MEMORY_EVENTS, memoryStrokes } from '../../src/scenes/desktop/storyProgress';
import { MEMORY_SKETCHES } from '../../src/assets/scenes/memorySketches';
import { MEMORY_PLACEMENTS, writePencilPosition } from '../../src/scenes/desktop/memoryRoute';

it('the rendered partial contour endpoint follows the pencil on intermediate edges and reverse scroll', () => {
  for (const event of MEMORY_EVENTS) {
    const points = MEMORY_SKETCHES[event.kind];
    const geometry = createMemoryGeometry(points);
    const positions = geometry.getAttribute('position');
    for (const phase of [0.17, 0.19, 0.27, 0.41, 0.51, 0.36]) {
      const p = event.start + event.duration * phase;
      const strokes = memoryStrokes(event, p);
      updateMemoryGeometry(geometry, points, strokes);
      expect(geometry.getAttribute('position')).toBe(positions);
      expect(geometry.drawRange.count).toBe(Math.ceil(strokes * (points.length - 1)) * 2);
      const end = geometry.drawRange.count - 1;
      const tip = writePencilPosition(p, new Vector3());
      const origin = MEMORY_PLACEMENTS[event.id];
      expect(positions.getX(end) + origin[0]).toBeCloseTo(tip.x, 5);
      expect(positions.getY(end) + origin[1] + 0.04).toBeCloseTo(tip.y, 5);
      expect(positions.getZ(end) + origin[2]).toBeCloseTo(tip.z, 5);
    }
    updateMemoryGeometry(geometry, points, memoryStrokes(event, 1));
    if (event.chapter === 'future') expect(geometry.drawRange.count).toBeLessThan(positions.count);
    updateMemoryGeometry(geometry, points, 0);
    expect(geometry.drawRange.count).toBe(0);
    geometry.dispose();
  }
});
