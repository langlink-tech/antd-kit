import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import ts from "typescript";

export function checkConfirmErrors() {
  const root = process.cwd();
  const temp = mkdtempSync(path.join(tmpdir(), "antd-confirm-errors-"));
  try {
    symlinkSync(path.join(root, "node_modules"), path.join(temp, "node_modules"), "dir");
    const source = readFileSync(path.join(root, "src/overlay.tsx"), "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const entry = path.join(temp, "overlay.mjs");
    writeFileSync(entry, output);
    const args = [path.join(root, "tests/fixtures/confirm-errors.mjs"), entry];
    const options = { encoding: "utf8", timeout: 15000 };
    const stdout = execFileSync(process.execPath, args, options);
    const negative = spawnSync(process.execPath, [...args, "--unexpected"], options);
    return { stdout, error: negative.error, status: negative.status, stderr: negative.stderr };
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}
