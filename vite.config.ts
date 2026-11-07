import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), {
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
