import { createHash } from "node:crypto";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { verifyArtifactHashes } from "./artifacts.mjs";
describe("artifact hashes", () => {
  it("detects a hash mismatch", () => {
    const root = mkdtempSync(join(tmpdir(), "metalbench-"));
    writeFileSync(join(root, "run.json"), "actual");
    const catalog = {
      runs: [
        {
          id: "run",
          evidence: {
            level: "artifact-backed-local",
            artifactUrl: "/run.json",
            sha256: createHash("sha256").update("other").digest("hex"),
          },
        },
      ],
    };
    expect(verifyArtifactHashes(catalog, root)).toEqual([
      "run: artifact hash mismatch",
    ]);
  });
});
