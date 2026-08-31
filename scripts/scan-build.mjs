import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { scanDirectory } from "./privacy.mjs";
const root = fileURLToPath(new URL("../build/", import.meta.url));
if (!existsSync(root)) {
  console.error("build/ does not exist");
  process.exit(1);
}
const errors = scanDirectory(root);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Build privacy scan passed. Manual review is still required.");
