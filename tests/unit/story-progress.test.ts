import { describe, expect, it } from "vitest";
import {
  CHAPTER_DRAWINGS,
  getStoryState,
  sweepProgress,
  travelProgress,
} from "../../src/scenes/desktop/storyProgress";

describe("one continuous authored story", () => {
  it("starts on a blank page and reveals the road only after scrolling", () => {
    expect(getStoryState(0).road).toBe(0);
    expect(getStoryState(0).drawing).toBeNull();
    expect(getStoryState(0.015).road).toBeGreaterThan(0);
    expect(getStoryState(0.015).road).toBeLessThan(getStoryState(0.04).road);
  });
  it("visits Seattle, Charleston, DC, Nashville, then unfinished future", () => {
    expect(
      [0.1, 0.3, 0.5, 0.7, 0.9].map((p) => getStoryState(p).chapter),
    ).toEqual(["seattle", "charleston", "dc", "nashville", "future"]);
  });
  it("holds the road clock through one sweep per chapter", () => {
    expect(CHAPTER_DRAWINGS.map(({ chapter }) => chapter)).toEqual([
      "seattle", "charleston", "dc", "nashville", "future",
    ]);
    for (const drawing of CHAPTER_DRAWINGS) {
      const { chapter, approach, draw, finish, rejoin, roadStop } = drawing;
      expect(sweepProgress(drawing, approach)).toBe(0);
      expect(sweepProgress(drawing, (draw + finish) / 2)).toBeCloseTo(0.5);
      expect(sweepProgress(drawing, rejoin)).toBe(1);
      expect(travelProgress(draw)).toBe(roadStop);
      expect(travelProgress(finish)).toBe(roadStop);
      expect(getStoryState((draw + finish) / 2).drawing).toBe(chapter);
      expect(getStoryState(rejoin).drawing).toBeNull();
    }
  });
  it("retains the abandoned ball and faith after the fork", () => {
    expect(getStoryState(0.46).route).toBe("soccer");
    expect(getStoryState(0.57).route).toBe("new-road");
    expect(getStoryState(0.57).ballAbandoned).toBe(true);
    expect(getStoryState(0.7).faith).toBe(1);
    expect(getStoryState(0.95).faith).toBe(1);
  });
  it("keeps forward travel monotonic and progress bounded", () => {
    let previous = 0;
    for (let i = 0; i <= 10000; i++) {
      const p = travelProgress(i / 10000);
      expect(p).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = p;
    }
    expect(getStoryState(NaN)).toEqual(getStoryState(0));
    expect(getStoryState(2)).toEqual(getStoryState(1));
  });
});
