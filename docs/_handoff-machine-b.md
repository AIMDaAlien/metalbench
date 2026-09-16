# Handoff — Machine B: publish one tested webpage to the MetalBench fleet

This doc tells **the other machine** (Machine B) what to do so that your one tested
webpage shows up in the fleet as a proper leaderboard entry — and links to what it created.

Read it top to bottom, in order. Do not skip steps. Everything below assumes you are
not the author of `github.com/AIMDaAlien/metalbench` — you are committing
*your* result into it.

---

## 0. What this fleet actually is (so you don't reinvent it)

`github.com/AIMDaAlien/metalbench` is a **static SvelteKit site**. It has
no SPA fallback and no server. The content is authored in **one** file:

```
src/lib/data/catalog.json   <- models[] + runs[] + hardware[]
```

A build step prerenders the whole site to `build/`, producing:

- per-model pages → `build/models/<slug>/`        (this is the *leaderboard entry*)
- per-run pages →   `build/runs/<id>/`            (this is *what the model created*)
- per-hardware pages → `build/hardware/<slug>/`

So "a page under the model itself" = a **model slug** entry that links to one of its
**run pages** (what it created). You do **not** hand-write HTML. You add a model entry +
a run entry to `catalog.json`, then run the build. The build is what creates both pages
and wires their links together automatically (existing entries already do this — see
`build/models/qwen38-27b-8bit/index.html`, which links to `build/runs/qwen38-8bit-.../`).

The fleet passes all local gates at HEAD. Your job: add one tested webpage, prove it
builds and passes the fleet's own validation, then commit.

---

## 1. Clone it (you already have write access)

On Machine B, from any empty directory:

```bash
git clone https://github.com/AIMDaAlien/metalbench.git metalbench
cd metalbench
npm install
```

If `git clone` asks for credentials, you already have a token authenticated as
`AIMDaAlien`; use it. If not, ask the owner to grant you `repo` write on that repo. Do
**not** fork-and-sync for this — they asked you to commit *directly* into the fleet.

---

## 2. Discover what you produced (the tested webpage)

The owner said *"let the model discover it."* That means **find your own result** rather
than hard-coding a path. On Machine B, look for the thing you built/produced:

- A prerendered site folder (named `build`, `dist`, `public`, or similar) containing `index.html`.
- Or a raw run record (JSON with keys like `id`, `tasks`, `run`, `modelSlug`, `score`).

If you find a prerendered tree, that's your artifact — copy it into the fleet as described
in §5. If you only have a raw run JSON, register it via the fleet's importer (§6).

If you genuinely cannot locate your own output directory, **stop and say so** — do not
guess a path. A wrong path means a fake entry, which this fleet refuses at build time.

---

## 3. Decide the entry identity — match the fleet's format exactly

Your leaderboard entry must read like the existing ones: `qwen3.8 27b q5 on "BigRig"`.

That maps to three slug fields. You must supply all three, lower-case with dashes:

| Field        | Example                       | Source                                   |
|--------------|-------------------------------|------------------------------------------|
| `modelSlug`  | `qwen38-27b-q5`               | your model + quant (lower-case, dashes)  |
| `hardwareSlug` | `bigrig`                    | the box name in quotes → slugified       |
| `runId`      | `qwen38-27b-q5-<short>-YYYY-MM-DD` | a unique lowercase slug + date       |

Rules (enforced by `src/lib/data/validator.js` — if you break these, the build refuses):

- Slugs match `^[a-z0-9]+(?:-[a-z0-9]+)*$` — no spaces, underscores, capitals, parentheses.
- `id` (the run id) is unique: the fleet **refuses** a duplicate and requires a new ID +
  `supersedesRunId` instead. Pick an id that has never appeared (e.g.
  `qwen38-27b-q5-webpage-production-2026-09-16`).
- Every run needs: `id`, `measuredAt` (ISO datetime), `modelSlug`, `hardwareSlug`,
  `benchmarkSlug`, `benchmarkVersion`, `taskSetHash`, `runtime`, `score` {passed,total},
  `performance`, `evidence` (with a published level), and `caveats`.

Existing hardware slugs in the fleet are `unraid-128gb-rtx3060` and
`macbook-pro-m5-pro-48gb`. `"BigRig"` is new — register a hardware entry for it so its page
(`build/hardware/<slug>/`) exists. See the existing hardware entries in `catalog.json` for
the required fields (spec, role, publicNotes, memoryBudget, bottleneck).

Existing model families in `catalog.json` (do the fleet already have it?):
qwen36-nvfp4, flash-next-q3kxl, flash-next-iq3xxs, qwen38-27b-4bit, qwen38-27b-axq6,
qwen38-27b-8bit, gemma4-12b-qat-q8, gemma4-12b-qat-q4, lfm25-8b-a1b, lfm25-26b,
ternary-bonsai-27b, maple-preview-20b, qwen35-4b-vlm, nanbeige42-3b-q4km, sparkx25-4b-4bit,
k2-horizon-mova-iq3xxs, k2-horizon-mova-iq4xs. If `qwen38-27b-q5` is absent, add a model
entry (see `models[]`).

