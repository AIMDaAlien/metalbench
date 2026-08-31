# MetalBench

Evidence-first static benchmark publication for local AI runs.

## Commands

```sh
npm install
npm run validate
npm run check
npm test
npm run test:e2e
npm run build
npm run scan:build
```

`build/` is a fully prerendered site with trailing-slash route directories and no SPA fallback. `build/revision.txt` records the source commit when the worktree is clean.

## Data

- Public catalog: `src/lib/data/catalog.json`
- Claim inventory: `docs/claim-inventory.md`
- Sanitized artifacts: `static/artifacts/`

Import a raw agent-benchmark result with `npm run ingest -- path/to/raw-run.json`. The importer strips transcripts by default, retains approved task excerpts only, scans the sanitized output, writes its SHA-256, and refuses duplicate run IDs.

Initial note-derived records are labeled **Documented local result**. They are not called reproduced. External published results never determine local winner recommendations.
