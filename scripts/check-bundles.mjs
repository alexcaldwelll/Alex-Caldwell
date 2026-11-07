import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const argument = process.argv.indexOf('--dist');
const directory = resolve(argument < 0 ? 'dist' : process.argv[argument + 1]);
const limits = { initial: 95_000, desktopIncremental: 320_000, desktopTotal: 410_000, blogIndexTotal: 150_000, blogPostTotal: 190_000, allJavaScript: 500_000, allCss: 5_000 };
try {
  const manifest = JSON.parse(readFileSync(resolve(directory, '.vite/manifest.json'), 'utf8'));
  const sizes = new Map();
  const measure = file => {
    if (!sizes.has(file)) { const buffer = readFileSync(resolve(directory, file)); sizes.set(file, { file, bytes: buffer.length, gzipBytes: gzipSync(buffer, { level: 6 }).length }); }
    return sizes.get(file);
  };
  function dependencies(key, found = new Set()) {
    const chunk = manifest[key];
    if (!chunk) throw Error(`Missing required manifest entry: ${key}`);
    if (found.has(chunk.file)) return found;
    found.add(chunk.file);
    for (const imported of chunk.imports ?? []) dependencies(imported, found);
    return found;
  }
  const initial = dependencies('index.html');
  const desktop = dependencies('src/scenes/desktop/StoryExperience.tsx');
  if (initial.has(manifest['src/scenes/desktop/StoryExperience.tsx'].file)) throw Error('Desktop scene leaked into initial static/mobile dependency group');
  const js = files => [...files].filter(file => file.endsWith('.js')).reduce((sum, file) => sum + measure(file).gzipBytes, 0);
  const group = {
    initial: js(initial),
    desktopIncremental: js(new Set([...desktop].filter(file => !initial.has(file)))),
    desktopTotal: js(new Set([...desktop, ...initial])),
    blogIndexTotal: js(dependencies('src/routes/BlogPage.tsx')),
    blogPostTotal: js(dependencies('src/routes/BlogPostPage.tsx')),
  };
  const files = readdirSync(resolve(directory, 'assets')).map(file => `assets/${file}`);
  group.allJavaScript = js(new Set(files));
  group.allCss = files.filter(file => file.endsWith('.css')).reduce((sum, file) => sum + measure(file).gzipBytes, 0);
  const errors = Object.entries(group).filter(([key, bytes]) => bytes > limits[key]).map(([key, bytes]) => `${key} gzip budget exceeded (${bytes} > ${limits[key]} bytes)`);
  const report = { units: 'bytes; Node zlib gzip level 6 per file summed with shared dependencies counted once per group', limits, groups: group, files: [...sizes.values()], errors };
  console.log(process.argv.includes('--json') ? JSON.stringify(report) : JSON.stringify(report, null, 2));
  process.exitCode = errors.length ? 1 : 0;
} catch (error) { console.error(error.message); process.exitCode = 1; }
