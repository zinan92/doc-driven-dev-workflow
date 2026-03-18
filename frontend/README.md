# Workflow Driven Developer — Frontend

Read-only replay cockpit for visualizing Doc-Driven Development Workflow tasks.

## Quick Start

```bash
cd frontend
npm install
npm run build:data   # normalize example-task artifacts into src/data/example-task.json
npm run dev          # start dev server
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build:data` | Rebuild normalized example-task snapshot |
| `npm test` | Run all Vitest tests |
| `npm run build` | TypeScript check + production build |

## Architecture

- `scripts/build-example-task.ts` — reads `examples/example-task/` artifacts, emits `src/data/example-task.json`
- `src/data/canonical-stages.ts` — the 15-stage canonical workflow definition
- `src/lib/map-artifacts-to-stages.ts` — maps handoff artifacts to canonical stages
- `src/lib/build-replay-snapshots.ts` — builds replayable state from run-log events
- `src/components/` — UI panels (summary bar, workflow graph, step detail, artifact preview, timeline)
- `src/state/use-replay-state.ts` — React state for node/event selection

## V1 Scope

- Single example task only
- Read-only, no mutations
- Manual replay via timeline clicks
- All 15 canonical stages rendered even when the example task has fewer artifacts
