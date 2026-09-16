// @ts-nocheck
import { describe, expect, it } from "vitest";
import { scatterScales } from "./scatter.js";

const geom = { w: 660, h: 300, pad: { l: 44, r: 16, t: 16, b: 42 } };
const run = (id, decode, gib) => ({
  id,
  performance: {
    ...(decode == null ? {} : { decodeTokensPerSecond: decode }),
    ...(gib == null ? {} : { memory: { gib } }),
  },
});

describe("scatterScales", () => {
  it("pads empty and single-value domains without going below zero", () => {
    expect([scatterScales([], geom).lo, scatterScales([], geom).hi]).toEqual([0, 1]);
    const one = scatterScales([run("a", 30, 4)], geom);
    expect([one.lo, one.hi]).toEqual([29, 31]);
    const zero = scatterScales([run("b", 0, 4)], geom);
    expect([zero.lo, zero.hi]).toEqual([0, 1]);
  });
  it("maps quality to SVG y so higher quality sits higher on screen", () => {
    const s = scatterScales([], geom);
    expect(s.sy(100)).toBeLessThan(s.sy(0));
    expect(s.sy(100)).toBeCloseTo(16); // pad.t — 100% is the top
    expect(s.sy(0)).toBeCloseTo(300 - 42); // h - pad.b — 0% is the bottom
  });
  it("clamps bubble radius at 22 and defaults a missing footprint to 6", () => {
    const s = scatterScales([], geom);
    expect(s.radius(run("big", 10, 10000))).toBe(22);
    expect(s.radius(run("mid", 10, 4))).toBeCloseTo(5 + Math.sqrt(4) * 1.6);
    expect(s.radius(run("none", 10, null))).toBe(6);
  });
  it("keeps runs without a decode measurement out of the domain (listed, not drawn)", () => {
    const s = scatterScales([run("a", 10, 4), run("b", 50, 4), run("c", null, 4)], geom);
    expect([s.lo, s.hi]).toEqual([10, 50]);
    expect(s.ticks.map((t) => t.v)).toEqual([10, 30, 50]);
  });
});
