#!/usr/bin/env bash
# Usage: scripts/release-dev.sh [--no-push] [--dry-run] [--reset-database]
# One command to ship the current master to the dev environment:
#   1. checks the tree (on master, clean, GitHub CLI signed in),
#   2. pushes master to origin (skip with --no-push),
#   3. dispatches the manual "Deploy Dorak Backend" workflow and waits for it,
#   4. waits for the Vercel check on the same commit (the dashboard builds on its own),
#   5. runs scripts/verify-deploy.sh (read-only, no credentials).
# The database is NOT reset unless you pass --reset-database and type RESET when asked: that drops
# every table and re-seeds the dev database. --dry-run prints the actions and changes nothing.
# Exit code: 0 when every step passes, 1 otherwise.
set -euo pipefail

PUSH=1
DRY=0
RESET=false
for arg in "$@"; do
  case "$arg" in
    --no-push) PUSH=0 ;;
    --dry-run) DRY=1 ;;
    --reset-database) RESET=true ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

WORKFLOW="deploy.yml"
VERCEL_WAIT_SECONDS="${VERCEL_WAIT_SECONDS:-600}"
VERIFY_ATTEMPTS="${VERIFY_ATTEMPTS:-6}"

step() { printf '\n== %s ==\n' "$1"; }
run() { if [ "$DRY" -eq 1 ]; then printf 'DRY  %s\n' "$*"; else "$@"; fi; }

root=$(git rev-parse --show-toplevel)
cd "$root"

step "Preflight"
branch=$(git rev-parse --abbrev-ref HEAD)
[ "$branch" = "master" ] || { echo "Not on master (on $branch)." >&2; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo "Working tree is not clean." >&2; git status --short >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "GitHub CLI is not signed in (run: gh auth login)." >&2; exit 1; }
repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
sha=$(git rev-parse HEAD)
echo "repo $repo, commit ${sha:0:9}, unpushed: $(git rev-list --count '@{u}..HEAD' 2>/dev/null || echo '?')"

if [ "$RESET" = "true" ]; then
  echo "DESTRUCTIVE: --reset-database drops every dev table and re-seeds it."
  if [ "$DRY" -eq 0 ]; then
    read -r -p "Type RESET to continue: " answer
    [ "$answer" = "RESET" ] || { echo "Aborted."; exit 1; }
  fi
fi

step "Push"
if [ "$PUSH" -eq 1 ]; then run git push origin master; else echo "skipped (--no-push)"; fi
if [ "$DRY" -eq 0 ] && [ "$(git rev-parse '@{u}')" != "$sha" ]; then
  echo "origin/master is not at $sha; push first or fix the tracking branch." >&2
  exit 1
fi

step "Deploy backend (workflow $WORKFLOW, reset_database=$RESET)"
started=$(date -u +%Y-%m-%dT%H:%M:%SZ)
run gh workflow run "$WORKFLOW" --ref master -f "reset_database=$RESET"
if [ "$DRY" -eq 0 ]; then
  run_id=""
  for _ in $(seq 1 30); do
    run_id=$(gh run list --workflow "$WORKFLOW" --event workflow_dispatch --limit 5 \
      --json databaseId,headSha,createdAt \
      --jq "[.[] | select(.headSha == \"$sha\" and .createdAt >= \"$started\")][0].databaseId // empty")
    [ -n "$run_id" ] && break
    sleep 2
  done
  [ -n "$run_id" ] || { echo "Could not find the dispatched run." >&2; exit 1; }
  echo "run $run_id: https://github.com/$repo/actions/runs/$run_id"
  gh run watch "$run_id" --exit-status --interval 10 >/dev/null
  echo "deploy run $run_id succeeded"
fi

step "Dashboard (Vercel builds master by itself)"
if [ "$DRY" -eq 1 ]; then
  echo "DRY  wait up to ${VERCEL_WAIT_SECONDS}s for the Vercel status on ${sha:0:9}"
else
  waited=0
  state=""
  while [ "$waited" -lt "$VERCEL_WAIT_SECONDS" ]; do
    state=$(gh api "repos/$repo/commits/$sha/status" \
      --jq '[.statuses[] | select(.context | test("vercel"; "i"))][0].state // empty' 2>/dev/null || true)
    case "$state" in success | failure | error) break ;; esac
    sleep 15
    waited=$((waited + 15))
  done
  case "$state" in
    success) echo "Vercel deployment for ${sha:0:9}: success" ;;
    '') echo "No Vercel status found for ${sha:0:9}; check the Vercel project by hand." ;;
    pending) echo "Vercel still building after ${VERCEL_WAIT_SECONDS}s; check the Vercel project." ;;
    *) echo "Vercel deployment state: $state" >&2; exit 1 ;;
  esac
fi

step "Verify"
if [ "$DRY" -eq 1 ]; then
  echo "DRY  scripts/verify-deploy.sh"
else
  ok=0
  for attempt in $(seq 1 "$VERIFY_ATTEMPTS"); do
    if scripts/verify-deploy.sh; then ok=1; break; fi
    echo "verify attempt $attempt of $VERIFY_ATTEMPTS failed; retrying in 20s"
    sleep 20
  done
  [ "$ok" -eq 1 ] || { echo "verify-deploy failed." >&2; exit 1; }
fi

echo
echo "release-dev OK"
