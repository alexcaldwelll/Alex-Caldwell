# Alexandra — Website Design Specification

**Status:** Approved by Alexandra on 2026-11-06  
**Project:** Personal website and blog

## Intent

Create a personal website that acts as both a creative outlet and a public-facing expression of Alexandra's life, experiences, faith, love, and ongoing exploration. The site should communicate that her story is still being written; it is not a finished autobiography or a portfolio built around a fixed passion.

## Goals

- A memorable, cinematic desktop homepage built around one oversized, realistic yellow pencil.
- The pencil represents Alexandra and physically draws a road and selected memories as the visitor scrolls.
- The world is revealed gradually; a few recognizable graphite strokes develop into colorful 3D scenes.
- Faith and love remain central themes, represented by a restrained golden light that persists after the DC chapter.
- A calm, expressive blog for personal writing.
- Simple GitHub-based publishing with Markdown posts and frequent commits.
- A considered mobile experience that presents the journey as a static, vertical scroll narrative without requiring animation.

## Non-goals and anti-goals

- No interactive branching choices or visitor-controlled drawing. The story follows Alexandra's path.
- No clickable memory objects on the homepage; the cinematic narrative is visual.
- No welcome headline or long introductory copy on the homepage.
- No cluttered decorative collage, excess colors, or animation without narrative purpose.
- No detailed disclosure of private medical experiences.
- No forced chronological exposition beyond the selected thematic journey.

## Site structure

Only two primary pages:
- Home: cinematic scroll-driven journey.
- Blog: readable writing with subtle creative details.

Header: “Alexandra” at upper left; “Home” and “Blog” at upper right.

## Visual identity

- Warm cream and soft blush form the primary interface palette.
- The pencil is consistently yellow with a pink eraser and realistic material/texture.
- Natural greens and soft blues appear in landscape/scene content.
- A small warm golden light is the persistent visual motif for faith and love.
- Minimal composition, large negative space, gentle lighting, and disciplined 3D environments.
- The pencil remains visually consistent in shape, material, and proportions throughout.

## Homepage motion concept

### Opening
- Blank page with only the name, Home/Blog navigation, and oversized pencil.
- No road is initially visible.
- On scroll, the camera reframes to gradually reveal an immaculate, already-drawn road.
- The pencil begins along that road before eventually choosing its own route.

### Point of view and movement
- Desktop is the primary cinematic format.
- The pencil remains near the foreground, seen from behind and slightly above when traveling.
- Road and scenery move relative to the pencil to communicate forward movement and the passage of time.
- When creating a memory, the pencil slows, turns toward an empty area beside the road, and traces a few recognizable lines.
- The rest of the drawing completes itself and gradually gains color/volume, becoming a colorful 3D object or scene.
- The pencil returns to the road after each memory.
- Locations remain present while the visitor is within that chapter, then recede naturally behind the pencil as travel continues.

### Chapters

1. **Seattle — childhood and discovery**
   - Evergreen trees, Space Needle, lake, high-dive platform, Mount Rainier.
   - Represents growing up in Seattle for 15 years, friendships, and beginning soccer.
   - Keep the scene selective and spacious; not every memory must be literal.

2. **Charleston — ambition**
   - A plane flies through to transition from Seattle to Charleston, South Carolina.
   - Palm trees, ocean, soccer, and long travel for a team about two hours away.
   - A road trip to a Florida tournament; a soccer field and small figures representing college coaches watching.
   - Convey growing pressure to stand out and be recruited, without turning the sequence dark or melodramatic.

3. **Washington, DC — change and faith**
   - George Washington University soccer field and Washington Monument.
   - A restrained concussion/medical retirement passage: suggest a header, doctor/medical setting, and the difficulty of leaving soccer without graphic injury imagery.
   - The soccer road continues in one direction. The pencil branches onto a new road; the soccer ball remains on the old route and recedes from view.
   - The DC landmarks remain visible through this emotional transition.
   - St. Patrick's Church in DC appears as faith enters the new road.
   - Introduce a subtle golden light representing faith and love.

