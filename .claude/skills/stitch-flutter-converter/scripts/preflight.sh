#!/usr/bin/env bash
# Usage: scripts/preflight.sh [export-id]   e.g. 016 or 016_discovery_feed
# Without an argument: lists remaining exports. With one: inventories it and
# prints the context that must be read before any code is written.
set -euo pipefail

root=$(git rev-parse --show-toplevel)
mobile="$root/frontend/mobile"
exports="$mobile/docs/stitch/exports"
cd "$mobile"

echo "== git status (preserve unrelated edits) =="
git status --short
echo
echo "== remaining exports =="
ls -1 "$exports" 2>/dev/null | grep -v '\.jpg$' || echo "(none)"
[ $# -ge 1 ] || exit 0

id="$1"
dir=$(ls -d "$exports/${id}"* 2>/dev/null | head -1 || true)
[ -n "$dir" ] || { echo "No export matching '$id' under docs/stitch/exports" >&2; exit 1; }
echo
echo "== export: $dir =="
for f in DESIGN.md code.html screen.png plan.md; do
  [ -e "$dir/$f" ] && echo "  has $f" || echo "  MISSING $f"
done
ls "$exports"/*"${id}"*.zip 2>/dev/null && echo "  (zip present: unzip first, delete after)" || true
echo
if [ -f "$dir/plan.md" ]; then
  echo "== plan.md outline =="
  grep -n '^## ' "$dir/plan.md" | head -80
  echo
  grep -n -i "current repository state" "$dir/plan.md" || true
fi
echo
echo "== DESIGN.md identical to other exports? (global tokens, never regenerate) =="
for other in "$exports"/*/DESIGN.md; do
  [ "$other" = "$dir/DESIGN.md" ] && continue
  [ -f "$dir/DESIGN.md" ] && { cmp -s "$dir/DESIGN.md" "$other" && echo "  same as ${other#$exports/}" || echo "  DIFFERS from ${other#$exports/}"; }
done
echo
echo "== current execution point =="
grep -n "Current Track" docs/index.md | head -3
echo
echo "== guides to read =="
for g in CLAUDE.md AGENTS.md docs/index.md docs/navigation/routes.md docs/state_management/conventions.md \
  docs/architecture/coding_conventions.md packages/design_system/AGENTS.md packages/localization/AGENTS.md; do
  [ -f "$g" ] && echo "frontend/mobile/$g"
done
echo "plus the target app's CLAUDE.md/AGENTS.md and the existing screens in the same feature folder"
