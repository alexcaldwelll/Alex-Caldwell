import { describe, expect, it } from 'vitest';
import { STORY_CHAPTERS } from '../../src/scenes/desktop/sceneData';

describe('story chapter metadata', () => {
  it('covers the complete journey with contiguous ranges in approved order', () => {
    expect(STORY_CHAPTERS.map(chapter => chapter.id)).toEqual(['seattle', 'charleston', 'dc', 'nashville', 'future']);
    expect(STORY_CHAPTERS[0].progressStart).toBe(0);
    expect(STORY_CHAPTERS.at(-1)?.progressEnd).toBe(1);
    STORY_CHAPTERS.forEach((chapter, index) => {
      expect(chapter.progressEnd).toBeGreaterThan(chapter.progressStart);
      if (index) expect(chapter.progressStart).toBe(STORY_CHAPTERS[index - 1].progressEnd);
      expect(chapter.poster).toMatch(/\.webp$/);
    });
  });
  it('preserves the soccer fork and the continuing faith motif', () => {
    expect(STORY_CHAPTERS.map(chapter => chapter.faithVisible)).toEqual([false, false, true, true, true]);
    expect(STORY_CHAPTERS[2].landmarks).toEqual(expect.arrayContaining(['soccer fork', 'ball on old route', "St. Patrick’s Church"]));
    expect(STORY_CHAPTERS[3].landmarks).toEqual(expect.arrayContaining(['Vanderbilt University', 'running', 'food', 'music', 'Church of the Immaculate Conception']));
  });
});
