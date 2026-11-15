// Usage: node apply-moves.mjs <moves.json>  — git mv sources + mirrored tests, rewrite quoted "@/<from>" specifiers.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const moves = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const EXT = [".ts", ".tsx"];
const ROOTS = ["src", "tests", "vitest.config.mts", "playwright.config.ts", "../../../docs", "../../../.claude", "README.md", "AGENTS.md", "CLAUDE.md", ".interface-design"];
const TEXT = /\.(ts|tsx|mts|md|json|sh|mjs)$/;

function gitMv(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  execFileSync("git", ["mv", from, to], { stdio: "inherit" });
}
for (const { from, to } of moves) {
  const ext = EXT.find((e) => fs.existsSync(`src/${from}${e}`));
  if (!ext) throw new Error(`missing source: src/${from}`);
  gitMv(`src/${from}${ext}`, `src/${to}${ext}`);
  const base = path.basename(from);
  const testFrom = `tests/${path.dirname(from).split("/").slice(0).join("/")}/${base}.test.ts`;
  if (fs.existsSync(testFrom)) gitMv(testFrom, `tests/${to}.test.ts`);
}
const pairs = moves.map(({ from, to }) => [new RegExp(`(["'\`])@/${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\1`, "g"), `$1@/${to}$1`]);
const mdPairs = moves.map(({ from, to }) => [new RegExp(`src/${from}\\.ts`, "g"), `src/${to}.ts`]);
let changed = 0;
function walk(p) {
  if (!fs.existsSync(p)) return;
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    if (/node_modules|\.next|\.auth|test-results/.test(p)) return;
    for (const e of fs.readdirSync(p)) walk(path.join(p, e));
    return;
  }
  if (!TEXT.test(p)) return;
  let s = fs.readFileSync(p, "utf8");
  const orig = s;
  for (const [re, rep] of pairs) s = s.replace(re, rep);
  if (/\.md$/.test(p)) for (const [re, rep] of mdPairs) s = s.replace(re, rep);
  if (s !== orig) { fs.writeFileSync(p, s); changed++; }
}
ROOTS.forEach(walk);
console.log(`rewrote ${changed} files`);
const globs = [];
(function scan(p) {
  if (!fs.existsSync(p)) return;
  if (fs.statSync(p).isDirectory()) return fs.readdirSync(p).forEach((e) => scan(path.join(p, e)));
  if (/\.(ts|tsx|mts)$/.test(p) && /import\.meta\.glob/.test(fs.readFileSync(p, "utf8"))) globs.push(p);
})("tests");
if (globs.length) console.log("CHECK import.meta.glob by hand:\n" + globs.join("\n"));
