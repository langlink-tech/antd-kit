import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { packageFingerprint } from "./package-fingerprint.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const checkOnly = process.argv.includes("--check-only");

function publishedVersion(version) {
  try {
    const found = execFileSync("pnpm", ["view", `${pkg.name}@${version}`, "version"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    return found === version;
  } catch {
    return false;
  }
}

function publishedFingerprint(version) {
  const tarball = execFileSync("pnpm", ["view", `${pkg.name}@${version}`, "dist.tarball"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  const unpack = mkdtempSync(path.join(tmpdir(), "antd-kit-published-"));
  try {
    const tarPath = path.join(unpack, "pkg.tgz");
    const curl = ["-fsSL", tarball, "-o", tarPath];
    if (process.env.NODE_AUTH_TOKEN) {
      curl.unshift("-H", `Authorization: Bearer ${process.env.NODE_AUTH_TOKEN}`);
    }
    execFileSync("curl", curl, { stdio: "inherit" });
    execFileSync("tar", ["-xzf", path.join(unpack, "pkg.tgz"), "-C", unpack], { stdio: "inherit" });
    return packageFingerprint(path.join(unpack, "package"));
  } finally {
    rmSync(unpack, { recursive: true, force: true });
  }
}

execFileSync("pnpm", ["build"], { cwd: root, stdio: "inherit" });
const local = packageFingerprint(root);

if (publishedVersion(pkg.version)) {
  const remote = publishedFingerprint(pkg.version);
  if (remote !== local) {
    throw new Error(
      `${pkg.version} is already published with a different exports/types/provenance fingerprint (${remote} vs ${local}). Mint a new version with pnpm version:packages.`,
    );
  }
  console.log(`${pkg.version} already published with matching fingerprint`);
  process.exit(0);
}

if (checkOnly) {
  console.log(`${pkg.version} is unpublished; local fingerprint ${local}`);
  process.exit(0);
}

execFileSync("pnpm", ["publish", "--no-git-checks"], { cwd: root, stdio: "inherit" });
const found = execFileSync("pnpm", ["view", `${pkg.name}@${pkg.version}`, "version"], {
  cwd: root,
  encoding: "utf8",
}).trim();
if (found !== pkg.version) throw new Error(`published metadata mismatch: ${found}`);
writeFileSync(path.join(root, "publish-version.txt"), pkg.version);
console.log(`published ${pkg.version}`);
