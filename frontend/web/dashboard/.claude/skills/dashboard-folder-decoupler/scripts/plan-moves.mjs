// Usage: node plan-moves.mjs <map.json>  -> prints moves.json (array of {from,to}, paths relative to src/, no extension)
// map.json: { "dir": "lib", "match": "-keys.ts", "target": "lib/query-keys", "domains": { "bookings": ["booking-keys"], ... } }
import fs from "node:fs";
import path from "node:path";

const map = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const FROZEN = ["lib/utils", "lib/api-response", "lib/parse-guard", "lib/query-client"];
const dir = path.join("src", map.dir);
const files = fs.readdirSync(dir).filter((f) => f.endsWith(map.match));
const assigned = new Map();
for (const [domain, stems] of Object.entries(map.domains)) for (const s of stems) assigned.set(s + ".ts", domain);
const moves = [];
for (const f of files) {
  const domain = assigned.get(f);
  if (!domain) { console.error(`UNMAPPED: ${f}`); process.exit(1); }
  const stem = f.slice(0, f.length - path.extname(f).length);
  const from = `${map.dir}/${stem}`;
  if (FROZEN.includes(from)) { console.error(`FROZEN: ${from}`); process.exit(1); }
  const to = `${map.target}/${domain}/${stem}`;
  if (fs.existsSync(path.join("src", `${to}.ts`))) { console.error(`TARGET EXISTS: ${to}`); process.exit(1); }
  moves.push({ from, to });
}
for (const stem of assigned.keys()) if (!files.includes(stem)) { console.error(`MAP ENTRY WITHOUT FILE: ${stem}`); process.exit(1); }
console.log(JSON.stringify(moves, null, 2));
