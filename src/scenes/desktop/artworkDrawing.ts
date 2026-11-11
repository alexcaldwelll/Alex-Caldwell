import { Euler, Matrix4, Vector3 } from "three";
import { sampleStoryRoute, writeStoryPosition } from "./route";
import { STORY_CHAPTERS, type StoryChapter } from "./sceneData";
import {
  activeDrawing,
  CHAPTER_DRAWINGS,
  drawingWeight,
  ease,
  sweepProgress,
  travelProgress,
} from "./storyProgress";

const FRAMING = {
  seattle: { side: -6, row: 0.36 },
  charleston: { side: 6, row: 0.4 },
  dc: { side: 8, row: 0.34 },
  nashville: { side: 6, row: 0.39 },
  future: { side: 5, row: 0.36 },
};

export const SWEEP_FEATHER = 0.025;
export const PENCIL_ROAD_HEIGHT = 0.045;

export const ARTWORK_DRAWINGS = CHAPTER_DRAWINGS.map((drawing) => {
  const chapter = STORY_CHAPTERS.find(({ id }) => id === drawing.chapter)!;
  const { side, row } = FRAMING[chapter.id];
  const width = chapter.id === "future" ? 24 : 26;
  const height = width * chapter.posterHeight / chapter.posterWidth;
  const [x, , z] = sampleStoryRoute(drawing.roadStop);
  const center = new Vector3(x + side, height / 2 + 1.15, z - 6);
  const matrix = new Matrix4()
    .makeRotationFromEuler(new Euler(-0.075, 0, 0))
    .setPosition(center);
  return { ...drawing, width, height, center, matrix, side, row };
});

export function artworkDrawing(chapter: StoryChapter["id"]) {
  return ARTWORK_DRAWINGS.find((drawing) => drawing.chapter === chapter)!;
}

type ArtworkDrawing = (typeof ARTWORK_DRAWINGS)[number];

export function inkFront(drawing: ArtworkDrawing, progress: number) {
  const sweep = sweepProgress(drawing, progress);
  return {
    u: -SWEEP_FEATHER + sweep * (1 + 2 * SWEEP_FEATHER),
    v: drawing.row + 0.035 * Math.sin(Math.PI * 2 * sweep),
    // Lead with the point of contact, then let the upper/lower edges catch up.
    bow: 0.38 * Math.sin(Math.PI * sweep),
  };
}

export function artworkOpacity(drawing: ArtworkDrawing, progress: number) {
  return 1 - ease((progress - drawing.leave) / (drawing.depart - drawing.leave));
}

export function artworkFraming(drawing: ArtworkDrawing, progress: number) {
  const start = drawing.approach - 0.012;
  return ease((progress - start) / (drawing.draw - start)) * artworkOpacity(drawing, progress);
}

export function writePencilPosition(progress: number, target: Vector3, contact: Vector3) {
  writeStoryPosition(travelProgress(progress), target);
  target.y += PENCIL_ROAD_HEIGHT;
  const drawing = activeDrawing(progress);
  if (drawing) {
    const placement = artworkDrawing(drawing.chapter);
    const { u, v } = inkFront(placement, progress);
    contact
      .set((u - 0.5) * placement.width, (v - 0.5) * placement.height, 0)
      .applyMatrix4(placement.matrix);
    target.lerp(contact, drawingWeight(drawing, progress));
  }
  return target;
}
