// Usage: node rewrite-docs.mjs <moves.json> — rewrites backticked/`src/` path mentions of moved files in tracked .md docs.
import fs from "node:fs";
import cp from "node:child_process";

const moves = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const files = cp.execSync("git ls-files ../../../docs ../../../.claude src/README.md AGENTS.md CLAUDE.md .interface-design README.md", { encoding: "utf8" }).split("\n").filter((f) => f.endsWith(".md"));
let n = 0;
for (const f of files) {
  const orig = fs.readFileSync(f, "utf8");
  let s = orig;
  for (const { from, to } of moves) {
    for (const suffix of ["`", ",", "}"]) s = s.split(`\`${from}.ts${suffix}`).join(`\`${to}.ts${suffix}`);
    s = s.split(`src/${from}.ts`).join(`src/${to}.ts`);
  }
  if (s !== orig) { fs.writeFileSync(f, s); n++; }
}
console.log(`docs rewritten: ${n}`);
