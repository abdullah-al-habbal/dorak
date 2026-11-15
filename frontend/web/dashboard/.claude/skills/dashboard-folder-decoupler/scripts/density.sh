#!/usr/bin/env bash
# Usage: density.sh [max=10]  (from frontend/web/dashboard)
# Hard gate: lists every src/ dir with more direct files than MAX and exits 1 if any.
# Folders with fewer files are fine. Exempt (frozen/vendored): app, components/ui, locales, services/api/auth.
max="${1:-10}"
bad=0
while IFS= read -r d; do
  case "$d" in
    src/app|src/app/*|src/components/ui|src/components/ui/*|src/locales|src/locales/*|src/services/api/auth) continue ;;
  esac
  n=$(find "$d" -maxdepth 1 -type f | wc -l)
  if [ "$n" -gt "$max" ]; then echo "$n $d (max $max)"; bad=1; fi
done < <(find src -type d | sort)
exit "$bad"
