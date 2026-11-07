import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';

// Decimal bytes/kB, decoded pixels; these are delivery limits, not GPU/FPS claims.
const limits = { rasterBytes: 200_000, rasterPixels: 2_000_000, geometryBytes: 1_000_000, fontBytes: 150_000, sceneBytes: 1_200_000, totalRasterBytes: 900_000 };
const media = /\.(?:webp|png|jpe?g|gif|avif|svg|glb|gltf|bin|woff2?|ttf|otf|hdr|ktx2?)$/i;
const raster = /\.(?:webp|png|jpe?g|gif|avif)$/i;
const font = /\.(?:woff2?|ttf|otf)$/i;
const geometry = /\.(?:glb|gltf|bin)$/i;
const rootIndex = process.argv.indexOf('--root');
const root = resolve(rootIndex < 0 ? '.' : process.argv[rootIndex + 1]);
const errors = [];
const files = [];
function walk(directory) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.isFile()) files.push(file);
    else errors.push(`${relative(root, file)}: symlink assets are not supported`);
  }
}
walk(resolve(root, 'src')); walk(resolve(root, 'public'));
if (existsSync(resolve(root, 'index.html'))) files.push(resolve(root, 'index.html'));
const local = path => {
  const file = resolve(root, path);
  if (!file.startsWith(root + '/')) throw Error(`Asset path escapes repository: ${path}`);
  return file;
};
function dimensions(buffer, extension) {
  if (extension === '.png' && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
  if (extension === '.gif' && buffer.toString('ascii', 0, 3) === 'GIF') return [buffer.readUInt16LE(6), buffer.readUInt16LE(8)];
  if (extension === '.webp' && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    const kind = buffer.toString('ascii', 12, 16);
    if (kind === 'VP8X') return [buffer.readUIntLE(24, 3) + 1, buffer.readUIntLE(27, 3) + 1];
    if (kind === 'VP8 ') return [buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff];
    if (kind === 'VP8L') { const bits = buffer.readUInt32LE(21); return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1]; }
  }
  if (/^\.jpe?g$/.test(extension) && buffer.readUInt16BE(0) === 0xffd8) {
    let offset = 2;
    while (offset + 8 < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) return [buffer.readUInt16BE(offset + 7), buffer.readUInt16BE(offset + 5)];
      const length = buffer.readUInt16BE(offset + 2);
      if (length < 2) break;
      offset += length + 2;
    }
  }
  // Unsupported formats fail closed until a reviewed decoder is supplied.
  throw Error('unrecognized raster header (AVIF needs a reviewed dimension decoder)');
}
try {
  const policy = JSON.parse(readFileSync(local('asset-policy.json'), 'utf8'));
  if (!Array.isArray(policy.assets) || !Array.isArray(policy.scenes)) throw Error('Expected assets and scenes arrays');
  const records = new Map();
  for (const asset of policy.assets) {
    if (records.has(asset.path)) errors.push(`${asset.path}: duplicate provenance entry`);
    records.set(asset.path, asset);
    if (!['authored', 'generated', 'licensed'].includes(asset.origin) || !asset.source?.trim() || !asset.license?.trim()) errors.push(`${asset.path}: missing or incomplete provenance`);
    if (/^(?:https?:|\/\/)/.test(asset.path)) errors.push(`${asset.path}: remote asset requires a local file for reproducible existence and size checks`);
    else if (!existsSync(local(asset.path))) errors.push(`${asset.path}: missing manifest reference`);
  }
  let rasterBytes = 0;
  const measured = [];
  for (const file of files.filter(file => media.test(file))) {
    const path = relative(root, file), size = statSync(file).size, asset = records.get(path);
    if (!asset || !['authored', 'generated', 'licensed'].includes(asset.origin) || !asset.source?.trim() || !asset.license?.trim()) errors.push(`${path}: missing or incomplete provenance`);
    if (asset?.origin === 'licensed' || font.test(file)) {
      if (!asset?.licenseFile || !existsSync(local(asset.licenseFile)) || !readFileSync(local(asset.licenseFile), 'utf8').trim()) errors.push(`${path}: missing redistributable license file`);
    }
    const measurement = { path, bytes: size };
    if (raster.test(file)) {
      rasterBytes += size;
      if (size > limits.rasterBytes) errors.push(`${path}: raster byte budget exceeded (${size} > ${limits.rasterBytes})`);
      try {
        const [width, height] = dimensions(readFileSync(file), extname(file).toLowerCase());
        Object.assign(measurement, { width, height });
        if (!width || !height || width * height > limits.rasterPixels) errors.push(`${path}: raster pixel budget exceeded (${width}x${height})`);
      } catch (error) { errors.push(`${path}: ${error.message}`); }
    }
    if (geometry.test(file) && size > limits.geometryBytes) errors.push(`${path}: geometry budget exceeded (${size} > ${limits.geometryBytes})`);
    if (font.test(file) && size > limits.fontBytes) errors.push(`${path}: font byte budget exceeded`);
    measured.push(measurement);
  }
  if (rasterBytes > limits.totalRasterBytes) errors.push(`Total raster byte budget exceeded (${rasterBytes} > ${limits.totalRasterBytes})`);
  for (const scene of policy.scenes) {
    if (!scene.id || !Array.isArray(scene.files) || !scene.files.length) { errors.push('Scene needs id and files'); continue; }
    let bytes = 0;
    for (const path of new Set(scene.files)) {
      const file = local(path);
      if (!existsSync(file)) errors.push(`${scene.id}: missing scene reference ${path}`);
      else bytes += statSync(file).size;
      if (!records.has(path)) errors.push(`${path}: scene asset lacks provenance`);
    }
    if (bytes > limits.sceneBytes) errors.push(`${scene.id}: scene budget exceeded (${bytes} > ${limits.sceneBytes})`);
  }
  // Inspect literal asset URLs across application imports, JSX/CSS, Markdown and
  // frontmatter independently of the manifest. New missing references cannot hide.
  const reference = /(?:["'`(]|:\s*)([^\s"'`()<>]+\.(?:webp|png|jpe?g|gif|avif|svg|glb|gltf|bin|woff2?|ttf|otf|hdr|ktx2?)(?:[?#][^\s"'`()<>]*)?)/gi;
  for (const file of files.filter(file => /\.(?:[cm]?[jt]sx?|css|md|html)$/.test(file))) {
    const content = readFileSync(file, 'utf8');
    const pattern = file.endsWith('.md') ? /(?:!\[[^\]]*\]\(|coverImage:\s*["']?)([^\s"'()<>]+)/g : reference;
    for (const match of content.matchAll(pattern)) {
      const url = match[1].split(/[?#]/)[0];
      if (/^(?:https?:|data:|\/\/)/.test(url)) {
        errors.push(`${relative(root, file)}: remote asset ${url} requires a local file for reproducible existence and size checks`);
        continue;
      }
      const target = url.startsWith('/') ? local(`public${url}`) : resolve(dirname(file), url);
      if (!target.startsWith(root + '/') || !existsSync(target)) errors.push(`${relative(root, file)}: missing asset reference ${url}`);
    }
  }
  const report = { limits, assets: measured, totalRasterBytes: rasterBytes, errors };
  console.log(process.argv.includes('--json') ? JSON.stringify(report) : `${measured.map(asset => `${asset.path}: ${asset.bytes} bytes${asset.width ? `, ${asset.width}x${asset.height}` : ''}`).join('\n')}\nRaster total: ${rasterBytes} bytes\n${errors.length ? errors.join('\n') : 'Asset policy passed.'}`);
} catch (error) { errors.push(error.message); console.error(error.message); }
process.exitCode = errors.length ? 1 : 0;
