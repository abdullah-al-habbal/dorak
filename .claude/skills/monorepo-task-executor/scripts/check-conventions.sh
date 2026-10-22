#!/usr/bin/env bash
# Usage: scripts/check-conventions.sh   (run from the repo root, before staging)
# Flags repository-rule violations in changed and untracked files:
# relative module imports, inline FQCNs in PHP, missing strict_types.
set -uo pipefail

root=$(git rev-parse --show-toplevel)
cd "$root"
files=$( { git diff --name-only HEAD; git ls-files --others --exclude-standard; } | sort -u)
status=0

report() { echo "VIOLATION [$1] $2"; status=1; }

while IFS= read -r f; do
  [ -f "$f" ] || continue
  case "$f" in
    *.ts|*.tsx)
      grep -nE "(from|import|vi\.mock\()\s*[\"']\.{1,2}/" "$f" >/dev/null && report relative-import "$f" ;;
    *.dart)
      grep -nE "^(import|export) '\.{1,2}/" "$f" >/dev/null && report relative-import "$f" ;;
    *.php)
      case "$f" in */Database/Migrations/*|*/vendor/*) continue ;; esac
      grep -q "declare(strict_types=1);" "$f" || report strict-types "$f"
      grep -nE "^\s*[^/*#' \"].*[^\\\\A-Za-z]\\\\Modules\\\\" "$f" | grep -vE "^\S*:\s*(use|namespace) " >/dev/null && report inline-fqcn "$f" ;;
  esac
done <<< "$files"

git diff --check || status=1
[ "$status" -eq 0 ] && echo "conventions OK"
exit "$status"
