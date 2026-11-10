# Scene artwork provenance

Generated 2026-11-06 with OpenAI image generation. Original AI-generated interpretive artwork, not documentary images or copied reference-site assets. Compression only; no semantic editing.

## opening
- File: `opening.webp`
- Dimensions: 1672 × 941
- Source: `generated_images/01a1b303-2052-79d3-9868-a06aa0ea5b0d/exec-806133ea-8c24-41b6-bffc-31e1b1dab89e.png`
- Meaning: Oversized yellow pencil with pink eraser on an open cream page.

## seattle
- File: `seattle.webp`
- Dimensions: 1536 × 1024
- Source: `generated_images/01a1b303-2052-79d3-9868-a06aa0ea5b0d/exec-bee8163e-1cc2-43f6-b064-dfccfb928976.png`
- Meaning: Childhood and discovery: Seattle landscape and selected memories.

## charleston
- File: `charleston.webp`
- Dimensions: 1672 × 941
- Source: `generated_images/01a1b303-2052-79d3-9868-a06aa0ea5b0d/exec-3913dd08-defd-4a0d-a476-cda627a7bfe2.png`
- Meaning: Ambition: coastal Charleston, soccer and travel.

## dc
- File: `dc.webp`
- Dimensions: 1672 × 941
- Source: `generated_images/01a1b303-2052-79d3-9868-a06aa0ea5b0d/exec-4cfe89ea-5d9d-4d5f-af1d-e81408fcaad8.png`
- Meaning: Change and faith: soccer fork, ball left on the old road, DC landmarks and church; golden light begins.

## nashville
- File: `nashville.webp`
- Dimensions: 1568 × 1003
- Source: `generated_images/01a1b303-2052-79d3-9868-a06aa0ea5b0d/exec-bf65c077-57cc-4e73-be70-7f655e04a63e.png`
- Meaning: Joy and exploration: Vanderbilt, running, food, music and church with continuing golden light.

## future
- File: `future.webp`
- Dimensions: 1672 × 941
- Source: `generated_images/01a1b303-2052-79d3-9868-a06aa0ea5b0d/exec-fd163c08-3ce7-4e79-931a-dcf6700265ee.png`
- Meaning: An unfinished road and partially drawn possibilities; golden light continues.

## Original desktop geometry (Task 5)

The desktop pencil, paper and two road ribbons are authored in this repository from Three.js geometric primitives and numerical curves. There are no downloaded models, textures, HDR environments, fonts, or copied reference-site assets. The generated opening image above is the visual material/proportion reference and complete loading/error poster. Yellow lacquer, six-sided barrel, cedar tip, graphite, rolled silver ferrule and pink eraser remain one fixed design throughout progress. The poster is interpretive artwork; the geometry is a separate original construction, not an image-to-3D reconstruction.

### Proposed authored-scene resource budget

These are implementation limits to guide subsequent chapter work, **not measured frame-rate or GPU benchmarks**:

- Task 5 base primitives: fewer than 10,000 triangles and 24 main-pass draw calls (shadows add their own pass).
- One 1024 × 1024 directional shadow map; no scene image textures or model downloads.
- Renderer DPR at most 1.5; pause the render loop when canvas is outside the viewport or document is hidden.
- Initial desktop scene JavaScript target: at most 300 kB gzip. The production build at Task 5 emits the isolated scene/library chunk at approximately 245 kB gzip; the static/mobile/Blog path does not request it.
- Proposed complete story ceiling for Task 6: 100,000 visible triangles, 80 main-pass draw calls, 16 MiB authored texture resources, and no more than one shadow-casting light. Revisit this ceiling with real browser measurements on representative hardware before launch.

Resource ownership: React Three Fiber owns and disposes declarative geometries, materials, lights and its renderer on unmount. Our lifecycle binding disconnects its intersection observer and removes visibility/context-loss listeners. All per-frame transforms and reveal state use retained vectors/refs; no React state is updated per frame. WebGL initialization errors, context loss and lazy-load errors remove the renderer and retain the opening poster plus semantic static journey.

