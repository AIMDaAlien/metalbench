// @ts-nocheck
import { describe, expect, it } from "vitest";
import catalog from "./catalog.json";
import { artifactState, cohortKey, cohorts, labPulse, outcomeState } from "./pulse.js";

describe("lab pulse snapshots", () => {
  const pulse = labPulse(catalog);
  it("covers every machine and never claims a live state", () => {
    expect(pulse.map((item) => item.machine.slug)).toEqual(
      catalog.hardware.map((item) => item.slug),
    );
    for (const card of pulse) {
      expect(card.state.label).toMatch(/Last recorded|No runs recorded/);
      expect(card.state.label).not.toMatch(/live|serving|loading/i);
    }
  });
  it("sources every metric from a real run with its date", () => {
    for (const card of pulse) {
      for (const metric of [card.decode, card.memory, card.vram]) {
        if (!metric) continue;
        const run = catalog.runs.find((item) => item.id === metric.runId);
        expect(run).toBeTruthy();
        expect(metric.measuredAt).toBe(run.measuredAt);
      }
      const expected = Math.max(
        ...catalog.runs
          .filter((run) => run.hardwareSlug === card.machine.slug)
          .map((run) => Date.parse(run.measuredAt)),
      );
      expect(Date.parse(card.latestRun.measuredAt)).toBe(expected);
    }
  });
  it("reports the Unraid VRAM record without implying live residency", () => {
    const unraid = pulse.find((item) => item.machine.slug === "unraid-128gb-rtx3060");
    expect(unraid.vram.value).toBe(6.3);
    expect(unraid.vram.runId).toBe("flash-next-q3kxl-agent-2026-08-28");
  });
});

describe("cohorts", () => {
  it("groups only identical hardware, benchmark, version, and task set", () => {
    const groups = cohorts(catalog.runs);
    for (const group of groups) {
      for (const run of group.runs) expect(cohortKey(run)).toBe(group.key);
    }
    const text58 = groups.find((group) => group.benchmarkSlug === "mac-text-58");
    expect(text58.runs.map((run) => run.id).sort()).toEqual([
      "bonsai-27b-text-2026-08-09",
      "lfm25-26b-text-2026-08-09",
      "lfm25-8b-text-2026-08-09",
      "maple-preview-text-2026-08-09",
    ]);
  });
  it("keeps the two Flash-Next runs apart: different batteries", () => {
    expect(
      cohorts(catalog.runs).some(
        (group) =>
          group.benchmarkSlug === "quant-sensitivity" && group.runs.length > 1,
      ),
    ).toBe(false);
  });
});

const makeRun = (id, changes = {}) => ({
  id,
  hardwareSlug: "h",
  benchmarkSlug: "b",
  benchmarkVersion: "1",
  taskSetHash: "t",
  score: { passed: 1, total: 2 },
  performance: { decodeTokensPerSecond: 10 },
  evidence: { level: "documented-local" },
  ...changes,
});

describe("outcome states", () => {
  const q = (id, passed, decode) =>
    makeRun(id, {
      score: { passed, total: 100 },
      performance: { decodeTokensPerSecond: decode },
    });
  it("flags a run a peer matched on quality while decoding faster", () => {
    const slow = q("slow", 60, 9);
    const fastPeer = q("fast-peer", 60, 12);
    expect(outcomeState(slow, [slow, fastPeer]).code).toBe("no-gain");
  });
  it("labels the sole top-quality-slower run a tradeoff", () => {
    const bestSlow = q("best-slow", 80, 8);
    const worseFast = q("worse-fast", 60, 12);
    expect(outcomeState(bestSlow, [bestSlow, worseFast]).code).toBe("tradeoff");
  });
  it("labels the top-quality-fastest run a cohort leader", () => {
    const champ = q("champ", 70, 12);
    const slower = q("slower", 70, 9);
    expect(outcomeState(champ, [champ, slower]).code).toBe("leading");
  });
  it("keeps sole runs neutral", () => {
    const sole = q("sole", 50, 10);
    expect(outcomeState(sole, [sole]).code).toBe("recorded");
  });
});

describe("artifact disclosure", () => {
  it("marks documented-local runs as missing raw artifacts", () => {
    expect(artifactState(makeRun("a")).label).toBe(
      "Documented · raw artifact missing",
    );
    expect(
      artifactState(
        makeRun("b", { evidence: { level: "artifact-backed-local" } }),
      ).code,
    ).toBe("artifact-backed-local");
  });
});
