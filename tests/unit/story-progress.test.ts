import { describe, expect, it } from "vitest";
import {
  getStoryState,
  getMemoryState,
  MEMORY_EVENTS,
  travelProgress,
} from "../../src/scenes/desktop/storyProgress";

describe("one continuous authored story", () => {
  it("starts on a blank page and reveals the road only after scrolling", () => {
    expect(getStoryState(0).road).toBe(0);
    expect(getStoryState(0).memory).toBeNull();
    expect(getStoryState(0.015).road).toBeGreaterThan(0);
    expect(getStoryState(0.015).road).toBeLessThan(getStoryState(0.04).road);
  });
  it("visits Seattle, Charleston, DC, Nashville, then unfinished future", () => {
    expect(
      [0.1, 0.3, 0.5, 0.7, 0.9].map((p) => getStoryState(p).chapter),
    ).toEqual(["seattle", "charleston", "dc", "nashville", "future"]);
  });
  it("traces recognizable strokes before color/volume and pauses travel to draw", () => {
    for (const event of MEMORY_EVENTS) {
      const early = getMemoryState(event, event.start + event.duration * 0.3);
      expect(early.strokes).toBeGreaterThan(0);
      expect(early.volume).toBe(0);
      expect(
        getMemoryState(event, event.start + event.duration * 0.8).volume,
      ).toBeGreaterThan(0);
      expect(travelProgress(event.start + event.duration * 0.25)).toBeCloseTo(
        travelProgress(event.start + event.duration * 0.55),
        5,
      );
    }
  });
  it("retains the abandoned ball and faith after the fork", () => {
    expect(getStoryState(0.46).route).toBe("soccer");
    expect(getStoryState(0.57).route).toBe("new-road");
    expect(getStoryState(0.57).ballAbandoned).toBe(true);
    expect(getStoryState(0.7).faith).toBe(1);
    expect(getStoryState(0.95).faith).toBe(1);
  });
  it("ends with incomplete outlines and bounded progress, including reverse scroll", () => {
    const future = MEMORY_EVENTS.filter((e) => e.chapter === "future");
    expect(future.length).toBeGreaterThan(0);
    expect(future.every((e) => getMemoryState(e, 1).strokes < 1)).toBe(true);
    expect(getStoryState(NaN)).toEqual(getStoryState(0));
    expect(getStoryState(2)).toEqual(getStoryState(1));
    expect(getMemoryState(MEMORY_EVENTS[0], 0).volume).toBe(0);
  });
});

describe("pencil contour geometry", () => {
  it("places the actual tip on the shared outline, then returns it to the road", async () => {
    const { Vector3 } = await import("three");
    const { writePencilPosition, MEMORY_PLACEMENTS } = await import(
      "../../src/scenes/desktop/memoryRoute"
    );
    const { MEMORY_SKETCHES } = await import(
      "../../src/assets/scenes/memorySketches"
    );
    const { sampleStoryRoute } = await import("../../src/scenes/desktop/route");
    for (const event of MEMORY_EVENTS) {
      const p = event.start + event.duration * 0.4,
        points = MEMORY_SKETCHES[event.kind];
      const t = getMemoryState(event, p).strokes * (points.length - 1),
        i = Math.floor(t),
        f = t - i,
        origin = MEMORY_PLACEMENTS[event.id];
      const actual = writePencilPosition(p, new Vector3());
      expect(actual.x).toBeCloseTo(
        origin[0] + points[i][0] + (points[i + 1][0] - points[i][0]) * f,
        5,
      );
      expect(actual.y).toBeCloseTo(
        origin[1] + points[i][1] + (points[i + 1][1] - points[i][1]) * f + 0.04,
        5,
      );
      const end = event.start + event.duration;
      expect(writePencilPosition(end, new Vector3()).toArray()).toEqual(
        sampleStoryRoute(end),
      );
    }
  });
  it("keeps forward travel monotonic across every dwell", () => {
    let previous = 0;
    for (let i = 0; i <= 10000; i++) {
      const p = travelProgress(i / 10000);
      expect(p).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = p;
    }
  });
});
