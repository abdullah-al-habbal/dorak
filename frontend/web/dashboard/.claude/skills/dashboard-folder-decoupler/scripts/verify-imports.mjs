// Usage: node verify-imports.mjs <moves.json>  — exit 1 on any violation.
import fs from "node:fs";
import path from "node:path";

const moves = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const errors = [];
const files = [];
(function walk(p) {
  if (!fs.existsSync(p)) return;
  if (fs.statSync(p).isDirectory()) {
    if (/node_modules|\.next|test-results/.test(p)) return;
    return fs.readdirSync(p).forEach((e) => walk(path.join(p, e)));
  }
  if (/\.(ts|tsx|mts)$/.test(p)) files.push(p);
})("src");
["tests"].forEach(function w(p) {
  (function walk(q) {
    if (!fs.existsSync(q)) return;
    if (fs.statSync(q).isDirectory()) return /node_modules|\.auth|test-results/.test(q) ? 0 : fs.readdirSync(q).forEach((e) => walk(path.join(q, e)));
    if (/\.(ts|tsx|mts)$/.test(q)) files.push(q);
  })(p);
});
const exists = (spec) => {
  const rel = spec.startsWith("@tests/") ? path.join("tests", spec.slice(7)) : path.join("src", spec.slice(2));
  return ["", ".ts", ".tsx", ".mts", ".css", ".json", "/index.ts", "/index.tsx"].some((e) => fs.existsSync(rel + e) && fs.statSync(rel + e).isFile());
};
const old = moves.map((m) => `@/${m.from}`);
for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  for (const m of s.matchAll(/(?:from|import|vi\.mock|vi\.importActual)\s*\(?\s*["'](@\/[^"']+|@tests\/[^"']+|\.{1,2}\/[^"']*)["']/g)) {
    const spec = m[1];
    if (spec.startsWith(".")) errors.push(`relative import in ${f}: ${spec}`);
    else if (old.includes(spec)) errors.push(`old path still used in ${f}: ${spec}`);
    else if (!exists(spec)) errors.push(`unresolved ${spec} in ${f}`);
  }
}
const dest = new Set(moves.map((m) => path.dirname(`src/${m.to}`)));
for (const d of dest) if (fs.readdirSync(d).length > 30) errors.push(`folder over 30 files: ${d}`);
for (const f of files) if (/(^|\/)index\.tsx?$/.test(f) && moves.some((m) => f.startsWith(`src/${path.dirname(m.to)}`))) errors.push(`barrel added: ${f}`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`verify-imports OK (${files.length} files scanned)`);
