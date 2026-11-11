/// <reference types="node" />
import { StrictMode } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { PassThrough } from 'node:stream';
import { StaticRouter } from 'react-router-dom';
import { BlogPage } from './routes/BlogPage';
import { BlogPostPage } from './routes/BlogPostPage';
import { AppLayout } from './AppLayout';
import { getAllPosts } from './content/posts';

export const prerenderPaths = () => ['/', '/blog', ...getAllPosts().map(post => `/blog/${post.slug}`)];
export const siteBase = import.meta.env.BASE_URL;

export function render(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const output = new PassThrough();
    let html = '';
    output.setEncoding('utf8');
    output.on('data', chunk => { html += chunk; });
    output.on('end', () => resolve(html));
    output.on('error', reject);
    const stream = renderToPipeableStream(<StrictMode><StaticRouter basename={siteBase} location={url}><AppLayout pages={{ BlogPage, BlogPostPage }} /></StaticRouter></StrictMode>, {
      // Do not pipe the shell: no fallback or streaming replacement scripts in static HTML.
      onAllReady() { stream.pipe(output); },
      onShellError: reject,
      onError: reject,
    });
  });
}
