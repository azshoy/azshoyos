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
| `<portfolio page>.md`, or the page with `Accept: text/markdown` | Markdown twin of a portfolio page | `middleware.ts` (runs only for those requests) → `pages/md/[target]/[slug].tsx` |
| JSON-LD, canonical, Open Graph in every `<head>` | One linked schema.org `@graph` per page | `components/seo/SeoHead.tsx`, `util/structuredData.ts` |

## Rules

1. **The desktop at `/` must look and behave exactly as before.** Do not change what `components/azshoyos/**` renders or how it responds to mouse, touch or keyboard.
   The `SiteSummary` in `pages/index.tsx` is visually hidden on purpose: it gives crawlers and screen readers the text the JS desktop lacks. Keep it hidden, keep its links at `tabIndex={-1}` and `prefetch={false}`, and only put text in it that people can also read on the site (it reuses the desktop's Readme text from `companyText.ts`). Hidden text that appears nowhere else is cloaking.
2. **Company facts live in one place: `util/site.ts`.** Every meta tag, JSON-LD node, llms.txt line and the hidden summary read from it. Each fact there must be backed by the trade register (business ID 3474773-5), the desktop's Readme/Contact files, or the portfolio API. Do not invent claims, clients or numbers.
3. **Content comes from the portfolio API**, not from this repo: the `behind-azsh` repo (Encore app) at `NEXT_PUBLIC_PORTFOLIO_API_URL`. To change a case study or a bio, change it there.
4. **URLs are slugs from titles** (`util/portfolio.ts`, `slugOf`). Old API-id URLs (`/portfolio/people/AleksiSeppnen`) 308 to the slug. If a title changes, its slug changes: add a redirect, or give the item a fixed `slug` field in the API.
5. **Never publish an empty portfolio.** `loadPortfolio()` throws on an empty API response outside the build, so ISR keeps the last good page and the text routes answer 503. Keep that behaviour.
6. Do not commit `.env.local` or secrets. Everything `NEXT_PUBLIC_*` ships to the browser.

## Setup and commands

```bash
cp .env.example .env.local     # points at the production portfolio API (read-only GETs)
npm ci                         # npm is the package manager for local work and CI
npm run dev                    # http://localhost:3000
npm run verify                 # typecheck + lint
npm run build && npm start     # production build on :3000
npm run smoke -- http://localhost:3000   # checks robots/sitemap/llms/.md/JSON-LD/canonicals/redirects/404s
```

`pnpm-lock.yaml` and `pnpm-workspace.yaml` are also committed; which one Vercel installs with is set in the Vercel project. Update both lockfiles if you change dependencies, or ask the owner to retire one.

## How to verify a change

- Anything: `npm run verify`.
- Anything robots or agents read (head tags, JSON-LD, text routes, slugs, redirects): production build, then `npm run smoke`. CI (`.github/workflows/ci.yml`) runs the same on every pull request.
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
  site.ts                   company facts, services, siteUrl
  portfolio.ts              API loading, slugs, people<->project links
  structuredData.ts         schema.org graph builders
  markdown.ts               llms.txt and the .md twins
components/
  seo/SeoHead.tsx           all <head> tags robots read
  azshoyos/                 the desktop OS (windows, console, file reader, taskbar)
  standalonePages/portfolio/      data layer (fetchProjects, fetchPeople) + old big-tab UI
  standalonePages/portfolioPro/   the current portfolio UI
middleware.ts               routes agent requests (.md, Accept: text/markdown) to the text routes;
                            kept out of next.config rewrites so browsers download no extra code
scripts/smoke.mjs           dependency-free smoke test
```

The desktop console commands are in `components/azshoyos/Program/Console/Commands/` (copy `TEMPLATE.tsx`, register it in `availableCommands.tsx`).
`components/azshoyos/Program/DocumentReader/downloads/*.json` is made-up demo data for the desktop's file reader, not real users.
