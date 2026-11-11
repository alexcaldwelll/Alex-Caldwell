# Alexandra — Personal Website

A personal website and Markdown blog. Home follows a yellow pencil from an empty road through Seattle, Charleston, Washington, DC, and Nashville, where it stops at unfinished Broadway. On eligible desktop browsers, scroll drives the camera, drawing reveals, and plane transitions. The same artwork is available as stills on mobile, with reduced motion, without JavaScript, or if the desktop preview cannot initialize.

The live story uses React, TypeScript, Vite, layered WebP artwork, and a small Canvas 2D road renderer. The existing blog uses React view transitions for navigation and shared post titles.

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

The default browser suite starts Vite on port **5188** and checks the real drawing edge, scroll order and reversal, inter-city flights, clinic replacement, unfinished ending, and static fallback. The optional installed-Chrome check samples the final city compositions at 1440 and 1024 pixels.

```sh
npm run dev -- --port 5173 --strictPort
# In a second terminal, with Google Chrome installed:
npm run test:hardware
```

Set `HARDWARE_BASE_URL` to use a different development server.

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

`title`, `date` and `excerpt` are required. Use a real calendar date in `YYYY-MM-DD` form. `tags` is an optional list of strings and `coverImage` is an optional image path. The lowercase filename, with words separated by hyphens, sets the URL at `/blog/<slug>`. Posts appear newest first. The content loader skips posts with invalid metadata. The Markdown renderer displays standard Markdown and filters raw HTML and unsafe link URLs.

Place local covers under `public/covers/` and use `/covers/...` URLs. Register every added binary asset in `asset-policy.json` with its origin, source and license. Licensed third-party files and font binaries also require a nonempty repository license file via `licenseFile`. Keep published media local so the release checks can verify its provenance and size. Generated illustrations retain their original generation records in `src/assets/scenes/README.md`. System-font references are documented in `src/assets/fonts/README.md`.

Register each aligned WebP layer under its city in `asset-policy.json` and check the reveal in both directions. Keep the image dimensions and framing consistent across a city.

`check:assets` independently scans application media imports/literals, HTML/JSX media attributes (including srcset), CSS URLs, reader-parsed inline/reference Markdown images and cover frontmatter, checks existence, discovers unregistered binaries in `src/` and `public/`, and validates the manifest and scene groups. Dynamically constructed asset paths must also be listed explicitly in the manifest. PNG, JPEG, WebP and GIF headers are checked for decoded dimensions; unsupported raster formats fail closed until a reviewed dimension decoder is added.

## Delivery and scene budgets

The 20 staged WebP files total **2,748,690 bytes**. The opening road is 59,978 bytes. The desktop story requests its current city when it mounts and starts fetching the next city near the end of the current one. The static journey uses lazy images, including separate DC field and clinic stills and both Nashville beats.

| Asset gate | Ceiling |
| --- | ---: |
| Each raster image | 200,000 bytes and 2,000,000 pixels |
| All raster images | 2,900,000 bytes |
| Each GLB/glTF/geometry binary | 1,000,000 bytes |
| Each scene's registered file group | 1,200,000 bytes |
| Each added font binary | 150,000 bytes plus license file |

`check:bundles` follows the production manifest’s static imports, counts shared files once per group, and measures Node zlib gzip at level 6. Dynamic route groups remain separate. It also checks total emitted JS and CSS.

## GitHub Pages and Vercel

The GitHub Pages site is published from the generated files on the `gh-pages` branch. Build the reviewed source revision with `VITE_BASE_PATH=/Alex-Caldwell/ npm run build`. The environment variable gives the client, prerendered pages, and media the same repository path. Publish the contents of `dist/` at the branch root with an empty `.nojekyll` file. [Public website](https://alexcaldwelll.github.io/Alex-Caldwell/)

Push reviewed work to a feature branch and open a pull request. GitHub Actions runs lockfile installation, lint, strict types, unit tests, asset checks, the production build, bundle budgets and portable Chromium checks. The workflow uses read-only repository access, pinned official actions and Node 24.

After approval to connect hosting, import `alexcaldwelll/Alex-Caldwell` into Vercel with `main` as the production branch. The repository's `vercel.json` selects Vite, installs from the lockfile with `npm ci`, builds with `npm run build`, and serves `dist`. The package engine range selects Node 24. Each published route has its own generated `index.html`. Vercel serves these directory indexes at their routes and redirects trailing-slash URLs to their slashless form. [Vercel build and URL settings](https://vercel.com/docs/project-configuration/vercel-json) · [Directory indexes](https://vercel.com/docs/directory-listing) · [Supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

Once Vercel is connected, feature branch commits can produce previews and commits to `main` trigger production builds. Verify the preview before approving production publication. [Vercel’s GitHub integration](https://vercel.com/docs/git/vercel-for-github)

`npm run build` followed by `npm run test:e2e -- tests/e2e/prerender.spec.ts` verifies the generated files locally, including direct routes with JavaScript disabled. To browse the built site locally, run `npm run preview` after building. When a reachable Vercel preview is available, run the direct-route smoke test against it:

```sh
DEPLOYMENT_URL=https://your-preview.vercel.app npm run test:e2e -- tests/e2e/deployment-smoke.spec.ts
```

The hosted test checks Home's opening poster and story, the Blog index and a linked post with JavaScript disabled. It skips when `DEPLOYMENT_URL` is unset. Run the same test against GitHub Pages with its full project URL.

The live dependency audit currently reports a development-only minimatch advisory ([GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)) through the lint stack. The reviewed advisory affects versions `>=7.0.0 <11.0.1`; npm's latest 10.x is 10.2.6, while upstream lint packages require 10.x. No compatible patched backport was available at verification. Current lint globs are repository-authored constants; minimatch is absent from the shipped browser bundles. A major transitive override has not been forced. Recheck upstream support before release.

See the [approved design](docs/superpowers/specs/2026-11-06-alexandra-website-design.md) and [implementation plan](docs/superpowers/plans/2026-11-06-alexandra-website.md).
