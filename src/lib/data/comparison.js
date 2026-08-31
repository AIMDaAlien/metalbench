// @ts-nocheck
export function compareRuns(runs) {
  if (runs.length < 2)
    return {
      compatible: false,
      reasons: ["Select at least two runs"],
      warnings: [],
      recommendationEligible: false,
    };
  const base = runs[0];
  const reasons = [];
  const warnings = [];
  for (const run of runs.slice(1)) {
    if (run.hardwareSlug !== base.hardwareSlug)
      reasons.push("Hardware differs");
    if (
      run.benchmarkVersion !== base.benchmarkVersion ||
      run.benchmarkSlug !== base.benchmarkSlug
    )
      reasons.push("Benchmark or version differs");
    if (run.taskSetHash !== base.taskSetHash) reasons.push("Task set differs");
    if (run.runtime.concurrency !== base.runtime.concurrency)
      reasons.push("Concurrency differs");
    for (const [key, label] of [
      ["name", "Runtime"],
      ["quant", "Quant"],
      ["contextTokens", "Context"],
      ["reasoningEffort", "Reasoning effort"],
    ])
      if ((run.runtime[key] ?? null) !== (base.runtime[key] ?? null))
        warnings.push(`${label} differs`);
  }
  return {
    compatible: reasons.length === 0,
    reasons: [...new Set(reasons)],
    warnings: [...new Set(warnings)],
    recommendationEligible:
      reasons.length === 0 &&
      runs.every((run) => run.evidence.level !== "published-external"),
  };
}
