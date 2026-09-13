import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { packageFingerprint } from "./package-fingerprint.mjs";

export class RegistryLookupError extends Error {
  constructor(message, code = "unknown") {
    super(message);
    this.code = code;
  }
}

export function interpretViewResult({ status, stdout = "", stderr = "", version }) {
  const text = `${stdout}\n${stderr}`;
  if (status === 0) {
    const found = stdout.trim().split("\n").filter(Boolean).at(-1);
    if (found === version) return { state: "published" };
    throw new RegistryLookupError(`registry version mismatch: ${found ?? "<empty>"}`, "mismatch");
  }
  if (/E401|\b401\b|unauthorized|authentication required/i.test(text)) {
    throw new RegistryLookupError("registry auth failed", "auth");
  }
  if (/E403|\b403\b|forbidden/i.test(text)) {
    throw new RegistryLookupError("registry forbidden", "auth");
  }
  if (
    /ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNRESET|ECONNREFUSED|socket hang up|network|\b50[0-9]\b|E500|E502|E503|E504/i.test(
      text,
    )
  ) {
    throw new RegistryLookupError("registry unavailable", "network");
  }
  if (/E404|\b404\b|No matching version|not in this registry|is not in this registry/i.test(text)) {
    return { state: "unpublished" };
  }
  throw new RegistryLookupError(`registry lookup failed: ${text.trim().slice(0, 240) || `exit ${status}`}`, "unknown");
}

export function runPublishGate({
  version,
  localFingerprint,
  checkOnly,
  view,
  fetchFingerprint,
  publish,
}) {
  const inspection = interpretViewResult({ ...view(), version });
  if (inspection.state === "published") {
    const remote = fetchFingerprint(version);
    if (remote !== localFingerprint) {
      throw new Error(
        `${version} is already published with a different exports/types/provenance fingerprint (${remote} vs ${localFingerprint}). Mint a new version with pnpm version:packages.`,
      );
    }
    return { action: "skip", reason: "matching-fingerprint" };
  }
  if (checkOnly) return { action: "unpublished" };
  publish();
  const after = interpretViewResult({ ...view(), version });
  if (after.state !== "published") {
    throw new Error("publish did not register the target version");
  }
  const published = fetchFingerprint(version);
  if (published !== localFingerprint) {
    throw new Error(`published content fingerprint mismatch (${published} vs ${localFingerprint})`);
  }
  return { action: "published" };
}

function viewWithPnpm(root, name, version) {
  try {
    const stdout = execFileSync("pnpm", ["view", `${name}@${version}`, "version"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: 0, stdout, stderr: "" };
  } catch (error) {
    return {
      status: error.status ?? 1,
      stdout: error.stdout?.toString?.() ?? "",
      stderr: error.stderr?.toString?.() ?? error.message,
    };
  }
}

function fetchPublishedFingerprint(root, name, version) {
  const tarball = execFileSync("pnpm", ["view", `${name}@${version}`, "dist.tarball"], {
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
    execFileSync("tar", ["-xzf", tarPath, "-C", unpack], { stdio: "inherit" });
    return packageFingerprint(path.join(unpack, "package"));
  } finally {
    rmSync(unpack, { recursive: true, force: true });
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  const checkOnly = process.argv.includes("--check-only");
  execFileSync("pnpm", ["build"], { cwd: root, stdio: "inherit" });
  const localFingerprint = packageFingerprint(root);
  const result = runPublishGate({
    version: pkg.version,
    localFingerprint,
    checkOnly,
    view: () => viewWithPnpm(root, pkg.name, pkg.version),
    fetchFingerprint: (version) => fetchPublishedFingerprint(root, pkg.name, version),
    publish: () => execFileSync("pnpm", ["publish", "--no-git-checks"], { cwd: root, stdio: "inherit" }),
  });
  if (result.action === "published") {
    writeFileSync(path.join(root, "publish-version.txt"), pkg.version);
    console.log(`published ${pkg.version}`);
  } else if (result.action === "skip") {
    console.log(`${pkg.version} already published with matching fingerprint`);
  } else {
    console.log(`${pkg.version} is unpublished; local fingerprint ${localFingerprint}`);
  }
}
