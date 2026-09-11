import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

execFileSync("pnpm", ["build"], { cwd: root, stdio: "inherit" });
const packed = execFileSync("pnpm", ["pack"], {
  cwd: root,
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter(Boolean)
  .at(-1);
if (!packed) {
  throw new Error("pnpm pack did not print a tarball path");
}
const tarballPath = path.isAbsolute(packed) ? packed : path.join(root, packed);
const unpackDir = mkdtempSync(path.join(tmpdir(), "antd-kit-pack-"));

try {
  execFileSync("tar", ["-xzf", tarballPath, "-C", unpackDir], { stdio: "inherit" });
  const pkg = JSON.parse(readFileSync(path.join(unpackDir, "package", "package.json"), "utf8"));
  const motion = pkg.exports?.["./motion"];
  if (!motion?.types || !motion?.import) {
    throw new Error("pack is missing ./motion types/import exports");
  }
  const typesPath = path.join(unpackDir, "package", motion.types);
  const importPath = path.join(unpackDir, "package", motion.import);
  readFileSync(typesPath);
  readFileSync(importPath);
  const resolved = require.resolve(importPath);
  if (!resolved.endsWith(".js")) {
    throw new Error(`packed motion import did not resolve to js: ${resolved}`);
  }
  console.log(`pack check ok: ${path.basename(tarballPath)}`);
} finally {
  rmSync(unpackDir, { recursive: true, force: true });
  rmSync(tarballPath, { force: true });
}
