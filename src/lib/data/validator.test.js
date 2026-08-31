// @ts-nocheck
import { describe, expect, it } from "vitest";
import { validateCatalog, validateRun } from "./validator.js";
const base = {
  id: "valid-run",
  measuredAt: "2026-08-30T00:00:00Z",
  modelSlug: "model",
  hardwareSlug: "hardware",
  benchmarkSlug: "bench",
  benchmarkVersion: "1",
  taskSetHash: "sha256:test",
  runtime: {
    name: "runtime",
    version: "1",
    quant: "Q4",
    contextTokens: 4096,
    concurrency: 1,
  },
  score: { passed: 1, total: 1 },
  performance: {},
  evidence: {
    level: "documented-local",
    sourceTitle: "Note",
    sourceDate: "2026-08-30",
    limitations: ["raw unavailable"],
  },
  caveats: [],
};
const catalogFor = (run) => ({
  models: [{ slug: "model" }],
  hardware: [{ slug: "hardware" }],
  benchmarks: [{ slug: "bench" }],
  runs: [run],
  findings: [],
});
describe("catalog validation", () => {
  it("accepts documented, artifact-backed, and published evidence", () => {
    const variants = [
      base,
      {
        ...base,
        id: "artifact-run",
        evidence: {
          level: "artifact-backed-local",
          artifactUrl: "/artifacts/run.json",
          sha256: "a".repeat(64),
          harnessCommit: "abc123",
        },
      },
      {
        ...base,
        id: "external-run",
        evidence: {
          level: "published-external",
          publisher: "Lab",
          sourceUrl: "https://example.com/result",
          accessedAt: "2026-08-30",
        },
      },
    ];
    for (const run of variants)
      expect(validateCatalog(catalogFor(run))).toEqual([]);
  });
  it("rejects impossible scores", () => {
    expect(validateRun({ ...base, score: { passed: 2, total: 1 } })).toContain(
      "score must be integers with 0 <= passed <= total",
    );
  });
  it("rejects incomplete provenance and unknown references", () => {
    const errors = validateCatalog(
      catalogFor({
        ...base,
        modelSlug: "missing",
        evidence: {
          level: "artifact-backed-local",
          artifactUrl: "/bad",
          sha256: "x",
        },
      }),
    );
    expect(errors.join(" ")).toMatch(
      /artifact-backed-local evidence is incomplete/,
    );
    expect(errors.join(" ")).toMatch(/unknown model/);
  });
});
