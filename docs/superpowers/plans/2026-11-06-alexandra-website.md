# Alexandra Personal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Alexandra's personal website with a minimal blog and a cinematic, scroll-driven pencil journey from Seattle through Charleston and Washington, DC to Nashville, ending on an unfinished page.

**Architecture:** A React + TypeScript + Vite application with two routes, Markdown-driven blog content, and a lazily loaded React Three Fiber scene for the desktop homepage. GSAP ScrollTrigger drives scene progression; a single smooth-scroll engine may be selected after testing. Mobile and reduced-motion users receive a static illustrated journey.

**Tech Stack:** React, TypeScript, Vite, React Router, Three.js, @react-three/fiber, GSAP/ScrollTrigger, Markdown parser/frontmatter library, Vitest, React Testing Library, Playwright, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-06-alexandra-website-design.md`

## Global Constraints

- Exactly two primary pages: Home and Blog.
- Header identity is “Alexandra”; navigation is Home and Blog.
- Homepage opens with a blank page, name, navigation, and one oversized yellow pencil; no welcome headline.
- Desktop uses scroll-driven pencil/road movement; mobile uses a static vertical journey without required animation.
- The pencil design remains visually consistent across all chapters.
- Primary interface colors are warm cream and soft blush; yellow pencil, natural greens/soft blues in scenes, and a restrained golden faith motif.
- Memory drawings begin with a few recognizable strokes before transforming into colorful 3D objects/scenes.
- Chapters appear in order: Seattle, Charleston, Washington DC, Nashville, unfinished future.
- DC includes the medical-retirement transition, branching away from soccer, and faith on the new road; the soccer ball remains on the old road.
- Golden faith light persists from DC into Nashville.
- Blog posts are Markdown files with title, date, excerpt, and optional tags/cover image.
- Respect keyboard access, focus visibility, reduced motion, and static fallbacks.
- Do not copy reference-site assets, source code, identity, or signature effects.
- Select exactly one smooth-scroll engine, or use native scrolling if it best meets reliability/performance; never initialize multiple engines.
- Cap WebGL pixel ratio, pause offscreen/hidden rendering, avoid per-frame allocations, dispose resources, and support context loss.
- No user medical details beyond those explicitly approved in the design.

## Review Focus

1. **WebGL unavailable or context lost:** Homepage story remains readable and the static illustrated journey appears. Test in Task 6.
2. **Reduced-motion preference enabled:** No scrubbed 3D/smooth-scroll sequence runs; final static story is available. Test in Task 6.
3. **Mobile/coarse pointer viewport:** No desktop 3D canvas is required; static vertical chapter sequence remains navigable. Test in Task 7.
4. **Malformed or incomplete Markdown frontmatter:** Invalid posts are excluded or shown with a safe fallback rather than crashing the blog. Test in Task 3.
5. **Very long post, missing image, or unusual text:** Blog remains readable, links remain usable, and layout does not overflow. Test in Task 3 and Task 7.

---

## File Structure

Create this structure as tasks introduce each area:

- `package.json`, `vite.config.ts`, `tsconfig*.json`: app tooling and strict TypeScript configuration.
- `index.html`: document metadata, font preloads as justified, and app mount.
- `src/main.tsx`: React entry.
- `src/App.tsx`: route composition and shared app shell.
- `src/routes/HomePage.tsx`: homepage semantic structure and desktop/mobile scene selection.
- `src/routes/BlogPage.tsx`: blog index.
- `src/routes/BlogPostPage.tsx`: single-post reader.
- `src/components/SiteHeader.tsx`: Alexandra brand and Home/Blog navigation.
- `src/components/SiteFooter.tsx`: restrained footer.
- `src/styles/tokens.css`: colors, type, spacing, and motion tokens.
- `src/styles/global.css`: reset, base type, focus, responsive rules, reduced-motion rules.
- `src/content/posts/*.md`: authored posts; seed with one clearly marked sample post only if required for layout verification.
- `src/content/posts.ts`: frontmatter parsing, validation, sorting, and post lookup.
- `src/content/schema.ts`: post metadata types and validation schema.
- `src/components/blog/BlogCard.tsx`: post listing item.
- `src/components/blog/MarkdownContent.tsx`: safe Markdown rendering.
- `src/scenes/desktop/StoryCanvas.tsx`: R3F canvas boundary and fallback.
- `src/scenes/desktop/Pencil.tsx`: consistent pencil model/placeholder asset.
- `src/scenes/desktop/Road.tsx`: road geometry and route fork.
- `src/scenes/desktop/StoryCamera.tsx`: camera path and orientation.
- `src/scenes/desktop/ChapterScene.tsx`: scene composition for a chapter.
- `src/scenes/desktop/sceneData.ts`: chapter timestamps, labels for internal authoring, scene positions, asset references.
- `src/scenes/desktop/useStoryScroll.ts`: GSAP/ScrollTrigger synchronization.
- `src/scenes/desktop/ResourceLifecycle.tsx`: cleanup, pause/resume, WebGL loss handling.
- `src/scenes/mobile/StaticJourney.tsx`: non-animated vertical story.
- `src/scenes/shared/Chapter.tsx`: semantic chapter content shared across responsive presentations.
- `src/assets/scenes/*`: optimized GLB and image/poster assets with provenance notes.
- `tests/unit/*`: content parsing, scene metadata, and accessibility logic tests.
- `tests/e2e/*`: route, responsive, reduced-motion, and fallback Playwright tests.
- `playwright.config.ts`, `vitest.config.ts`: test configuration.
- `.github/workflows/ci.yml`: lint, typecheck, unit, and production build checks.
- `README.md`: local development, writing posts, asset workflow, deployment notes.

---

### Task 1: Initialize the application foundation

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Test: `tests/unit/app-shell.test.tsx`

**Interfaces:**
- Produces: `App` as the app root; global tokens and base stylesheet; npm scripts `dev`, `build`, `preview`, `typecheck`, `test`.

- [ ] **Step 1: Write the failing app-shell test**
  - Test that rendering `App` exposes the document's primary navigation labels “Home” and “Blog” and the brand “Alexandra”.
  - Test that the initial Home route contains no generic welcome headline.

- [ ] **Step 2: Run the test to verify it fails**
  - Run: `npm test -- --run tests/unit/app-shell.test.tsx`
  - Expected: FAIL because the app shell does not exist.

- [ ] **Step 3: Create the Vite React TypeScript foundation**
  - Configure strict TypeScript, React plugin, and npm scripts.
  - Add only dependencies needed for the shell and test environment.

- [ ] **Step 4: Implement the app shell and tokens**
  - Implement `src/main.tsx` and `App` with semantic header/main/footer structure.
  - Add warm cream/blush tokens and visible keyboard focus styles.
  - Keep the hero initially minimal; do not add placeholder copy.

- [ ] **Step 5: Run verification**
  - Run: `npm test -- --run tests/unit/app-shell.test.tsx`
  - Run: `npm run typecheck && npm run build`
  - Expected: all pass.

- [ ] **Step 6: Commit**
  - `git add package.json vite.config.ts tsconfig*.json index.html src tests`
  - `git commit -m "chore: initialize personal website"`

### Task 2: Add routing and shared navigation

**Files:**
- Create: `src/routes/HomePage.tsx`, `src/routes/BlogPage.tsx`, `src/components/SiteHeader.tsx`, `src/components/SiteFooter.tsx`
- Modify: `src/App.tsx`, `package.json`
- Test: `tests/unit/navigation.test.tsx`

**Interfaces:**
- Consumes: `App` shell from Task 1.
- Produces: routes `/` and `/blog`; `SiteHeader` with links to both routes.

- [ ] **Step 1: Write navigation tests**
  - Assert the header displays only the “Alexandra” brand and Home/Blog links.
  - Assert Home and Blog links navigate to `/` and `/blog`.
  - Assert current route is conveyed accessibly (e.g. `aria-current="page"`).

- [ ] **Step 2: Run tests to verify failure**
  - Run: `npm test -- --run tests/unit/navigation.test.tsx`
  - Expected: FAIL due to missing routes and header.

- [ ] **Step 3: Implement routing**
  - Add React Router; define only `/` and `/blog`.
  - Provide a not-found state that links home, without adding another primary nav destination.

- [ ] **Step 4: Implement header and footer**
  - Keep shared navigation visually restrained and responsive.
  - Use semantic links and visible focus states.

- [ ] **Step 5: Run verification**
  - Run: `npm test -- --run tests/unit/navigation.test.tsx`
  - Run: `npm run typecheck && npm run build`
  - Expected: all pass.

- [ ] **Step 6: Commit**
  - `git add src package.json tests`
  - `git commit -m "feat: add home and blog routes"`

### Task 3: Implement Markdown blog publishing

**Files:**
- Create: `src/content/schema.ts`, `src/content/posts.ts`, `src/content/posts/first-note.md`
- Create: `src/components/blog/BlogCard.tsx`, `src/components/blog/MarkdownContent.tsx`, `src/routes/BlogPostPage.tsx`
- Modify: `src/routes/BlogPage.tsx`, `src/App.tsx`, `package.json`
- Test: `tests/unit/posts.test.ts`, `tests/unit/markdown-content.test.tsx`

**Interfaces:**
- Produces:
  - `type BlogPost = { slug: string; title: string; date: string; excerpt: string; tags?: string[]; coverImage?: string; content: string }`
  - `getAllPosts(): BlogPost[]`
  - `getPostBySlug(slug: string): BlogPost | undefined`
- Blog URLs: `/blog` and `/blog/:slug`.

- [ ] **Step 1: Write failing post parsing tests**
  - Assert valid frontmatter fields parse into a `BlogPost`.
  - Assert posts sort newest first.
  - Assert missing required metadata and malformed frontmatter are excluded with a development warning, not an application crash.
  - Assert unknown slugs produce a not-found state.
  - Assert long text and missing cover image do not break layout.

- [ ] **Step 2: Run tests to verify failure**
  - Run: `npm test -- --run tests/unit/posts.test.ts`
  - Expected: FAIL because the parser and lookup functions are missing.

- [ ] **Step 3: Implement content schema and parser**
  - Use Vite's statically analyzable `import.meta.glob` with eager raw Markdown imports.
  - Validate frontmatter with a schema library and create stable slugs from filenames.
  - Avoid runtime file-system access in the browser.

- [ ] **Step 4: Implement blog index and reader**
  - Render entries with title, date, excerpt, optional tags, and optional cover.
  - Render Markdown safely; raw HTML is disabled by default.
  - Use restrained typography and generous reading width.

- [ ] **Step 5: Run verification**
  - Run: `npm test -- --run tests/unit/posts.test.ts tests/unit/markdown-content.test.tsx`
  - Run: `npm run typecheck && npm run build`
  - Expected: all pass.

- [ ] **Step 6: Commit**
  - `git add src/content src/components/blog src/routes tests package.json`
  - `git commit -m "feat: add markdown-powered blog"`

### Task 4: Define story chapter data and mobile journey

**Files:**
- Create: `src/scenes/desktop/sceneData.ts`, `src/scenes/shared/Chapter.tsx`, `src/scenes/mobile/StaticJourney.tsx`
- Modify: `src/routes/HomePage.tsx`
- Test: `tests/unit/scene-data.test.ts`, `tests/unit/static-journey.test.tsx`

**Interfaces:**
- Produces:
  - `type StoryChapter = { id: "seattle" | "charleston" | "dc" | "nashville" | "future"; title: string; progressStart: number; progressEnd: number; faithVisible: boolean; landmarks: string[]; poster: string }`
  - `STORY_CHAPTERS: readonly StoryChapter[]`
  - `StaticJourney` renders chapters in order from the same data.

- [ ] **Step 1: Write chapter data tests**
  - Assert exact chapter order: Seattle, Charleston, DC, Nashville, future.
  - Assert progress ranges are ordered, non-overlapping, and cover 0–1.
  - Assert faith is visible from the DC transition onward, including Nashville and future.
  - Assert the DC metadata includes soccer fork/ball-old-route and St. Patrick's Church; Nashville includes Vanderbilt, running, food, music, and Immaculate Conception.

- [ ] **Step 2: Run tests to verify failure**
  - Run: `npm test -- --run tests/unit/scene-data.test.ts`
  - Expected: FAIL because chapter data is absent.

- [ ] **Step 3: Implement typed scene metadata**
  - Keep all chapter timing and asset references in one data module.
  - Use a single progress coordinate between 0 and 1.

- [ ] **Step 4: Implement static mobile story**
  - Use the same chapter data to render a vertical sequence with poster images and semantic text.
  - Do not mount the desktop WebGL canvas on coarse-pointer/mobile layouts.
  - Keep visual details restrained and scroll-native.

- [ ] **Step 5: Run verification**
  - Run: `npm test -- --run tests/unit/scene-data.test.ts tests/unit/static-journey.test.tsx`
  - Run: `npm run typecheck && npm run build`
  - Expected: all pass.

- [ ] **Step 6: Commit**
  - `git add src/scenes src/routes tests`
  - `git commit -m "feat: add story chapters and mobile journey"`

### Task 5: Build the desktop 3D scene primitives

**Files:**
- Create: `src/scenes/desktop/StoryCanvas.tsx`, `src/scenes/desktop/Pencil.tsx`, `src/scenes/desktop/Road.tsx`, `src/scenes/desktop/StoryCamera.tsx`
- Create: `src/scenes/desktop/ResourceLifecycle.tsx`, `src/assets/scenes/README.md`
- Modify: `src/routes/HomePage.tsx`, `package.json`
- Test: `tests/unit/scene-primitives.test.tsx`

**Interfaces:**
- Produces:
  - `StoryCanvas({ progress, reducedMotion, onContextFailure }: StoryCanvasProps)`
  - `Pencil({ progress }: { progress: number })`
  - `Road({ progress }: { progress: number })`
  - `StoryCamera({ progress }: { progress: number })`
- All primitives derive from the same normalized `progress` value.

- [ ] **Step 1: Write scene primitive tests**
  - Assert pencil model uses one stable material/color configuration across progress values.
  - Assert the road exposes the baseline route and a branch route without interactive user selection.
  - Assert canvas fallback is invoked when WebGL initialization fails.
  - Assert canvas is not loaded when reduced motion is active or viewport uses the static/mobile presentation.

- [ ] **Step 2: Run tests to verify failure**
  - Run: `npm test -- --run tests/unit/scene-primitives.test.tsx`
  - Expected: FAIL because scene components are missing.

- [ ] **Step 3: Implement lazy-loaded R3F boundary**
  - Dynamically import the desktop canvas so the 3D bundle is not loaded on blog routes or mobile.
  - Provide a meaningful poster fallback.
  - Cap renderer pixel ratio and pause when offscreen/hidden.

- [ ] **Step 4: Implement pencil, road, and camera**
  - Establish one fixed pencil asset/material and stable proportions.
  - Create a road spline whose path is revealed from scroll progress, with a DC branch to a new route and the old soccer road continuing separately.
  - Camera stays behind/slightly above pencil while traveling; it shifts to reveal drawings during creation.

- [ ] **Step 5: Run verification**
  - Run: `npm test -- --run tests/unit/scene-primitives.test.tsx`
  - Run: `npm run typecheck && npm run build`
  - Expected: all pass.

- [ ] **Step 6: Commit**
  - `git add src/scenes src/assets package.json tests`
  - `git commit -m "feat: build pencil road and camera scene"`

### Task 6: Add scroll-driven story animation and 3D chapter scenes

**Files:**
- Create: `src/scenes/desktop/ChapterScene.tsx`, `src/scenes/desktop/useStoryScroll.ts`
- Create: scene asset files under `src/assets/scenes/` with provenance records.
- Modify: `src/scenes/desktop/StoryCanvas.tsx`, `src/scenes/desktop/sceneData.ts`, `src/routes/HomePage.tsx`
- Test: `tests/unit/story-progress.test.ts`, `tests/e2e/home-story.spec.ts`

**Interfaces:**
- Consumes: Task 4 `STORY_CHAPTERS`; Task 5 scene primitives.
- Produces: `useStoryScroll(containerRef): { progress: number }`; `ChapterScene({ chapter, progress }: ChapterSceneProps)`.

- [ ] **Step 1: Write progress and chapter sequence tests**
  - Assert the opening progress reveals the blank page and pencil with no road visible.
  - Assert the pre-drawn road becomes visible gradually after scroll begins.
  - Assert chapter transitions occur in Seattle, Charleston, DC, Nashville, future order.
  - Assert landmark drawing is triggered by a few recognizable strokes, then color/3D completion.
  - Assert airplane transition appears between Seattle and Charleston.
  - Assert DC branch sends pencil to new route, leaves soccer ball on old route, and preserves golden light into Nashville.
  - Assert faith light remains visible in Nashville and future.

- [ ] **Step 2: Run tests to verify failure**
  - Run: `npm test -- --run tests/unit/story-progress.test.ts`
  - Expected: FAIL because scroll mapping and scenes are missing.

- [ ] **Step 3: Implement scroll progress**
  - Use GSAP ScrollTrigger with a single normalized progress source.
  - Evaluate Lenis versus Locomotive Scroll, select one only if it improves the experience, and synchronize it with ScrollTrigger.
  - Refresh after fonts, poster/GLB assets, and responsive layout changes; clean up triggers and the selected scroll engine on unmount.

- [ ] **Step 4: Implement chapter scenes**
  - Seattle: evergreens, Space Needle, lake, high dive, distant Mount Rainier.
  - Charleston: airplane crossing; palm trees, ocean, soccer context, long travel and Florida tournament with small coach figures.
  - DC: Washington Monument, GW field, restrained doctor/medical retirement cue, soccer route fork, soccer ball left on former route, St. Patrick's Church, and persistent golden light.
  - Nashville: Vanderbilt, running, food, music, Immaculate Conception Church, continuing golden light.
  - Future: partially drawn forms and a road continuing into blank space.
  - Each object begins with a small number of recognizable strokes, then smoothly completes itself and becomes colorful 3D.

- [ ] **Step 5: Implement lifecycle and reduced-motion safeguards**
  - Pause rendering when scene is offscreen or document hidden.
  - Handle WebGL context loss with static fallback.
  - Dispose resources on unmount; no per-frame object allocation.
  - Reduced-motion users receive final chapter posters and static route rather than scroll-scrubbed 3D.

- [ ] **Step 6: Run verification**
  - Run: `npm test -- --run tests/unit/story-progress.test.ts`
  - Run: `npx playwright test tests/e2e/home-story.spec.ts`
  - Run: `npm run typecheck && npm run build`
  - Expected: all pass; visual review confirms correct chapter order and motion.

- [ ] **Step 7: Commit**
  - `git add src/scenes src/assets tests`
  - `git commit -m "feat: add cinematic scroll journey"`

### Task 7: Refine typography, visual transitions, and mobile presentation

**Files:**
- Create: `src/components/RouteTransition.tsx`
- Modify: `src/App.tsx`, `src/routes/HomePage.tsx`, `src/routes/BlogPage.tsx`, `src/routes/BlogPostPage.tsx`, `src/styles/tokens.css`, `src/styles/global.css`
- Test: `tests/e2e/responsive.spec.ts`, `tests/e2e/accessibility.spec.ts`

**Interfaces:**
- Consumes: Home/Blog routes and static/desktop journey from earlier tasks.
- Produces: consistent page-level navigation transition where supported; responsive static journey.

- [ ] **Step 1: Write responsive/accessibility tests**
  - Assert at 390px viewport the static journey is displayed and no WebGL canvas is mounted.
  - Assert at desktop viewport the cinematic canvas is eligible to mount.
  - Assert Home/Blog navigation is keyboard operable with visible focus.
  - Assert reduced-motion disables spatial route transition and continuous animation.
  - Assert content is understandable without JavaScript or WebGL via static structure/posters.

- [ ] **Step 2: Run tests to verify failure**
  - Run: `npx playwright test tests/e2e/responsive.spec.ts tests/e2e/accessibility.spec.ts`
  - Expected: FAIL until responsive/accessibility behavior is complete.

- [ ] **Step 3: Refine typography and responsive details**
  - Use licensed fonts with editorial character and readable blog line lengths.
  - Keep the home opening sparse and the blog calm, with subtle creative details only.
  - Static mobile story uses vertical chapter flow and illustrations; no required animation.

- [ ] **Step 4: Add native View Transitions only where meaningful**
  - Use stable React 19.3+ `ViewTransition` APIs if supported by the selected router/runtime; otherwise skip gracefully.
  - Use a restrained page transition between Home and Blog only if it clarifies continuity; no directional slide for lateral page navigation.
  - Add reduced-motion CSS.

- [ ] **Step 5: Run verification**
  - Run: `npx playwright test tests/e2e/responsive.spec.ts tests/e2e/accessibility.spec.ts`
  - Run: `npm run typecheck && npm run build`
  - Expected: all pass.

- [ ] **Step 6: Commit**
  - `git add src tests`
  - `git commit -m "feat: refine responsive and accessible experience"`

### Task 8: Add production checks and asset/performance budgets

**Files:**
- Create: `.github/workflows/ci.yml`, `scripts/check-assets.mjs`
- Modify: `package.json`, `README.md`
- Test: `tests/unit/asset-policy.test.ts`

**Interfaces:**
- Produces: CI workflow for install, lint, typecheck, unit tests, and production build; asset validation script.

- [ ] **Step 1: Write asset policy tests**
  - Assert referenced GLB/poster paths exist.
  - Assert asset provenance metadata exists for non-authored files.
  - Assert no scene exceeds the documented image/geometry budget.

- [ ] **Step 2: Run tests to verify failure**
  - Run: `npm test -- --run tests/unit/asset-policy.test.ts`
  - Expected: FAIL until asset validation is implemented.

- [ ] **Step 3: Implement asset validation and CI**
  - Add checks for missing references, uncredited assets, oversized images, and unexpectedly large GLB files.
  - CI runs `npm ci`, lint, typecheck, unit tests, and production build.
  - Do not commit generated build artifacts.

- [ ] **Step 4: Run verification**
  - Run: `npm run lint && npm run typecheck && npm test -- --run && npm run build`
  - Expected: all pass.

- [ ] **Step 5: Commit**
  - `git add .github scripts package.json README.md tests`
  - `git commit -m "ci: add quality checks and asset budgets"`

### Task 9: Prepare deployment and project documentation

**Files:**
- Create: `vercel.json` only if required for SPA routing/build configuration.
- Modify: `README.md`, deployment workflow/configuration as needed.
- Test: `tests/e2e/deployment-smoke.spec.ts`

**Interfaces:**
- Produces: documented setup, Markdown authoring guide, asset workflow, build/deployment configuration.

- [ ] **Step 1: Write deployment smoke test**
  - Assert deployed Home route loads, Blog route loads directly, and a Markdown post route loads directly.
  - Assert static fallback remains visible before WebGL readiness.

- [ ] **Step 2: Run test to verify current gap**
  - Run: `npx playwright test tests/e2e/deployment-smoke.spec.ts`
  - Expected: deployment test is skipped/blocked until a deployment URL exists; local route smoke assertions should be prepared.

- [ ] **Step 3: Document contributor workflow**
  - Explain `npm install`, `npm run dev`, test/build commands, Markdown frontmatter schema, and adding an optimized 3D asset with provenance.
  - Explain how a commit to the production branch triggers deployment.

- [ ] **Step 4: Configure Vercel**
  - Connect the GitHub repository through the user's Vercel account when authorized.
  - Use the Vite build command and `dist` output directory.
  - Configure SPA fallback only if the router requires it.

- [ ] **Step 5: Run verification**
  - Run local production build and Playwright smoke tests.
  - Verify deployment URL when Vercel integration is connected.
  - Expected: Home, Blog, and post routes load directly.

- [ ] **Step 6: Commit**
  - `git add README.md vercel.json`
  - `git commit -m "docs: document development and deployment"`

### Task 10: Final visual, motion, and content review

**Files:**
- Modify: any source/assets identified during visual review.
- Test: all existing unit and E2E tests.

**Interfaces:**
- Consumes: complete website and deployment candidate.
- Produces: release candidate with documented validation and any remaining limitations.

- [ ] **Step 1: Run full automated suite**
  - Run: `npm run lint && npm run typecheck && npm test -- --run && npx playwright test && npm run build`
  - Expected: all pass.

- [ ] **Step 2: Review desktop and mobile viewports**
  - Check 1440px, 1024px, 768px, and 390px widths.
  - Confirm no clipped navigation, empty scene, overflow, or unexpected content overlap.

- [ ] **Step 3: Review accessibility and failure modes**
  - Test keyboard navigation, focus, reduced motion, WebGL failure/context loss, hidden-tab pause/resume, and no-JavaScript static content.
  - Confirm no animation is required to understand story content.

- [ ] **Step 4: Review story fidelity**
  - Verify the blank opening and gradually revealed existing road.
  - Verify pencil consistency, memory draw/transforms, place transitions, DC branch, old soccer road/ball, persistent faith light, Nashville, and partially drawn future.

- [ ] **Step 5: Commit final corrections**
  - `git add -A`
  - `git commit -m "polish: finalize personal story experience"`

---

## Plan review notes

- The approved scope contains two cohesive product areas—homepage and blog—plus the cross-cutting deployment foundation. They are sequenced so the blog can ship independently before the advanced 3D scene.
- Original 3D assets are a significant production dependency. Begin with simple, clearly authored placeholder models; replace them with polished assets chapter by chapter.
- Vercel deployment requires the user's Vercel account connection/authorization; repository creation alone does not configure hosting.
- The plan is for an empty repository and assumes no existing app conventions.
