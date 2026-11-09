import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), {
    name: 'preview-prerendered-pages',
    configurePreviewServer({ config, middlewares }) {
      const output = resolve(config.root, config.build.outDir);
      middlewares.use((request, _response, next) => {
        if (request.url && (request.method === 'GET' || request.method === 'HEAD')) {
          const { pathname, search } = new URL(request.url, 'http://localhost');
          // Serve directory indexes at the public, slashless URL before Vite's SPA fallback.
          if (/^\/blog(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?$/.test(pathname) && existsSync(resolve(output, `.${pathname}/index.html`))) {
            request.url = `${pathname}/index.html${search}`;
          }
        }
        next();
      });
    },
  }, {
    name: 'development-static-html',
    apply: 'serve',
    // Develop and test the same complete initial HTML that the build emits.
    transformIndexHtml: {
      order: 'post',
      async handler(html, context) {
        if (!context.server) return html;
        const { render } = await context.server.ssrLoadModule('/src/entry-server.tsx');
        const styles = ['/src/styles/tokens.css', '/src/styles/global.css', '/src/scenes/shared/journey.css', '/src/scenes/desktop/desktop-story.css', ...((context.originalUrl ?? context.path).startsWith('/blog') ? ['/src/styles/blog.css'] : [])];
        const markup = await render(context.originalUrl ?? context.path);
        return html.replace('<div id="root"></div>', () => `<div id="root">${markup}</div>`).replace('</head>', () => `${styles.map(path => `<link rel="stylesheet" href="${path}">`).join('')}</head>`);
      },
    },
  }],
  build: { manifest: true },
});
