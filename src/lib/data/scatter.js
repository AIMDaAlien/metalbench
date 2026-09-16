// @ts-nocheck
// Pure geometry helper for ScatterPlot.svelte (kept out of the component so
// the node vitest project can test it). W/H/pad constants stay in the component.
export function scatterScales(runs, { w, h, pad }) {
  const decode = (r) => r.performance?.decodeTokensPerSecond ?? null;
  const footprint = (r) => r.performance?.memory?.gib ?? r.performance?.vramGiB ?? null;

  const xs = runs.map(decode).filter((v) => Number.isFinite(v));
  let lo = xs.length ? Math.min(...xs) : 0;
  let hi = xs.length ? Math.max(...xs) : 1;
  if (lo === hi) {
    lo = Math.max(0, lo - 1);
    hi = hi + 1;
  }

  const sx = (v) => pad.l + ((v - lo) / (hi - lo)) * (w - pad.l - pad.r);
  const sy = (qPct) => pad.t + (1 - qPct / 100) * (h - pad.t - pad.b);
  const radius = (r) => {
    const f = footprint(r);
    return Number.isFinite(f) ? Math.min(22, 5 + Math.sqrt(f) * 1.6) : 6;
  };
  const ticks = [lo, (lo + hi) / 2, hi].map((v, i) => ({ v, x: sx(v), k: i }));

  return { lo, hi, sx, sy, radius, ticks };
}
