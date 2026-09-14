import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { packageManager } = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
execFileSync("pnpm", ["build"], { cwd: root, stdio: "inherit" });
const packed = execFileSync("pnpm", ["pack"], { cwd: root, encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean)
  .at(-1);
if (!packed) throw new Error("pnpm pack did not print a tarball path");
const tarballPath = path.isAbsolute(packed) ? packed : path.join(root, packed);
const host = mkdtempSync(path.join(tmpdir(), "antd-kit-rsc-"));

try {
  writeFileSync(
    path.join(host, "package.json"),
    JSON.stringify(
      {
        name: "antd-kit-rsc-host",
        private: true,
        type: "module",
        packageManager,
        dependencies: {
          "@langlink-tech/antd-kit": `file:${tarballPath}`,
          antd: "6.6.2",
          next: "15.5.9",
          react: "19.2.7",
          "react-dom": "19.2.7",
        },

      },
      null,
      2,
    ),
  );
  writeFileSync(
    path.join(host, "pnpm-workspace.yaml"),
    "minimumReleaseAge: 10080\nminimumReleaseAgeExclude:\n  - next\n  - '@langlink-tech/antd-kit'\ndangerouslyAllowAllBuilds: true\n",
  );
  writeFileSync(path.join(host, ".npmrc"), "ignore-scripts=false\n");
  writeFileSync(
    path.join(host, "next.config.mjs"),
    "const nextConfig = { typescript: { ignoreBuildErrors: false } };\nexport default nextConfig;\n",
  );
  mkdirSync(path.join(host, "app"));
  writeFileSync(
    path.join(host, "app/layout.jsx"),
    "export default function RootLayout({ children }) {\n  return <html lang=\"en\"><body>{children}</body></html>;\n}\n",
  );
  writeFileSync(
    path.join(host, "app/page.jsx"),
    'import { EmptyState } from "@langlink-tech/antd-kit/feedback";\nexport default function Page() {\n  return <EmptyState description="No rows" />;\n}\n',
  );
  execFileSync("pnpm", ["install"], { cwd: host, stdio: "inherit" });
  execFileSync("pnpm", ["exec", "next", "build"], { cwd: host, stdio: "inherit" });
  const page = readFileSync(path.join(host, "app/page.jsx"), "utf8");
  if (page.includes("use client")) throw new Error("representative page must remain a Server Component");
  console.log("rsc check ok");
} finally {
  rmSync(host, { recursive: true, force: true });
  rmSync(tarballPath, { force: true });
}
