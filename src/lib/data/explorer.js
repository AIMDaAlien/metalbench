// @ts-nocheck
export const quantBand = (model) =>
  /nvfp/i.test(model.quant.family) ? "special" :
  model.quant.bits <= 2 ? "2-or-less" : model.quant.bits <= 4 ? "3-4" :
  model.quant.bits <= 6 ? "5-6" : "7-8";

export const memoryBand = (run) => {
  const gib = run.performance.memory?.gib;
  return gib == null ? "unmeasured" : gib < 6 ? "under-6" : gib < 12 ? "6-12" : "12-plus";
};

export function filterRuns(runs, models, filters = {}) {
  const modelBySlug = new Map(models.map((model) => [model.slug, model]));
  return runs.filter((run) => {
    const model = modelBySlug.get(run.modelSlug);
    return model &&
      (!filters.capability || model.capabilities.includes(filters.capability) || model.bestUseCases.includes(filters.capability)) &&
      (!filters.hardware || run.hardwareSlug === filters.hardware) &&
      (!filters.runtime || run.runtime.name === filters.runtime) &&
      (!filters.family || model.familySlug === filters.family) &&
      (!filters.architecture || model.architecture === filters.architecture) &&
      (!filters.quant || quantBand(model) === filters.quant) &&
      (!filters.memory || memoryBand(run) === filters.memory) &&
      (!filters.evidence || run.evidence.level === filters.evidence);
  });
}

export function groupFamilies(models, runs) {
  return models.reduce((groups, model) => {
    const family = groups.find((item) => item.slug === model.familySlug);
    const configuration = { model, runs: runs.filter((run) => run.modelSlug === model.slug) };
    if (family) family.configurations.push(configuration);
    else groups.push({ slug: model.familySlug, name: model.family, configurations: [configuration] });
    return groups;
  }, []);
}

export function cohortRuns(runs, selectedRunId) {
  const selected = runs.find((run) => run.id === selectedRunId) || runs[0];
  if (!selected) return [];
  return runs.filter((run) => run.benchmarkSlug === selected.benchmarkSlug &&
    run.benchmarkVersion === selected.benchmarkVersion && run.taskSetHash === selected.taskSetHash);
}

export function normalizeBars(runs, metric) {
  const value = (run) => metric === "quality" ? run.score.passed / run.score.total * 100 :
    metric === "decode" ? run.performance.decodeTokensPerSecond :
    metric === "prefill" ? run.performance.prefillTokensPerSecond : run.performance.memory?.gib;
  const measured = runs.map(value).filter(Number.isFinite);
  const max = Math.max(...measured, 0);
  return runs.map((run) => ({ run, value: value(run), width: Number.isFinite(value(run)) && max ? value(run) / max * 100 : null }));
}
