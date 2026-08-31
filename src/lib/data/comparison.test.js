// @ts-nocheck
import { describe, expect, it } from "vitest";
import { compareRuns } from "./comparison.js";
const run = (changes = {}) => ({
  hardwareSlug: "h",
  benchmarkSlug: "b",
  benchmarkVersion: "1",
  taskSetHash: "t",
  runtime: { name: "r", quant: "q", contextTokens: 1, concurrency: 1 },
  evidence: { level: "documented-local" },
  ...changes,
});
describe("run comparison", () => {
  it("permits matching runs and exposes configuration warnings", () => {
    const result = compareRuns([
      run(),
      run({
        runtime: {
          name: "other",
          quant: "q2",
          contextTokens: 2,
          reasoningEffort: "low",
          concurrency: 1,
        },
      }),
    ]);
    expect(result.compatible).toBe(true);
    expect(result.warnings).toEqual([
      "Runtime differs",
      "Quant differs",
      "Context differs",
      "Reasoning effort differs",
    ]);
  });
  it.each([
    ["hardwareSlug", "other", "Hardware differs"],
    ["taskSetHash", "other", "Task set differs"],
  ])("blocks mismatched %s", (key, value, message) => {
    expect(compareRuns([run(), run({ [key]: value })]).reasons).toContain(
      message,
    );
  });
  it("blocks concurrency mismatch", () => {
    expect(
      compareRuns([
        run(),
        run({
          runtime: { name: "r", quant: "q", contextTokens: 1, concurrency: 2 },
        }),
      ]).reasons,
    ).toContain("Concurrency differs");
  });
  it("excludes external results from winner recommendations", () => {
    expect(
      compareRuns([run(), run({ evidence: { level: "published-external" } })])
        .recommendationEligible,
    ).toBe(false);
  });
});
