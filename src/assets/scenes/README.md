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
