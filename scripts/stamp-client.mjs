import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
const marker = '"use client";\n';

for (const name of readdirSync(dist)) {
  if (!name.endsWith(".js")) continue;
  const file = path.join(dist, name);
  const source = readFileSync(file, "utf8");
  if (source.startsWith('"use client"') || source.startsWith("'use client'")) continue;
  writeFileSync(file, marker + source);
}
