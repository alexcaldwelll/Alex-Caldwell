# Alexandra — Personal Website

A personal website and Markdown blog. Home follows one yellow pencil through Seattle, Charleston, Washington, DC, Nashville, and an intentionally unfinished future. Desktop visitors with motion enabled receive a scroll-driven Three.js story; mobile, reduced-motion, no-JavaScript, and unavailable-WebGL visitors receive the complete illustrated journey. Home and Blog are the two primary destinations, with individual readers under `/blog/:slug`.

Built with React, TypeScript, Vite, React Three Fiber, Three.js, GSAP/ScrollTrigger, and one Lenis instance on eligible desktop Home. React's native view transitions provide restrained navigation and shared post titles. System fonts require no font downloads.

## Develop and check

Use **Node 24** (verified with 24.18.0) and npm. The lockfile is committed.

```sh
npm ci
npm run dev
```

Before release, run the same sequence as `.github/workflows/ci.yml`:

```sh
npm run lint
npm run typecheck
npm test -- --run
npm run check:assets
npm run build
npm run check:bundles
npx playwright install --with-deps chromium
npm run test:e2e
```

The build emits complete HTML for `/`, `/blog`, and every valid Markdown post, listed in `dist/prerender-paths.json`. It then removes its temporary server bundle. `dist/` is generated and never committed. Production checks serve the actual built HTML on an isolated temporary port and verify no-JavaScript reading, initial styles, delayed hydration, and literal authored dollar sequences.

The default browser suite uses Playwright's installed Chromium and explicit SwiftShader software WebGL. It starts its own Vite server on strict port **5188**, or reuses that server locally; CI always starts it. It never needs a running server on 5173, user-installed Chrome, or a hardware GPU. The 3D gate requires the actual canvas, colored pencil/chapter pixels and real WebGL draw calls; fallback alone fails that gate. Separate tests verify intentional fallback behavior. Software-rendering timings are not hardware performance results.

For the optional local hardware diagnostic, start a development server separately and run:

```sh
npm run dev -- --port 5173 --strictPort
# In a second terminal, with Google Chrome installed:
npm run test:hardware
```

`HARDWARE_BASE_URL` can select another development-server address. This opt-in diagnostic uses hardware Chrome, Vite development module URLs and private R3F state for detailed geometry/renderer inspection. It rejects SwiftShader/llvmpipe and is deliberately excluded from portable CI.

The lint toolchain is pinned to ESLint 10.14.0, typescript-eslint 8.72.1 and TypeScript 6.0.3: the parser's supported TypeScript range is `>=4.8.4 <6.1.0`. Strict type checking remains enabled. No unsupported-parser warnings are suppressed.

## Author posts and assets

Add `src/content/posts/a-hyphenated-slug.md` with YAML frontmatter:

```md
---
title: A title
date: 2026-11-07
excerpt: A short introduction.
tags: [life]
# Optional: coverImage: /covers/example.webp
---
Write Markdown here.
```

Invalid metadata is skipped by the existing content loader. Raw HTML and unsafe Markdown links are not rendered. Local cover files belong in `public/`; use `/covers/...` URLs. Register every added binary asset in `asset-policy.json` with its origin, source and license. Licensed third-party files and font binaries also require a real, nonempty repository license file via `licenseFile`. Release checks require local asset files, including blog covers: remote assets must be copied locally with the appropriate rights and provenance so existence and delivered size can be checked reproducibly. Generated illustrations retain their original generation records in `src/assets/scenes/README.md`. System-font references are documented in `src/assets/fonts/README.md`.

`check:assets` independently scans application imports/literal URLs, CSS, HTML, Markdown images and cover frontmatter, checks existence, discovers unregistered binaries in `src/` and `public/`, and validates the manifest and scene groups. Dynamically constructed asset paths must also be listed explicitly in the manifest. PNG, JPEG, WebP and GIF headers are checked for decoded dimensions; unsupported raster formats fail closed until a reviewed dimension decoder is added.

## Delivery and scene budgets

