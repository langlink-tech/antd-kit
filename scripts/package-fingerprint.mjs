import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function packageFingerprint(pkgRoot) {
  const pkg = JSON.parse(readFileSync(path.join(pkgRoot, "package.json"), "utf8"));
  const dist = path.join(pkgRoot, "dist");
  const files = readdirSync(dist).filter((name) => name.endsWith(".js") || name.endsWith(".d.ts")).sort();
  const hash = createHash("sha256");
  hash.update(
    JSON.stringify({
      name: pkg.name,
      version: pkg.version,
      exports: pkg.exports,
      files: pkg.files,
      peerDependencies: pkg.peerDependencies,
      peerDependenciesMeta: pkg.peerDependenciesMeta,
    }),
  );
  for (const name of files) {
    hash.update(name);
    hash.update(readFileSync(path.join(dist, name)));
  }
  return hash.digest("hex");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const root = process.argv[2];
  if (!root) throw new Error("usage: package-fingerprint.mjs <package-root>");
  process.stdout.write(packageFingerprint(root) + "\n");
}
