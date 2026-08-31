// @ts-nocheck
const requiredRunKeys = [
  "id",
  "measuredAt",
  "modelSlug",
  "hardwareSlug",
  "benchmarkSlug",
  "benchmarkVersion",
  "taskSetHash",
  "runtime",
  "score",
  "performance",
  "evidence",
  "caveats",
];
const evidenceLevels = new Set([
  "documented-local",
  "artifact-backed-local",
  "published-external",
]);
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateRun(run) {
  const errors = [];
  for (const key of requiredRunKeys)
    if (!(key in run)) errors.push(`missing ${key}`);
  if (!run.id || !slug.test(run.id)) errors.push("id must be a lowercase slug");
  if (!Number.isFinite(Date.parse(run.measuredAt)))
    errors.push("measuredAt must be ISO date-time");
  if (
    !Number.isInteger(run.score?.passed) ||
    !Number.isInteger(run.score?.total) ||
    run.score.total < 1 ||
    run.score.passed < 0 ||
    run.score.passed > run.score.total
  )
    errors.push("score must be integers with 0 <= passed <= total");
  if (
    !Number.isInteger(run.runtime?.contextTokens) ||
    run.runtime.contextTokens < 1
  )
    errors.push("runtime.contextTokens must be positive");
  if (
    !Number.isInteger(run.runtime?.concurrency) ||
    run.runtime.concurrency < 1
  )
    errors.push("runtime.concurrency must be positive");
  if (!evidenceLevels.has(run.evidence?.level))
    errors.push("unknown evidence level");
  if (
    run.evidence?.level === "documented-local" &&
    (!run.evidence.sourceTitle ||
      !run.evidence.sourceDate ||
      !run.evidence.limitations?.length)
  )
    errors.push("documented-local evidence is incomplete");
  if (
    run.evidence?.level === "artifact-backed-local" &&
    (!/^\/artifacts\/[a-zA-Z0-9._-]+\.json$/.test(
      run.evidence.artifactUrl || "",
    ) ||
      !/^[a-f0-9]{64}$/.test(run.evidence.sha256 || "") ||
      !run.evidence.harnessCommit)
  )
    errors.push("artifact-backed-local evidence is incomplete");
  if (run.evidence?.level === "published-external") {
    try {
      const url = new URL(run.evidence.sourceUrl);
      if (url.protocol !== "https:" || isIpLiteral(url.hostname))
        errors.push("published source must be HTTPS without an IP host");
    } catch {
      errors.push("published source URL is invalid");
    }
    if (!run.evidence.publisher || !run.evidence.accessedAt)
      errors.push("published-external evidence is incomplete");
  }
  return errors;
}

export function validateCatalog(catalog) {
  const errors = [];
  for (const key of ["models", "hardware", "benchmarks", "runs", "findings"])
    if (!Array.isArray(catalog[key])) errors.push(`${key} must be an array`);
  if (errors.length) return errors;
  const unique = (items, key, label) => {
    const seen = new Set();
    for (const item of items) {
      if (seen.has(item[key])) errors.push(`duplicate ${label}: ${item[key]}`);
      seen.add(item[key]);
    }
    return seen;
  };
  const models = unique(catalog.models, "slug", "model");
  const hardware = unique(catalog.hardware, "slug", "hardware");
  const benchmarks = unique(catalog.benchmarks, "slug", "benchmark");
  const runs = unique(catalog.runs, "id", "run");
  unique(catalog.findings, "slug", "finding");
  for (const run of catalog.runs) {
    for (const error of validateRun(run))
      errors.push(`${run.id || "run"}: ${error}`);
    if (!models.has(run.modelSlug)) errors.push(`${run.id}: unknown model`);
    if (!hardware.has(run.hardwareSlug))
      errors.push(`${run.id}: unknown hardware`);
    if (!benchmarks.has(run.benchmarkSlug))
      errors.push(`${run.id}: unknown benchmark`);
  }
  for (const finding of catalog.findings)
    for (const id of finding.runIds || [])
      if (!runs.has(id)) errors.push(`${finding.slug}: unknown run ${id}`);
  return errors;
}

export function assertValidCatalog(catalog) {
  const errors = validateCatalog(catalog);
  if (errors.length) throw new Error(`Invalid catalog:\n${errors.join("\n")}`);
  return catalog;
}
export function isIpLiteral(host) {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) || host.includes(":");
}