All kB below are decimal (1,000 bytes). Asset limits are raw file bytes; image pixels are decoded width × height. The six posters total **680,182 bytes**, from 45,256 to 159,428 bytes each, at no more than 1,573,352 pixels each.

| Asset gate | Ceiling |
| --- | ---: |
| Each raster image | 200,000 bytes and 2,000,000 pixels |
| All raster images | 900,000 bytes |
| Each GLB/glTF/geometry binary | 1,000,000 bytes |
| Each scene's registered file group | 1,200,000 bytes |
| Each added font binary | 150,000 bytes plus license file |

The pencil, landmarks, roads and contours are original numerical geometry in the repository: **no GLB, downloaded model or external scene texture is required**. Two arithmetic 128 × 256 RGBA pencil textures, a local Three.js RoomEnvironment reflection map and one 1024 × 1024 directional shadow map are generated at runtime. DPR is capped at 1.5; rendering pauses offscreen/hidden and resources are disposed on unmount. These generated resources are not fictitious downloaded asset entries.

Portable WebGL checks sample the completed chapters, the unfinished future and reverse scrolling on the actual scene. Each sampled rendered frame must stay at **250 draw calls and 100,000 triangles including shadow passes**. These replace the earlier proposed 80-main-pass-call figure as the consistently measured release gate. They are sampled regression ceilings, not an exhaustive maximum over every scroll position or a frame-rate promise.

On one Apple M1 Pro/Chrome hardware run, completed overviews measured 95–166 calls including shadows, 8,446–15,454 triangles, 6 renderer-reported textures and 53–230 retained geometries. The software-WebGL check confirms real rendering independently. No multi-device FPS or GPU-memory performance claim has been established; Safari, Firefox and representative lower-powered hardware still need profiling before broader performance claims.

`check:bundles` follows the production manifest's **static imports recursively**, counts shared files once per group, and measures Node zlib gzip at explicit level 6. Dynamic route groups remain separate. It also checks every emitted JS/CSS file, so splitting a large file cannot bypass the overall budget.

| JavaScript group | Measured gzip bytes | Ceiling |
| --- | ---: | ---: |
| Initial/static/mobile shared entry | 84,317 | 95,000 |
| Additional desktop scene and static dependencies | 299,534 | 320,000 |
| Desktop total including shared entry | 383,851 | 410,000 |
| Blog index including shared dependencies | 137,619 | 150,000 |
| Post reader including shared dependencies | 172,919 | 190,000 |
| All emitted JavaScript once | 472,773 | 500,000 |
| All emitted CSS once | 2,567 | 5,000 |

Vite's own compression estimate is **302.01 kB gzip / 1,081.69 kB minified** for the desktop chunk; its compression implementation differs slightly from the fixed zlib gate. This still exceeds the earlier nonbinding 300 kB Vite target. The release ceiling of 320 kB allows about 6% incremental room for the complete story while total desktop and all-JavaScript limits catch dependency growth. Named Three imports and the existing desktop lazy boundary were inspected; removing required lighting/geometry or speculative vendor splitting solely to erase a warning would not improve the measured complete dependency group. Vite's default >500 kB warning remains visible; its warning threshold has not been raised.

## CI and remaining release work

GitHub Actions runs lockfile installation, lint, strict types, unit tests, assets, the real production/prerender build, bundle budgets and portable Chromium checks. It uses only `contents: read`, no persisted checkout credentials, pinned official action commits and Node 24. It does not deploy or publish. Hosting configuration and real deployed route checks remain separate release work.

The live dependency audit currently reports a development-only minimatch advisory ([GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)) through the lint stack. The reviewed advisory affects versions `>=7.0.0 <11.0.1`; npm's latest 10.x is 10.2.6, while upstream lint packages require 10.x. No compatible patched backport was available at verification. Current lint globs are repository-authored constants; minimatch is absent from the shipped browser bundles. A major transitive override has not been forced. Recheck upstream support before release.

See the [approved design](docs/superpowers/specs/2026-11-06-alexandra-website-design.md) and [implementation plan](docs/superpowers/plans/2026-11-06-alexandra-website.md).
