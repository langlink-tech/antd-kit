import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const local = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version;
const main = JSON.parse(
  execFileSync("git", ["show", "origin/main:package.json"], { cwd: root, encoding: "utf8" }),
).version;
if (local === main) {
  execFileSync("pnpm", ["exec", "changeset", "status", "--since", "origin/main"], {
    cwd: root,
    stdio: "inherit",
  });
} else {
  console.log(`version minted ${local} (origin/main is ${main}); pending changeset check skipped`);
}
