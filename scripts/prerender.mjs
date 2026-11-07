import { build } from 'vite';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const serverDir = resolve('.prerender');
try {
  await build({ build: { ssr: 'src/entry-server.tsx', outDir: serverDir, manifest: false } });
  const { render, prerenderPaths } = await import(pathToFileURL(resolve(serverDir, 'entry-server.js')).href);
  const template = await readFile('dist/index.html', 'utf8');
  const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
  const paths = prerenderPaths();
  await writeFile('dist/prerender-paths.json', JSON.stringify(paths));
  for (const path of paths) {
    // The initial lazy reader needs its stylesheet before JavaScript (or without it).
    const route = path === '/blog' ? 'src/routes/BlogPage.tsx' : path.startsWith('/blog/') ? 'src/routes/BlogPostPage.tsx' : 'src/main.tsx';
    const styles = new Set();
    const visit = key => {
      const chunk = manifest[key];
      if (!chunk) return;
      chunk.css?.forEach(css => styles.add(css));
      chunk.imports?.forEach(visit);
    };
    visit(route);
    const links = [...styles].filter(css => !template.includes(`/${css}`)).map(css => `<link rel="stylesheet" href="/${css}">`).join('');
    const markup = await render(path);
    const html = template.replace('<div id="root"></div>', () => `<div id="root">${markup}</div>`).replace('</head>', () => `${links}</head>`);
    const destination = resolve('dist', `.${path === '/' ? '' : path}/index.html`);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, html);
    console.log(`Prerendered ${path}`);
  }
} finally {
  await rm(serverDir, { recursive: true, force: true });
}
