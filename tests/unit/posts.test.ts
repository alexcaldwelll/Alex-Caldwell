import { describe, expect, it, vi } from 'vitest';
import { getAllPosts, getPostBySlug, parsePosts } from '../../src/content/posts';
const note = (date = '2026-11-06') => `---\ntitle: A note\ndate: ${date}\nexcerpt: A short introduction.\ntags: [Notes]\n---\nHello **reader**.`;
describe('Markdown posts', () => {
  it('validates metadata and uses filenames for stable slugs', () => {
    expect(parsePosts({ './posts/a-note.md': note() })[0]).toEqual({ slug: 'a-note', title: 'A note', date: '2026-11-06', excerpt: 'A short introduction.', tags: ['Notes'], content: 'Hello **reader**.' });
  });
  it('sorts newest first', () => {
    expect(parsePosts({ './posts/old.md': note('2025-01-01'), './posts/new.md': note() }).map(p => p.slug)).toEqual(['new', 'old']);
  });
  it('excludes malformed and invalid metadata without crashing and warns in development', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(parsePosts({ 'missing.md': '---\ntitle: Missing\n---\ntext', 'broken.md': '---\ntitle: [broken\n---\ntext', 'date.md': note('2026-02-30'), 'tags.md': note().replace('[Notes]', 'wrong-type'), 'cover.md': note().replace('tags: [Notes]', 'coverImage: javascript:alert(1)') })).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(5);
    warn.mockRestore();
  });
  it('loads the labeled sample and returns undefined for unknown slugs', () => {
    expect(getAllPosts()[0].title).toMatch(/sample/i);
    expect(getPostBySlug('no-such-post')).toBeUndefined();
  });
});
