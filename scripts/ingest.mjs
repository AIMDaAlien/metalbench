import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { scanValue } from "./privacy.mjs";
import { validateRun } from "../src/lib/data/validator.js";
const input = process.argv[2];
if (!input) {
  console.error("Usage: npm run ingest -- path/to/raw.json");
  process.exit(1);
}
let raw;
try {
  raw = JSON.parse(readFileSync(resolve(input), "utf8"));
} catch (error) {
  console.error(`Refused: ${error.message}`);
  process.exit(1);
}
const approved = new Set(raw.approvedExcerptTaskIds || []);
const artifact = {
  format: "metalbench-agent-artifact-v1",
  exportedAt: new Date().toISOString(),
  tasks: (raw.tasks || []).map((task) => ({
    id: task.id,
    verdict: task.verdict,
    timingMs: task.timingMs,
    promptTokens: task.promptTokens,
    completionTokens: task.completionTokens,
    ...(approved.has(task.id) && task.excerpt ? { excerpt: task.excerpt } : {}),
  })),
};
const privacyErrors = scanValue(artifact);
if (privacyErrors.length) {
  console.error(`Refused:\n${privacyErrors.join("\n")}`);
  process.exit(1);
}
const run = structuredClone(raw.run || {});
const artifactName = `${run.id || basename(input, ".json")}.json`;
const artifactText = JSON.stringify(artifact, null, 2) + "\n";
const sha256 = createHash("sha256").update(artifactText).digest("hex");
run.evidence = {
  level: "artifact-backed-local",
  artifactUrl: `/artifacts/${artifactName}`,
  sha256,
  harnessCommit: raw.harnessCommit,
};
const runErrors = validateRun(run);
if (runErrors.length) {
  console.error(`Refused:\n${runErrors.join("\n")}`);
  process.exit(1);
}
const catalogPath = new URL("../src/lib/data/catalog.json", import.meta.url);
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
if (catalog.runs.some((item) => item.id === run.id)) {
  console.error(
    `Refused: run ${run.id} already exists; corrections need a new ID and supersedesRunId.`,
  );
  process.exit(1);
}
const artifactPath = resolve(
  dirname(new URL(catalogPath).pathname),
  "../../../static/artifacts",
  artifactName,
);
mkdirSync(dirname(artifactPath), { recursive: true });
writeFileSync(`${artifactPath}.tmp`, artifactText);
renameSync(`${artifactPath}.tmp`, artifactPath);
catalog.runs.push(run);
const catalogText = JSON.stringify(catalog, null, 2) + "\n";
writeFileSync(`${new URL(catalogPath).pathname}.tmp`, catalogText);
renameSync(
  `${new URL(catalogPath).pathname}.tmp`,
  new URL(catalogPath).pathname,
);
console.log(
  JSON.stringify(
    {
      status: "imported",
      runId: run.id,
      artifact: `/artifacts/${artifactName}`,
      sha256,
    },
    null,
    2,
  ),
);