## Original desktop chapter artwork (Task 6)

- The original desktop pass used hand-authored XYZ contour coordinates to guide the pencil tip and reveal graphite sketches of each memory. The future contour stopped at 72% completion.
- `Landmarks.tsx` builds original interpretive landmarks, trees, water, soccer fields, small people, food and music objects from numerical Three.js primitives. These are simplified story illustrations, not measured architectural reproductions. `StoryMotifs.tsx` authors the airplane, abandoned ball and continuing golden light. No reference-site models, geometry, images or effects were copied.
- `pencilSurface.ts` generates two deterministic 128 × 256 RGBA textures from arithmetic: cedar grain and lacquer micrograin, 128 KiB each before mipmaps. There are no external texture files or downloads. Both textures are explicitly disposed on pencil unmount.
- `SceneLighting.tsx` uses the installed Three.js `RoomEnvironment` helper to generate local studio reflections through PMREM, then disposes its temporary geometry/generator and the retained render target on unmount. This bundled Three.js helper is library code under the dependency's MIT license, not downloaded environment artwork. One directional light casts a 1024 × 1024 shadow; the faith point light does not cast shadows.

### Task 6 measured resources and limits

Chrome on Apple M1 Pro using ANGLE Metal rendered the actual four completed chapter overviews at **95–166 draw calls including shadows**, **8,446–15,454 triangles**, and **6 renderer-reported textures**. These are snapshots at the authored overview positions, not worst-case profiling or frame-time benchmarks. R3F reports 53–230 retained geometries as successive chapters become available; declarative resources remain owned by the mounted scene and are disposed on unmount. The E2E suite checks the overview calls stay below 250 and triangles above 2,000 to guard against an empty substitute scene.

The Task 6 production desktop scene bundle is approximately **302 kB gzip / 1.08 MB minified** (the exact final result is in the task report), slightly over the proposed 300 kB gzip target. Vite's large-chunk warning remains visible. The scene, GSAP and Lenis stay behind the desktop Home eligibility import; mobile and reduced-motion E2E cases verify those modules are not requested. No WebGL FPS or cross-device performance claim is made; final release budgeting and broader profiling remain for Task 8.


### Task 8 release gates (supersede the earlier proposals)

`asset-policy.json` records the original generated illustrations and scene file groups. `npm run check:assets` enforces 200,000 raw bytes / 2,000,000 decoded pixels per raster, 900,000 total raster bytes, 1,000,000 bytes per optional geometry download and 1,200,000 bytes per scene file group. There are currently six posters totaling 680,182 bytes and no GLB/model downloads; the authored numerical geometry remains in source. All added assets require provenance, and redistributed licensed files/fonts also require a repository license file.

Portable Chromium/SwiftShader verifies actual canvas pixels and public WebGL draw calls at chapter samples. Its ceiling is 250 draw calls and 100,000 triangles **including shadow passes**, rather than comparing total calls to the former 80-main-pass proposal. This is sampled regression coverage, not exhaustive profiling. The earlier single M1 Pro hardware measurements remain single-device evidence, with no FPS/cross-device or measured GPU-memory claim.

The complete-story desktop release ceiling is 320,000 additional gzip bytes, with a separate 410,000-byte total including shared dependencies. The fixed Node zlib level-6 gate measures 299,534 / 383,851 bytes respectively; Vite's own compression implementation estimates 302.01 kB for the isolated scene. The earlier 300 kB Vite target remains slightly missed; the default large-chunk warning is retained. Full shared/Blog/all-output measurements, rationale and remaining profiling limits are in the root README.

## Desktop illustration update

The desktop city artwork uses the same WebP files as the static journey. Each image is positioned beside the Three.js road. Its shader blends away the paper background and uses the graphite tip’s position on the image plane to reveal the illustration. The camera holds a near-front view while the pencil draws and rejoins the road. The future illustration supplies the unfinished graphite details. The road, pencil, abandoned ball, and golden light remain 3D. The earlier renderer measurements describe the original geometry pass.
