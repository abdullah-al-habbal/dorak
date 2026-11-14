#!/usr/bin/env bash
# Generic codebase cleanup for the Dorak monorepo. Dry run by default; pass --apply to delete.
#
# It removes only files Git IGNORES (logs, caches, build output, test artifacts, IDE files, generated files).
# It never touches tracked files or untracked-but-not-ignored files (your work in progress), and it keeps the
# protected paths below (dependencies, environment files, secrets, hook wiring, uploads). It discovers what to
# remove with `git ls-files --others --ignored` instead of a hard-coded list, so new generated output is picked up automatically.
# It never runs Playwright, never touches a database and never stages, commits or pushes.
set -euo pipefail

APPLY=0
case "${1:-}" in
  "") ;;
  --apply) APPLY=1 ;;
  *) echo "Unknown argument: $1 (the only option is --apply; without it nothing is deleted)" >&2; exit 2 ;;
esac
[ "$#" -le 1 ] || { echo "Too many arguments" >&2; exit 2; }

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

# Ignored paths that are NOT leftovers. Extend only with the owner's approval (see SKILL.md).
PROTECTED='(^|/)(node_modules|vendor)(/|$)|(^|/)\.env([./][^/]*)?(/|$)|(^|/)\.husky/_(/|$)|(^|/)\.aiignore$|(^|/)public/storage$|(^|/)storage/app/(public|private)(/|$)|\.(jks|keystore|pem|p12|p8)$|(^|/)(key\.properties|google-services\.json|GoogleService-Info\.plist)$'

echo "Mode: $([ "$APPLY" = 1 ] && echo APPLY || echo 'dry run (add --apply to delete)')"

if pgrep -f "next dev|next-server" >/dev/null 2>&1; then
  echo "Note: a Next.js dev server is running; it rebuilds .next on its next request."
fi

is_protected() { printf '%s\n' "$1" | grep -Eq "$PROTECTED"; }

# List ignored files one by one. Git collapses a fully ignored directory into one entry ("frontend/"), which would
# hide protected files inside it from the filter, so every collapsed directory is expanded to its files first;
# only a protected directory itself (node_modules, vendor) is skipped without being walked.
TARGETS=()
while IFS= read -r entry; do
  [ -n "$entry" ] || continue
  if [ "${entry: -1}" = "/" ]; then
    dir="${entry%/}"
    is_protected "$dir" && continue
    while IFS= read -r file; do
      [ -n "$file" ] && ! is_protected "$file" && TARGETS+=("$file")
    done < <(git ls-files --others --ignored --exclude-standard -- "$dir")
  elif ! is_protected "$entry"; then
    TARGETS+=("$entry")
  fi
done < <(git ls-files --others --ignored --exclude-standard --directory)

if [ "${#TARGETS[@]}" -gt 0 ]; then
  mapfile -t TARGETS < <(printf '%s\n' "${TARGETS[@]}" | sort -u)
fi

echo "Ignored leftovers to remove: ${#TARGETS[@]}"
printf '  %s\n' "${TARGETS[@]}"

touches() { printf '%s\n' "${TARGETS[@]}" | grep -q "^$1"; }

if [ "$APPLY" = 1 ]; then
  # Project clean commands only where that part of the repo has something to clean.
  if touches frontend/web/dashboard && [ -f frontend/web/dashboard/package.json ]; then
    (cd frontend/web/dashboard && npm run --silent clean:artifacts) || true
  fi
  if touches frontend/mobile && command -v dart >/dev/null 2>&1; then
    (cd frontend/mobile && dart run melos run clean) || true
  fi

  for path in "${TARGETS[@]}"; do
    case "$path" in /*|*..*|"") echo "Refusing odd path: $path" >&2; exit 1 ;; esac
    rm -f -- "$path"
    rmdir -p --ignore-fail-on-non-empty -- "$(dirname -- "$path")" 2>/dev/null || true
  done

  # Regenerate only what the typecheck needs and the sweep removed: the dashboard route types.
  if [ ! -f frontend/web/dashboard/next-env.d.ts ] && [ -f frontend/web/dashboard/package.json ]; then
    (cd frontend/web/dashboard && npx --no-install next typegen >/dev/null 2>&1) || echo "Run 'npx next typegen' in frontend/web/dashboard before typechecking."
  fi
fi

echo "Kept (protected): dependencies, environment files, secrets and keystores, .husky/_, public/storage symlink, storage/app uploads."
echo "Untracked work in progress (not ignored) is never touched:"
git status --short | grep '^??' || echo "  (none)"
if [ "$APPLY" = 1 ] && touches frontend/mobile; then echo "Next: 'flutter pub get' in frontend/mobile before analyzing or building the apps."; fi
exit 0
