# MetalBench frontend — Forge × Scout hybrid implementation brief

Status: approved design direction, ready for OpenCode implementation.

## Goal

Upgrade MetalBench's Run Index and Compare experience without replacing its existing dark purple-metal editorial identity. Keep the current CSS tokens, serif display typography, mono labels, borders, and restraint. The site should feel alive because it reports real lab conditions, not because it fakes a sci-fi dashboard.

## Chosen direction: Forge × Scout

- Forge is the homepage / hardware-story layer: lab pulse, DDR4 residency, system stress, and live machine state.
- Scout is the Compare layer: an evidence-first quality-vs-speed tradeoff plot with trustworthy tooltips/receipts.
- Atlas-style editorial verdict cards can appear inside individual findings/run pages later, but are not in this first frontend pass.

## Scope — first implementation pass

### 1. Homepage Lab Pulse (Forge)

Place immediately after the hero/current-verdict area.

Two machine cards, MacBook and Unraid:
- current model/runtime
- context window
- current / last-recorded tok/s
- RAM or unified-memory metric
- GPU VRAM where applicable
- state label such as `Stable — bandwidth limited`, `Loading weights`, `Serving`, or `Last recorded`

Use real data if an endpoint is available. If no live telemetry is available, render the latest captured snapshot and state its timestamp. Never make old data look live.

### 2. Run Index redesign

Replace the flat uniform run-card wall with:
- one large featured latest evidence card (Flash-Next IQ3_XXS)
- a compact metric rail: deterministic quality, decode speed, quant, context, source/receipt status
- chronological evidence stream grouped by machine / model family below
- filters remain useful but should become compact chips or concise controls
- clear state encoding:
  - verified win
  - tradeoff
  - no meaningful gain
  - no-go
  - documented / missing raw artifact

Keep existing run URLs and all source/receipt disclosure.

### 3. Compare-page Scout canvas

Build an SVG or accessible HTML scatter plot:
- X: decode tok/s
- Y: normalized deterministic quality (only compare runs sharing compatible batteries; do not fabricate cross-battery equivalence)
- bubble size: resident model footprint
- color: machine (existing accent for Mac, green for Unraid)
- hover/focus/click shows an accessible receipt panel: model, quant, runtime, context, benchmark battery, exact failures, raw artifacts.
- cohort tabs/filter must make comparison validity obvious: `Unraid 128 GB`, `MacBook 48 GB`, and `compatible battery only`.

Pin the Flash-Next comparison:
`IQ3_XXS 41/42, 16.92 tok/s` vs `Q3_K_XL 41/42, 14.5 tok/s`.

### 4. DDR4 residency and System Stress (Forge)

Use two charts on the Unraid hardware page or within the Lab Pulse detail view:

DDR4 residency:
- weights/model residency
- OS + Docker/services
- page cache / buffers
- available memory
- clear annotation that Flash-Next inference is memory-bandwidth-bound

System Stress:
- rolling 60-second traces when a real telemetry route exists: CPU, RAM residency, VRAM, GPU util, tok/s, optional disk activity
- otherwise render a last-recorded trace with timestamp and visual `RECORDED` status
- mood is data-driven, never decorative: stable/cool, working, pressure, loading.

## Motion and accessibility

- Number counters only on first visibility, modest duration.
- Live chart lines interpolate new real values; do not create fake random movement.
- Respect `prefers-reduced-motion`; keep full data understandable statically.
- Use semantic controls/labels, keyboard tooltip/panel access, visible focus states, and sufficient contrast.
- Avoid generic particles, terminal rain, fake gauges, or overly loud neon effects.

## Data constraints

- Do not change score semantics or hide data provenance.
- Never compare incompatible benchmark denominators as if equal.
- Label all note-derived/documented results clearly.
- Reuse existing site data structures and source references where possible.

## Acceptance checks

- `npm run check`
- `npm run test`
- `npm run build`
- `npm run scan:build`
- inspect in browser at desktop and mobile widths
- no regressions to current run/model/finding URLs
