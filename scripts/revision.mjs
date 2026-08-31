import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
let revision = "uncommitted";
try {
  const dirty = execFileSync("git", ["status", "--porcelain"], {
    encoding: "utf8",
  }).trim();
  if (!dirty)
    revision = execFileSync("git", ["rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim();
} catch {}
writeFileSync(
  new URL("../build/revision.txt", import.meta.url),
  `${revision}\n`,
);
console.log(`Build revision: ${revision}`);
