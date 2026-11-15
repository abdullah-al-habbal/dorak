#!/usr/bin/env bash
# Usage: density.sh [threshold=30]  (from frontend/web/dashboard) — dirs with more direct files than threshold
t="${1:-30}"
for d in $(find src -type d | sort); do
  n=$(find "$d" -maxdepth 1 -type f | wc -l)
  [ "$n" -gt "$t" ] && echo "$n $d"
done | sort -rn
exit 0
