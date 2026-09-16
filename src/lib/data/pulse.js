// @ts-nocheck
// Derived views over catalog data only. Nothing here invents telemetry:
// every metric carries the run id and measuredAt date it came from.

const newest = (runs) =>
  [...runs].sort((a, b) => b.measuredAt.localeCompare(a.measuredAt) || a.id.localeCompare(b.id));

// One card per machine. All values are "last recorded", never live.
export function labPulse(catalog) {
  return catalog.hardware.map((machine) => {
    const runs = newest(
      catalog.runs.filter((run) => run.hardwareSlug === machine.slug),
    );
    const latest = runs[0] ?? null;
    const sourced = (runs, value, extra = {}) => {
      const run = runs.find((item) => Number.isFinite(value(item)));
      return run
        ? { value: value(run), runId: run.id, measuredAt: run.measuredAt, ...extra(run) }
        : null;
    };
    const latestRuntime = (item) => (item === latest ? null : item);
    return {
      machine,
      latestRun: latest,
      model: latest ? catalog.models.find((m) => m.slug === latest.modelSlug) ?? null : null,
      runtime: latest?.runtime ?? null,
      contextTokens: latest?.runtime?.contextTokens ?? null,
      bottleneck: machine.bottleneck ?? null,
      decode: sourced(runs, (r) => r.performance?.decodeTokensPerSecond, latestRuntime),
      memory: sourced(runs, (r) => r.performance?.memory?.gib, (r) => ({
        kind: r.performance.memory.kind,
      })),
      vram: sourced(runs, (r) => r.performance?.vramGiB, latestRuntime),
      state: latest
        ? { label: "Last recorded", measuredAt: latest.measuredAt }
        : { label: "No runs recorded", measuredAt: null },
    };
  });
}

// A cohort is the only set of runs whose scores are directly comparable:
// same hardware + same benchmark + same version + same task set hash.
export const cohortKey = (run) =>
  `${run.hardwareSlug}|${run.benchmarkSlug}|${run.benchmarkVersion}|${run.taskSetHash}`;

export function cohorts(runs) {
  const list = [];
  for (const run of runs) {
    const key = cohortKey(run);
    const found = list.find((item) => item.key === key);
    if (found) found.runs.push(run);
    else
      list.push({
        key,
        hardwareSlug: run.hardwareSlug,
        benchmarkSlug: run.benchmarkSlug,
        benchmarkVersion: run.benchmarkVersion,
        taskSetHash: run.taskSetHash,
        runs: [run],
      });
  }
  return list.sort((a, b) => b.runs.length - a.runs.length || a.key.localeCompare(b.key));
}

// Outcome codes are computed from cohort position, not editorial verdicts:
//   leading   — top quality and top decode in its own cohort
//   tradeoff  — top quality in its cohort but not the fastest
//   no-gain   — a cohort peer matched-or-beat its quality while decoding faster
//   recorded  — sole entry, or nothing stronger/slower to compare against
// "Verified win" and "no-go" stay out of scope: no artifact-backed runs exist yet.
export function outcomeState(run, runs) {
  const peers = runs.filter((item) => item.id !== run.id && cohortKey(item) === cohortKey(run));
  const quality = (item) => item.score.passed / item.score.total;
  const speed = (item) => item.performance?.decodeTokensPerSecond ?? null;
  if (!peers.length) return { code: "recorded", label: "Recorded" };
  const myQuality = quality(run);
  const mySpeed = speed(run);
  const beatenOnBoth = peers.some(
    (peer) => quality(peer) >= myQuality && speed(peer) != null && (mySpeed == null || speed(peer) > mySpeed),
  );
  if (beatenOnBoth) return { code: "no-gain", label: "No meaningful gain" };
  const topQuality = Math.max(...peers.map(quality));
  const fastestPeer = peers.some((peer) => speed(peer) != null && (mySpeed == null || speed(peer) > mySpeed));
  if (myQuality >= topQuality)
    return fastestPeer
      ? { code: "tradeoff", label: "Tradeoff" }
      : { code: "leading", label: "Cohort leader" };
  return { code: "recorded", label: "Recorded" };
}

// Raw-artifact disclosure chip, straight from the evidence record.
export function artifactState(run) {
  return run.evidence.level === "documented-local"
    ? { code: "documented", label: "Documented · raw artifact missing" }
    : { code: run.evidence.level, label: run.evidence.level };
}
