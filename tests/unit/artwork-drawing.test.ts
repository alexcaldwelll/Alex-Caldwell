import { expect, it } from "vitest";
import { Vector3 } from "three";
import {
  ARTWORK_DRAWINGS,
  artworkOpacity,
  inkFront,
  PENCIL_ROAD_HEIGHT,
  SWEEP_FEATHER,
  writePencilPosition,
} from "../../src/scenes/desktop/artworkDrawing";
import { writeStoryPosition } from "../../src/scenes/desktop/route";

it("puts graphite on the ink front in image space while scrolling in either direction", () => {
  const tip = new Vector3();
  const contact = new Vector3();
  for (const drawing of ARTWORK_DRAWINGS) {
    const { draw, finish, matrix, width, height } = drawing;
    const inverse = matrix.clone().invert();
    for (const phase of [0, 0.22, 0.5, 0.78, 1, 0.78, 0.5, 0.22, 0]) {
      const p = draw + phase * (finish - draw);
      const front = inkFront(drawing, p);
      writePencilPosition(p, tip, contact).applyMatrix4(inverse);
      expect(tip.x / width + 0.5).toBeCloseTo(front.u, 8);
      expect(tip.y / height + 0.5).toBeCloseTo(front.v, 8);
      expect(tip.z).toBeCloseTo(0, 8);
    }
    expect(inkFront(drawing, draw).u).toBe(-SWEEP_FEATHER);
    expect(inkFront(drawing, finish).u).toBeCloseTo(1 + SWEEP_FEATHER);
  }
});

it("joins the road continuously and leaves the finished drawing visible at its hold", () => {
  const tip = new Vector3();
  const contact = new Vector3();
  for (const drawing of ARTWORK_DRAWINGS) {
    for (const boundary of [drawing.approach, drawing.rejoin]) {
      const road = writeStoryPosition(boundary, new Vector3());
      road.y += PENCIL_ROAD_HEIGHT;
      for (const delta of [-1e-7, 0, 1e-7]) {
        writePencilPosition(boundary + delta, tip, contact);
        expect(tip.distanceTo(road)).toBeLessThan(0.0001);
      }
    }
    expect(artworkOpacity(drawing, drawing.leave)).toBe(1);
    expect(artworkOpacity(drawing, drawing.depart)).toBe(0);
  }
  expect(artworkOpacity(ARTWORK_DRAWINGS.at(-1)!, 1)).toBe(1);
});
