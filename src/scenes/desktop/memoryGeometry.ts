import { BufferGeometry, Float32BufferAttribute } from 'three';
type Point = readonly [number, number, number];

export function createMemoryGeometry(points: readonly Point[]) {
  const vertices: number[] = [];
  for (let i = 1; i < points.length; i++) vertices.push(...points[i - 1], ...points[i]);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geometry.setDrawRange(0, 0);
  geometry.userData.partialEdge = -1;
  return geometry;
}

/** Restore the previous edge, then move only this edge's endpoint; no frame allocations. */
export function updateMemoryGeometry(geometry: BufferGeometry, points: readonly Point[], strokes: number) {
  const positions = geometry.getAttribute('position');
  const previous = geometry.userData.partialEdge as number;
  if (previous >= 0) {
    const b = points[previous + 1];
    positions.setXYZ(previous * 2 + 1, b[0], b[1], b[2]);
  }
  const t = Math.max(0, Math.min(1, strokes)) * (points.length - 1);
  const edge = Math.min(points.length - 2, Math.floor(t));
  const blend = t - edge;
  const a = points[edge], b = points[edge + 1];
  positions.setXYZ(edge * 2 + 1, a[0] + (b[0] - a[0]) * blend, a[1] + (b[1] - a[1]) * blend, a[2] + (b[2] - a[2]) * blend);
  geometry.userData.partialEdge = edge;
  positions.needsUpdate = true;
  geometry.setDrawRange(0, Math.ceil(t) * 2);
}
