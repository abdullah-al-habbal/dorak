#!/usr/bin/env bash
# Usage: scripts/preflight.sh <task-number>   (run from anywhere inside the repo)
# Prints the workspace state, the task spec path, its tracker line, its open
# decisions, and the guides that must be read before any code is written.
set -euo pipefail

n="${1:?usage: preflight.sh <task-number>}"
n=$(printf '%02d' "$((10#$n))")
root=$(git rev-parse --show-toplevel)
cd "$root"

echo "== git status (preserve unrelated edits) =="
git status --short
echo
echo "== spec =="
spec=$(ls docs/tasks/task-"$n"-*.md 2>/dev/null || true)
[ -n "$spec" ] || { echo "No spec matches docs/tasks/task-$n-*.md" >&2; exit 1; }
echo "$spec"
echo
echo "== tracker line =="
grep -n "Task ${n#0}:" docs/todowork.md || grep -n "Task $n:" docs/todowork.md || echo "(no tracker line found)"
echo
echo "== open decisions for this task =="
awk -v t="Task ${n#0}:" 'index($0,"## [" t){f=1;print;next} /^## \[/{f=0} f' docs/decisions-required.md
echo
echo "== guides to read =="
for g in README.md AGENTS.md CLAUDE.md docs/INDEX.md backend/AGENTS.md backend/CLAUDE.md \
  frontend/dashboard/AGENTS.md frontend/dashboard/CLAUDE.md frontend/mobile/AGENTS.md frontend/mobile/CLAUDE.md; do
  [ -f "$g" ] && echo "$g"
done
