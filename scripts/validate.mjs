import { readFileSync } from "node:fs";
import { validateCatalog } from "../src/lib/data/validator.js";
import { scanValue } from "./privacy.mjs";
import { verifyArtifactHashes } from "./artifacts.mjs";
const catalog = JSON.parse(
  readFileSync(
    new URL("../src/lib/data/catalog.json", import.meta.url),
    "utf8",
  ),
);
const errors = [
  ...validateCatalog(catalog),
  ...scanValue(catalog),
  ...verifyArtifactHashes(
    catalog,
    new URL("../static/", import.meta.url).pathname,
  ),
];
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `Validated ${catalog.runs.length} runs, ${catalog.models.length} models, ${catalog.hardware.length} hardware profiles, and ${catalog.findings.length} findings.`,
);
