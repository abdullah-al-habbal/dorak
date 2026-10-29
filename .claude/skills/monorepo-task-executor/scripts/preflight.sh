#!/usr/bin/env bash
# Usage: scripts/preflight.sh [topic]   (run from anywhere inside the repo)
# Prints the workspace state, any open decisions mentioning the topic, and the
# guides that must be read before any code is written.
set -euo pipefail

topic="${1:-}"
root=$(git rev-parse --show-toplevel)
cd "$root"

echo "== git status (preserve unrelated edits) =="
git status --short
echo
echo "== open decisions${topic:+ mentioning \"$topic\"} =="
if [ -n "$topic" ]; then
  grep -n -i -- "$topic" docs/decisions-required.md || echo "(none)"
else
  grep -n "Decision required" docs/decisions-required.md | grep -v "\[x\]" || echo "(none open)"
fi
echo
echo "== guides to read =="
for g in README.md AGENTS.md CLAUDE.md docs/INDEX.md backend/AGENTS.md backend/CLAUDE.md \
  frontend/dashboard/AGENTS.md frontend/dashboard/CLAUDE.md frontend/mobile/AGENTS.md frontend/mobile/CLAUDE.md; do
  [ -f "$g" ] && echo "$g"
done