4. **Nashville — joy and exploration**
   - Veer from the DC/faith path toward Vanderbilt University.
   - Include running, trying new food, music, and the Church of the Immaculate Conception in Nashville.
   - Faith's golden light stays with the pencil as the DC scene recedes.
   - This chapter feels open, curious, and joyful; the story remains unfinished.

5. **The unfinished future**
   - Pencil continues into open page.
   - Final objects are only partially drawn; some remain graphite sketches while others have begun transforming into color/3D.
   - No “The End” or final destination. The journey remains in progress.

## Animation principles

- Use GSAP as the primary scroll-animation system.
- Use Three.js where 3D spatial depth materially supports the story.
- Evaluate Lenis and Locomotive Scroll and choose exactly one smooth-scroll engine; do not combine them.
- Connect the chosen engine to GSAP ScrollTrigger, refresh on layout/media/font changes, and clean up on teardown.
- Under prefers-reduced-motion, bypass smooth scrolling and scrubbed timelines and render final static states.
- A static first frame must remain complete if JavaScript, WebGL, or motion is unavailable.
- Cap device pixel ratio, pause rendering when offscreen or when the document is hidden, throttle pointer input, and avoid per-frame allocations.
- Dispose animation frames, observers, listeners, render targets, textures, geometries, materials, and renderer resources.
- Handle WebGL context loss without breaking semantic page content.
- Avoid View Transitions for the continuous 3D scroll story; use native React View Transitions only for page navigation or meaningful state continuity where supported and beneficial.

## Desktop and mobile

- Desktop: full cinematic scene and scroll-driven camera/road/pencil/landmark experience.
- Mobile: no required animation; a vertical, static illustrated journey that preserves chapter order and the faith motif.
- Both layouts expose the same two-page navigation and blog content.
- Respect reduced motion and preserve keyboard/touch access.

## Blog and content publishing

- Store posts as Markdown files in the repository.
- Each post has frontmatter for title, date, excerpt, and optional tags/cover image.
- Build a blog index and individual reading view with readable typography and subtle visual details.
- Publishing is a Git workflow: add/update a Markdown file and push a commit; the deployment pipeline publishes the change.
- Avoid adding a separate CMS initially; revisit only if the authoring workflow later becomes burdensome.

## Technical direction

- React + TypeScript + Vite.
- Three.js using React Three Fiber for the homepage 3D scene.
- GSAP + ScrollTrigger for scroll-driven animation.
- CSS for layout, visual tokens, and simple interaction states.
- Markdown-based content.
- GitHub for version control and publishing.
- Vercel as the proposed deployment host, subject to account connection/configuration.

## Quality and acceptance

- The two pages are usable before the 3D scene finishes loading.
- No homepage welcome headline; header only contains Alexandra and Home/Blog.
- Desktop opening begins as a blank page with pencil, then reveals the pre-drawn road on scroll.
- Pencil remains consistent and draws selected landmarks with recognizable lines before 3D transformation.
- Seattle, Charleston, DC, Nashville, and the unfinished future are represented in the agreed order.
- DC soccer branching is legible; the soccer ball remains on the old route; golden faith light persists on the new route into Nashville.
- Mobile journey is intentionally static and scrollable.
- Blog posts render from Markdown and deploy through GitHub commits.
- Keyboard navigation, visible focus, readable contrast, alt text, reduced motion, and static fallback are supported.
- Production build and automated tests pass before launch.

## Implementation decisions left to the builder

- Choose exact compatible library versions and configure Vite/React.
- Evaluate Lenis versus Locomotive Scroll and select one.
- Define the scene coordinate system, scroll chapter boundaries, asset formats, and optimized GLB loading.
- Select fonts with appropriate licenses and maintain the agreed visual restraint.
- Source or create original 3D assets; do not copy the supplied reference-site assets.
- Configure GitHub Actions/Vercel deployment once account access is available.
