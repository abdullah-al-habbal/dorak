#!/usr/bin/env bash
# Usage: scripts/check-screen-hygiene.sh   (any directory inside the repo)
# Flags Dorak-rule violations in changed/untracked mobile files:
#   raw Color(0x..) outside tokens, inline user-visible Text('...'), Image.asset
#   of .svg, Image.network, Navigator 1.0 calls, relative imports, files missing a
#   dot-suffix role, and ARB key parity.
set -uo pipefail

root=$(git rev-parse --show-toplevel)
cd "$root"
status=0
v() { echo "VIOLATION [$1] $2"; status=1; }

files=$( { git diff --name-only HEAD -- frontend/mobile; git ls-files --others --exclude-standard -- frontend/mobile; } | sort -u)

while IFS= read -r f; do
  [ -f "$f" ] || continue
  case "$f" in
    *.dart)
      case "$f" in *.g.dart|*/generated/*|*/test/*) continue ;; esac
      case "$f" in */lib/*/*) echo "${f##*/}" | grep -qE '^[a-z0-9_]+\.[a-z0-9]+\.dart$' || v role-suffix "$f" ;; esac
      grep -nE "^(import|export) '\.{1,2}/" "$f" >/dev/null && v relative-import "$f"
      case "$f" in *.token.dart) ;; *) grep -nE "Color\(0x[0-9A-Fa-f]{8}\)" "$f" >/dev/null && v raw-color "$f" ;; esac
      grep -nE "Text\(\s*'[A-Za-z]" "$f" >/dev/null && v hardcoded-string "$f"
      grep -nE "Image\.asset\([^)]*\.svg" "$f" >/dev/null && v svg-image-asset "$f"
      grep -nE "Image\.network|NetworkImage\(" "$f" >/dev/null && echo "WARN [network-image] $f (allowed only with a local fallback)"
      grep -nE "Navigator\.(of|push|pop)\(" "$f" >/dev/null && v navigator-1.0 "$f" ;;
  esac
done <<< "$files"

en=frontend/mobile/packages/localization/l10n/app_en.arb
ar=frontend/mobile/packages/localization/l10n/app_ar.arb
if [ -f "$en" ] && [ -f "$ar" ]; then
  python3 -I - "$en" "$ar" <<'PY' || status=1
import json, sys
keys = lambda p: {k for k in json.load(open(p, encoding="utf-8")) if not k.startswith("@")}
en, ar = keys(sys.argv[1]), keys(sys.argv[2])
if en != ar:
    for k in sorted(en - ar): print("VIOLATION [arb-parity] missing in app_ar.arb:", k)
    for k in sorted(ar - en): print("VIOLATION [arb-parity] missing in app_en.arb:", k)
    sys.exit(1)
print(f"arb parity OK ({len(en)} keys)")
PY
fi

git diff --check -- frontend/mobile || status=1
[ "$status" -eq 0 ] && echo "hygiene OK"
exit "$status"
