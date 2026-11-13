# Valentino Rota, portfolio

Source of [valentinorota.vercel.app](https://valentinorota.vercel.app): the portfolio of Valentino Rota, a design engineer based in Mar del Plata, Argentina. A home page with five case studies, each with its own page, diagrams and clips.

## Stack

- Next.js 16 (App Router) and React 19, TypeScript
- Tailwind CSS 4, with design tokens in `@theme` (`src/app/globals.css`)
- Geist and Geist Mono, self-hosted with `next/font/local`
- Vitest for unit tests, Playwright with axe-core for end-to-end and accessibility tests, Lighthouse CI for performance budgets

## Run it

```bash
npm i
npm run dev
```

Open http://localhost:3000. Requires Node 22 or later.

| Command | What it does |
| --- | --- |
| `npm run build` / `npm run start` | Production build and server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

## Test it

```bash
npm run test   # Vitest, unit tests
npm run e2e    # Playwright (desktop and mobile projects) with axe
npm run lhci   # Lighthouse CI, mobile then desktop
```

`npm run e2e` builds the site and serves it on port 3100 (in CI the build is a separate step, so it only serves). `npm run lhci` needs a production build first (`npm run build`) and a local Chrome; it serves the site on port 3200.

## Quality decisions

**Design tokens.** Color, type scale, radius and motion are defined once in the Tailwind `@theme` block, and components use those tokens instead of loose values. Colors are chosen for contrast on the page background. Motion has three durations (fast, medium, slow) and one easing curve. Radii are multiples of a single base. Text sizes use `rem` and `clamp()`, not fixed pixels.

**Accessibility.**
- axe-core runs in Playwright with 0 violations, against WCAG 2.2 AA (`wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`) plus best-practice rules.
- No horizontal scroll from 320 to 1920 px wide, including with text zoomed to 200 %.
- Everything that animates respects `prefers-reduced-motion`, and clips can be paused.
- Keyboard and focus: visible focus styles, and every interaction works without a mouse.
- The home and case pages still read correctly with JavaScript disabled.

**Performance budget.** Lighthouse CI runs five times per page and takes the median run. Performance, accessibility, best practices and SEO must each score at least 90, or the build fails. The target is 95. The home page on mobile is the one page currently below that target.

## CI

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`, on Ubuntu 24.04 with Node 22 and read-only repository permissions. Superseded runs of the same ref are cancelled. Steps, in order: install, typecheck, lint, unit tests, build, Playwright and axe, Lighthouse CI on the mobile preset and then the desktop preset. The Playwright report is uploaded as an artifact when tests fail, and the Lighthouse results of each preset are always uploaded.

## Deploy and rollback

The site is deployed on Vercel. Every pull request gets a preview deployment, and merging to `main` deploys to production.

To roll back, open the project in Vercel and use **Instant Rollback** to return production to the previous deployment. No rebuild is needed.

## Fonts

Geist and Geist Mono are licensed under the SIL Open Font License 1.1. The license text sits next to each copy of the fonts: [`src/app/fonts/LICENSE.txt`](src/app/fonts/LICENSE.txt) for the web fonts and [`src/app/og-fonts/LICENSE.txt`](src/app/og-fonts/LICENSE.txt) for the ones the Open Graph images are drawn with.
