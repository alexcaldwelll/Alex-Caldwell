import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { MarkdownContent } from '../../src/components/blog/MarkdownContent';
import { BlogCard } from '../../src/components/blog/BlogCard';
import { AppRoutes } from '../../src/AppLayout';
import { BlogPage } from '../../src/routes/BlogPage';
import { BlogPostPage } from '../../src/routes/BlogPostPage';
afterEach(cleanup);
it('renders Markdown while ignoring raw HTML and unsafe links', () => {
  const { container } = render(<MarkdownContent content={'## A heading\n\n**Readable**\n\n<script>alert(1)</script>\n\n[unsafe](javascript:alert(1))'} />);
  expect(screen.getByRole('heading', { name: 'A heading' })).toBeDefined();
  expect(container.querySelector('strong')?.textContent).toBe('Readable');
  expect(container.querySelector('script')).toBeNull();
  expect(container.querySelector('[href^="javascript:"]')).toBeNull();
});
it('renders long titles and excerpts without requiring a cover', () => {
  const title = 'A long title '.repeat(30);
  const { container } = render(<MemoryRouter><BlogCard post={{ slug: 'long', title, date: '2026-11-06', excerpt: 'Long excerpt '.repeat(100), content: '' }} /></MemoryRouter>);
  expect(screen.getByRole('link', { name: title.trim() }).getAttribute('href')).toBe('/blog/long');
  expect(container.querySelector('img')).toBeNull();
  expect(container.querySelector('.blog-card')).not.toBeNull();
});
it('renders a useful not-found state for an unknown post', async () => {
  render(<MemoryRouter initialEntries={['/blog/unknown']}><AppRoutes pages={{ BlogPage, BlogPostPage }} /></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: 'Post not found' })).toBeDefined();
  expect(screen.getByRole('link', { name: 'Back to Blog' }).getAttribute('href')).toBe('/blog');
});

it('renders the sample reader at its stable URL', async () => {
  render(<MemoryRouter initialEntries={['/blog/first-note']}><AppRoutes pages={{ BlogPage, BlogPostPage }} /></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: 'A first note — sample post' })).toBeDefined();
  expect(screen.getByText('sample post', { selector: 'strong' })).toBeDefined();
});
