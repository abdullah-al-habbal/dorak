// Usage: node plan-moves.mjs <map.json> -> prints moves.json ([{from,to}], paths relative to src/, no extension)
// Two map shapes:
//  A) explicit: { "dir", "match", "target", "domains": { domain: [stem, ...] } }
//  B) rules:    { "dirs": ["types", ...], "ui": [regex], "rules": [[regex, domain], ...], "core": [regex, ...], "default": "core",
//                 "frozen": ["lib/utils", ...], "minDomain": 1 }  (first matching rule wins; target = <dir>/<domain>/<stem>)
// Prints a per-domain count to stderr.
import fs from "node:fs";
import path from "node:path";

const map = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const FROZEN = new Set(["lib/utils", "lib/api-response", "lib/parse-guard", "lib/query-client", ...(map.frozen ?? [])]);
const moves = [];
const fail = (m) => { console.error(m); process.exit(1); };
const add = (from, to) => {
  if (FROZEN.has(from)) fail(`FROZEN: ${from}`);
  if (fs.existsSync(path.join("src", `${to}.ts`)) || fs.existsSync(path.join("src", `${to}.tsx`))) fail(`TARGET EXISTS: ${to}`);
  moves.push({ from, to });
};

if (map.domains) {
  const dir = path.join("src", map.dir);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(map.match));
  const assigned = new Map();
  for (const [domain, stems] of Object.entries(map.domains)) for (const s of stems) assigned.set(s + ".ts", domain);
  for (const f of files) {
    const domain = assigned.get(f);
    if (!domain) fail(`UNMAPPED: ${f}`);
    const stem = f.slice(0, f.length - path.extname(f).length);
    add(`${map.dir}/${stem}`, `${map.target}/${domain}/${stem}`);
  }
  for (const stem of assigned.keys()) if (!files.includes(stem)) fail(`MAP ENTRY WITHOUT FILE: ${stem}`);
} else {
  const rules = map.rules.map(([re, d]) => [new RegExp(re), d]);
  const core = (map.core ?? []).map((re) => new RegExp(re));
  const ui = (map.ui ?? []).map((re) => new RegExp(re));
  for (const d of map.dirs) {
    for (const f of fs.readdirSync(path.join("src", d), { withFileTypes: true })) {
      if (!f.isFile() || !/\.tsx?$/.test(f.name)) continue;
      const stem = f.name.replace(/\.tsx?$/, "");
      if (FROZEN.has(`${d}/${stem}`)) continue;
      const domain = ui.some((re) => re.test(stem)) ? "ui" : core.some((re) => re.test(stem)) ? "core" : (rules.find(([re]) => re.test(stem))?.[1] ?? map.default ?? fail(`UNMAPPED: ${d}/${stem}`));
      add(`${d}/${stem}`, `${d}/${domain}/${stem}`);
    }
  }
}
const counts = {};
for (const m of moves) { const k = m.to.split("/").slice(0, -1).join("/"); counts[k] = (counts[k] ?? 0) + 1; }
console.error(Object.entries(counts).sort().map(([k, v]) => `${v}\t${k}`).join("\n"));
console.log(JSON.stringify(moves, null, 2));
