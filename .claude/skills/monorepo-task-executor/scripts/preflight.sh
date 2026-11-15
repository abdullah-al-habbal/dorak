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
  grep -n -i -- "$topic" docs/backlog/index.md || echo "(none)"
else
  sed -n "/^## 1. Open decisions/,/^## 2\./p" docs/backlog/index.md
fi
echo
echo "== guides to read =="
for g in README.md AGENTS.md CLAUDE.md docs/index.md backend/AGENTS.md backend/CLAUDE.md \
  frontend/web/dashboard/AGENTS.md frontend/web/dashboard/CLAUDE.md frontend/mobile/AGENTS.md frontend/mobile/CLAUDE.md; do
  [ -f "$g" ] && echo "$g"
done
