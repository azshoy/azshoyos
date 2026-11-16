# AGENTS.md

Instructions for AI coding agents (and people) working in this repo. Read this before changing anything.

## What this is

The website of az.sh Oy at **https://azsh.fi** (the brand is az.sh; the az.sh domain does not serve this site).
Next.js 15, **pages router**, React 19, TypeScript. Deployed by Vercel from `master`: a merge to `master` is a production deploy.

It has two faces:

| Route | What people see | Source |
|---|---|---|
| `/` | A retro desktop "OS", drawn entirely in the browser | `pages/index.tsx`, `components/azshoyos/**` |
| `/portfolio`, `/portfolio/projects/<slug>`, `/portfolio/people/<slug>` | The portfolio: case studies and team, statically built with ISR (300 s) | `pages/portfolio/**`, `components/standalonePages/portfolioPro/**` |

And a machine-readable layer for search engines and AI agents:

| Route | What | Source |
|---|---|---|
| `/robots.txt` | Allow everything, AI crawlers named | `public/robots.txt` |
| `/sitemap.xml` | Every indexable URL | `pages/sitemap.xml.tsx` |
| `/llms.txt`, `/llms-full.txt` | Site index and full case studies in Markdown ([llmstxt.org](https://llmstxt.org)) | `pages/llms*.txt.tsx`, `util/markdown.ts` |
| `<page>.md` (`/index.md`, `/portfolio.md`, `/portfolio/projects.md`, `/portfolio/<projects\|people>/<slug>.md` …), or the page itself with `Accept: text/markdown` | Markdown twin of the page, with a `Link: rel=canonical` header | `middleware.ts` (runs only for those requests) → `pages/md/[target]/index.tsx` and `[slug].tsx` |
| JSON-LD, canonical, Open Graph in every `<head>` | One linked schema.org `@graph` per page | `components/seo/SeoHead.tsx`, `util/structuredData.ts` |

## Rules

1. **The desktop at `/` must look and behave exactly as before.** Do not change what `components/azshoyos/**` renders or how it responds to mouse, touch or keyboard.
   The `SiteSummary` in `pages/index.tsx` is visually hidden on purpose: it gives crawlers and screen readers the text the JS desktop lacks. Keep it hidden, keep its links at `tabIndex={-1}` and `prefetch={false}`, and only put text in it that people can also read on the site (it reuses the desktop's Readme text from `companyText.ts`). Hidden text that appears nowhere else is cloaking.
2. **Company facts live in one place: `util/site.ts`.** Every meta tag, JSON-LD node, llms.txt line and the hidden summary read from it. Each fact there must be backed by the trade register (business ID 3474773-5), the desktop's Readme/Contact files, or the portfolio API. Do not invent claims, clients or numbers.
3. **Content comes from the portfolio API**, not from this repo: the `behind-azsh` repo (Encore app) at `NEXT_PUBLIC_PORTFOLIO_API_URL`. To change a case study or a bio, change it there.
4. **URLs are slugs from titles** (`util/portfolio.ts`, `slugOf`). Old API-id URLs (`/portfolio/people/AleksiSeppnen`) 308 to the slug. If a title changes, its slug changes: add a redirect, or give the item a fixed `slug` field in the API.
5. **Never publish an empty portfolio.** `loadPortfolio()` (`util/portfolio.ts`) decides what an empty API response means: in `next dev` it renders empty so the desktop works offline; in a Vercel production build it retries once, then fails the deploy (the previous deployment stays live); at production runtime it throws, so ISR keeps the last good page and the text routes answer 503. Server code always goes through `loadPortfolio()`; the `useProjects`/`usePeople` hooks in `standalonePages/portfolio/data/` are only for the desktop's in-browser Portfolio app.
6. Do not commit `.env.local` or secrets. Everything `NEXT_PUBLIC_*` ships to the browser.

## Setup and commands

```bash
cp .env.example .env.local     # points at the production portfolio API (read-only GETs)
npm ci                         # npm is the package manager for local work and CI
npm run dev                    # http://localhost:3000
npm run verify                 # typecheck + lint + unit tests (tests/*.test.mjs)
npm run build && npm start     # production build on :3000
npm run smoke -- http://localhost:3000          # robots/sitemap/llms/.md/JSON-LD/canonicals/redirects/404s
npm run desktop-check -- http://localhost:3000  # headless Chrome: the desktop hydrates, Readme opens, Tab focuses nothing
```

Package manager: use npm locally and in CI. `pnpm-lock.yaml` is also committed, and Vercel picks its installer from the lockfiles unless the project overrides the install command; the first lines of a Vercel build log say which one it ran. CI builds both trees. If you change dependencies, update both lockfiles (`npm install` and `pnpm install`). The `allowBuilds` placeholders in `pnpm-workspace.yaml` ("set this to true or false") are the owner's decision; do not change them.

Environment: `NEXT_PUBLIC_PORTFOLIO_API_URL` (portfolio content) and `NEXT_PUBLIC_API_URL` (the desktop console challenge's backend, `util/session.ts`); see `.env.example`.

## How to verify a change

- Anything: `npm run verify`.
- Anything robots or agents read (head tags, JSON-LD, text routes, slugs, redirects): production build, then `npm run smoke`.
- Anything on `/`: `npm run desktop-check` as well. CI (`.github/workflows/ci.yml`) runs verify, build, smoke and desktop-check on every pull request.
- Anything visible: compare screenshots of `/`, `/portfolio`, a project and a person against https://azsh.fi at 1280×800 and 390×844, light and dark. Desktop icon positions vary between loads on both; compare behaviour, not icon pixels. Tab on `/` must not focus anything.
- After deploy: Google Rich Results Test and https://validator.schema.org on a project and a person page.

## Map

```
pages/
  index.tsx                 the desktop + hidden SiteSummary + home SEO
  portfolio/**              portfolio pages (getStaticProps + ISR)
  404.tsx                   portfolio-styled not-found page (noindex)
  sitemap.xml.tsx, llms.txt.tsx, llms-full.txt.tsx, md/[target]/[slug].tsx
                            text routes, see util/textRoute.ts
  people/, projects/        old big-tab portfolio; redirected to /portfolio/* in next.config.ts,
                            but the desktop's Portfolio app still renders these components
util/
  site.ts                   company facts, services, siteUrl, clip()
  portfolio.ts              loadPortfolio(), item URLs, people<->project links
  slug.ts                   slugify/slugOf (no imports, unit-tested)
  ldJson.ts                 safe JSON-LD serialisation (kept tiny: it ships to the browser)
  textRoute.ts              helper for the text routes (headers, 503 on API outage)
  session.ts                the desktop console challenge's API client
  structuredData.ts         schema.org graph builders
  markdown.ts               llms.txt and the .md twins
components/
  seo/SeoHead.tsx           all <head> tags robots read
  azshoyos/                 the desktop OS (windows, console, file reader, taskbar)
  standalonePages/portfolio/      data layer (fetchProjects, fetchPeople) + old big-tab UI
  standalonePages/portfolioPro/   the current portfolio UI
middleware.ts               routes agent requests (.md, Accept: text/markdown) to the text routes;
                            kept out of next.config rewrites so browsers download no extra code
scripts/smoke.mjs           dependency-free smoke test of the machine-readable layer
scripts/desktop-check.mjs   dependency-free headless-Chrome check of the desktop
tests/                      node:test unit tests for the pure helpers
```

The desktop console commands are in `components/azshoyos/Program/Console/Commands/` (copy `TEMPLATE.tsx`, register it in `availableCommands.tsx`).
`components/azshoyos/Program/DocumentReader/downloads/*.json` is made-up demo data for the desktop's file reader, not real users.
