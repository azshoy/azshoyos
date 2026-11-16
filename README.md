# azsh.fi

The website of [az.sh](https://azsh.fi), a software engineering and design consultancy from Oulu and Helsinki, Finland.

- **`/`** is a retro desktop OS you can click around in: windows, a console with commands, a file explorer, a game.
- **[`/portfolio`](https://azsh.fi/portfolio)** has the case studies and the team.
- **For agents:** [`/llms.txt`](https://azsh.fi/llms.txt), [`/llms-full.txt`](https://azsh.fi/llms-full.txt), and a Markdown version of every portfolio page (add `.md`, or send `Accept: text/markdown`).

Next.js 15 (pages router), React 19, TypeScript, deployed on Vercel. Content comes from the portfolio API in the `behind-azsh` repo.

## Run it

```bash
cp .env.example .env.local
npm ci
npm run dev        # http://localhost:3000
```

Before opening a pull request:

```bash
npm run verify                              # typecheck + lint
npm run build && npm start &
npm run smoke -- http://localhost:3000      # what robots and agents see
```

CI runs the same checks on every pull request. Merging to `master` deploys to production.

## Working on it

Read [AGENTS.md](AGENTS.md) first, whether you are a person or a coding agent. It has the route map, the rules (the desktop must not change; company facts live in `util/site.ts`), and how to verify a change.

### Add a console command

1. Copy `components/azshoyos/Program/Console/Commands/TEMPLATE.tsx` to `<yourCommand>.tsx` and fill it in.
2. Register it in the `commands` dict in `components/azshoyos/Program/Console/availableCommands.tsx`.
3. ???
4. Profit.
