import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
export function verifyArtifactHashes(catalog, staticRoot) {
  const errors = [];
  for (const run of catalog.runs) {
    if (run.evidence.level !== "artifact-backed-local") continue;
    const file = resolve(
      staticRoot,
      run.evidence.artifactUrl.replace(/^\//, ""),
    );
    if (!existsSync(file)) {
      errors.push(`${run.id}: artifact missing`);
      continue;
    }
    const actual = createHash("sha256")
      .update(readFileSync(file))
      .digest("hex");
    if (actual !== run.evidence.sha256)
      errors.push(`${run.id}: artifact hash mismatch`);
  }
  return errors;
}