---

## 4. Add your entry to the content file

Open `src/lib/data/catalog.json` and:

1. **Append a hardware entry** to `hardware[]` for BigRig (clone an existing object, rewrite
   the slug/name/spec — keep all required fields).
2. **Append a model entry** to `models[]` for your `modelSlug` (clone an existing object,
   rewrite fields; keep `slug`, `familySlug`, `name`, `parameters`, `parameterCount`,
   `architecture`, `modalities`, `capabilities`, `bestUseCases`, `summary`, `strengths`,
   `weaknesses`, `recommendation`).
3. **Append a run entry** to `runs[]` with your chosen `runId`, its `modelSlug`,
   `hardwareSlug`, and — critically — an `evidence` object that points at *what you created*:
   - If your result is a **prerendered site tree** you publish, use `evidence.level:
     "artifact-backed-local"` and `evidence.artifactUrl` + `sha256` of the artifact (the fleet
     computes/verifies SHA-256 for you — do not fabricate it; run `scripts/artifacts.mjs` to
     check hashes).
   - If you only have a **transcribed note** (no raw JSON), use `evidence.level:
     "documented-local"` and set `limitations` honestly (this is the fleet's standard for
     note-derived results). It still builds and still gets a model page + run page.

Do not edit `build/` by hand — the build regenerates it. Do not touch sibling entries
(you only append).

---

## 5. Publish the tested webpage (two options — pick one)

The fleet's `.gitignore` excludes `build/`, so the prerendered site is **not** committed
by default. It is deployed to Unraid via Caddy at `https://metalbench.teardown.cafe/`
(see `docs/deployment.md`). Choose how your page reaches a user:

**Option A (recommended — deploy to the fleet's host):**
After building (§7), copy `build/` to your staging area on the Unraid host and promote it
exactly as `docs/deployment.md` describes (back up → copy staging → add the Caddy
configuration → `caddy validate` → atomic rename → reload → check public routes). Your new
page is reachable at `https://metalbench.teardown.cafe/models/<modelSlug>/` and
`.../runs/<runId>/`.

**Option B (commit the prerendered snapshot into this repo):**
If you want the tested webpage committed *into* `metalbench` (so anyone
cloning it sees the finished page), run `npm run build` (§7) then force-add only your new
pages:

```bash
git add -f build/
```

Force-adding `build/` overrides the fleet's `.gitignore`. Do this only if you intend the
prerendered pages to live in git. Otherwise skip `git add build/` and deploy via Option A
(or just run the fleet's local preview with `npm run preview`).

---

## 6. Register a raw run (only if you have structured task data)

If your produced thing is a **structured benchmark result** (raw run JSON with `tasks` /
`run`), the fleet ships an importer that strips transcripts, keeps only approved excerpts,
computes the artifact SHA-256, and refuses duplicates:

```bash
npm run ingest -- path/to/raw-run.json
```

If you instead have a **prerendered folder of HTML**, skip the importer and register the run
manually in `catalog.json` (§4) as "Option A" / "Option B", pointing each run at its own
`build/runs/<runId>/index.html`.

---

## 7. Build, then commit — in order

```bash
npm run build            # prerender to build/; writes build/revision.txt
cat build/revision.txt   # must equal: git rev-parse HEAD   (clean tree check)
npm run validate         # fleet's own gates: site + artifact hashes + schema
```

If any gate fails, fix the entry in `catalog.json` and rebuild — do not commit a failing
state. Then:

```bash
git add src/lib/data/catalog.json          # the only content file that should change
[ if Option B: git add -f build/ ]          # commit the prerendered snapshot
git commit -m "docs: document [modelSlug] run on BigRig — <id>"
git push
```

Keep the commit message short and evidence-first, like the fleet's history (`docs:`,
`test(...)`, `feat(...)` prefixes). After push, confirm your entry exists on GitHub:

```bash
git ls-remote --heads origin main
curl -s https://github.com/AIMDaAlien/metalbench/main/build/models/<modelSlug>/ | head -c 200
```

(For Option A the canonical proof is `https://metalbench.teardown.cafe/models/<modelSlug>/`.)

---

## 8. What "done" looks like (checklist)

- [ ] Cloned `github.com/AIMDaAlien/metalbench` and ran `npm install`.
- [ ] Located your own produced webpage / result (if truly not found, STOP and report it).
- [ ] Chose a unique `runId` (lower-case slug + date) that doesn't already exist.
- [ ] Added a `BigRig` hardware entry + your `modelSlug` model entry to `catalog.json`.
- [ ] Added one run entry with an honest `evidence` block pointing at what you created.
- [ ] Ran `npm run build`; `build/revision.txt` equals `git rev-parse HEAD`.
- [ ] Ran `npm run validate`; no errors.
- [ ] Committed (source +, if Option B, `build/`) and pushed.
- [ ] Verified a live page exists at `.../models/<modelSlug>/` and links to
      `.../runs/<runId>/`.

The entry in the leaderboard then reads exactly like the others:
**`qwen3.8 27b q5 on "BigRig"`** — and its page links to what it created.
