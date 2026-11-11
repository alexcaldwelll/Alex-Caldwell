import { parseDocument } from 'yaml';
import { postMetadataSchema, type BlogPost } from './schema';
export type { BlogPost } from './schema';

/** Invalid authoring input stays local to its file instead of breaking the blog. */
export function parsePosts(files: Record<string, string>): BlogPost[] {
  const posts: BlogPost[] = [];
  for (const [filename, raw] of Object.entries(files)) {
    try {
      const match = raw.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
      if (!match) throw new Error('Missing or unclosed frontmatter');
      const document = parseDocument(match[1], { uniqueKeys: true });
      if (document.errors.length) throw new Error('Malformed YAML frontmatter');
      const metadata = postMetadataSchema.parse(document.toJS({ maxAliasCount: 20 }));
      const slug = filename.split('/').pop()?.replace(/\.md$/, '');
      if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Use a lowercase, hyphenated Markdown filename');
      if (posts.some(post => post.slug === slug)) throw new Error('Duplicate post slug');
      posts.push({ ...metadata, slug, content: match[2].trim() });
    } catch {
      if (import.meta.env.DEV) console.warn(`[blog] Skipping invalid post: ${filename}`);
    }
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}
const posts = parsePosts(import.meta.glob<string>('./posts/*.md', { eager: true, query: '?raw', import: 'default' }));
export const getAllPosts = (): BlogPost[] => posts.map(post => ({ ...post, tags: post.tags ? [...post.tags] : undefined }));
export const getPostBySlug = (slug: string): BlogPost | undefined => getAllPosts().find(post => post.slug === slug);
