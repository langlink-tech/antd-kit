import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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
  for (const [name, entry] of Object.entries(pkg.exports)) {
    if (!entry.types || !entry.import) throw new Error(`missing types/import for ${name}`);
    readFileSync(path.join(unpackDir, "package", entry.types));
    readFileSync(path.join(unpackDir, "package", entry.import));
  }
  // Resolve and load the actual packed files, with the host's dependencies.
  mkdirSync(path.join(unpackDir, "node_modules"));
  for (const name of ["react", "react-dom", "antd"]) {
    symlinkSync(path.join(root, "node_modules", name), path.join(unpackDir, "node_modules", name), "dir");
  }
  for (const name of ["motion", "table", "form", "dashboard", "navigation"]) {
    execFileSync(process.execPath, ["--input-type=module", "-e",
      `await import(${JSON.stringify(path.join(unpackDir, "package", "dist"))} + "/${name}.js")`], { stdio: "inherit" });
  }
  for (const name of ["motion", "table", "form", "dashboard", "navigation"]) {
    const source = readFileSync(path.join(unpackDir, "package", "dist", `${name}.js`), "utf8");
    if (/@ant-design\/pro-components|@antv\/s2/.test(source)) throw new Error(`optional dependency leaked into ${name}`);
  }
  // Pro/S2 are deliberately installed only for their own entry-point probes.
  for (const [scope, name] of [["@ant-design", "pro-components"], ["@antv", "s2"]]) {
    mkdirSync(path.join(unpackDir, "node_modules", scope), { recursive: true });
    symlinkSync(path.join(root, "node_modules", scope, name), path.join(unpackDir, "node_modules", scope, name), "dir");
  }
  for (const name of ["pro-table", "s2"]) {
    execFileSync(process.execPath, ["--input-type=module", "-e",
      `await import(${JSON.stringify(path.join(unpackDir, "package", "dist"))} + "/${name}.js")`], { stdio: "inherit" });
  }
  console.log(`pack check ok: ${path.basename(tarballPath)}`);
} finally {
  rmSync(unpackDir, { recursive: true, force: true });
  rmSync(tarballPath, { force: true });
}
