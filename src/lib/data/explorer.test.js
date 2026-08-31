// @ts-nocheck
import { describe, expect, it } from "vitest";
import { cohortRuns, filterRuns, groupFamilies, normalizeBars } from "./explorer.js";
const models = [
  { slug: "a-q4", familySlug: "a", family: "A", architecture: "dense", capabilities: ["agent"], bestUseCases: [], quant: { bits: 4, family: "Q4" } },
  { slug: "a-q8", familySlug: "a", family: "A", architecture: "dense", capabilities: ["vision"], bestUseCases: [], quant: { bits: 8, family: "Q8" } },
];
const run = (id, modelSlug, passed, memory) => ({ id, modelSlug, hardwareSlug: "mac", benchmarkSlug: "b", benchmarkVersion: "1", taskSetHash: "same", runtime: { name: "mlx" }, score: { passed, total: 10 }, performance: memory ? { memory: { gib: memory, kind: "warm-rss" } } : {}, evidence: { level: "documented-local" } });
const runs = [run("one", "a-q4", 8, 5), run("two", "a-q8", 8), { ...run("three", "a-q4", 9, 8), taskSetHash: "other" }];

describe("Explorer data helpers", () => {
  it("combines filters and groups sibling configurations", () => {
    expect(filterRuns(runs, models, { capability: "agent", quant: "3-4", memory: "under-6" }).map((item) => item.id)).toEqual(["one"]);
    expect(groupFamilies(models, runs)[0].configurations).toHaveLength(2);
  });
  it("keeps quality cohorts strict and handles ties and missing metrics", () => {
    expect(cohortRuns(runs, "one").map((item) => item.id)).toEqual(["one", "two"]);
    const bars = normalizeBars(cohortRuns(runs, "one"), "quality");
    expect(bars.map((bar) => bar.width)).toEqual([100, 100]);
    expect(normalizeBars(runs, "memory")[1].width).toBeNull();
  });
});
