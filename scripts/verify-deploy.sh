#!/usr/bin/env bash
# Usage: scripts/verify-deploy.sh
# Read-only smoke test of the deployed backend (Hostinger) and dashboard (Vercel).
# Sends no credentials and no secrets; the login probe uses a fake account and must be rejected.
# Override the targets with BACKEND_URL and DASHBOARD_URL (origins only, no trailing slash).
# Probes: backend health, dashboard login, CORS preflight, dashboard session, Arabic validation message.
# Exit code: 0 when every check passes, 1 when any check fails or a host is unreachable.
set -uo pipefail

BACKEND_URL="${BACKEND_URL:-https://dev-dorak-backend.io}"
DASHBOARD_URL="${DASHBOARD_URL:-https://dorak-bay.vercel.app}"
PREFLIGHT_ORIGIN="${PREFLIGHT_ORIGIN:-https://example.test}"
TIMEOUT=20
failures=0

pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1"; failures=$((failures + 1)); }

# status_of METHOD URL [curl args...] -> prints the HTTP status code, or 000 when unreachable.
status_of() {
  local method="$1" url="$2"
  shift 2
  curl -sS -m "$TIMEOUT" -o /dev/null -w '%{http_code}' -X "$method" "$@" "$url" 2>/dev/null || printf '000'
}

# expect LABEL ACTUAL EXPECTED: fails on 000 (unreachable), on 5xx, and on any other mismatch.
expect() {
  local label="$1" actual="$2" expected="$3"
  if [ "$actual" = "$expected" ]; then
    pass "$label -> $actual"
  elif [ "$actual" = "000" ]; then
    fail "$label -> unreachable (expected $expected)"
  elif [ "${actual#5}" != "$actual" ]; then
    fail "$label -> server error $actual (expected $expected)"
  else
    fail "$label -> $actual (expected $expected)"
  fi
}

# 1. Backend health
body=$(curl -sS -m "$TIMEOUT" -w '\n%{http_code}' "$BACKEND_URL/api/v1/health" 2>/dev/null) || body=$'\n000'
code=${body##*$'\n'}
expect "GET  $BACKEND_URL/api/v1/health" "$code" 200
if [ "$code" = "200" ]; then
  case "$body" in
    *'"status":"ok"'*) pass "health payload reports status ok" ;;
    *) fail "health payload does not contain status ok" ;;
  esac
  case "$body" in
    *'"trace"'* | *'/home/'*) fail "health payload leaks debug details" ;;
    *) pass "health payload exposes no debug details" ;;
  esac
fi

# 2. Dashboard login with invalid credentials: must reach Laravel and be rejected, never a 5xx.
code=$(status_of POST "$DASHBOARD_URL/api/auth/login" \
  -H 'content-type: application/json' \
  -d '{"actor":"admin","email":"nobody@example.com","password":"invalid"}')
expect "POST $DASHBOARD_URL/api/auth/login (invalid credentials)" "$code" 401

# 3. Backend CORS preflight (informational for browser clients such as Flutter Web).
headers=$(curl -sS -m "$TIMEOUT" -D - -o /dev/null -X OPTIONS "$BACKEND_URL/api/v1/auth/login" \
  -H "Origin: $PREFLIGHT_ORIGIN" \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: authorization,content-type' 2>/dev/null) || headers=''
pcode=$(printf '%s' "$headers" | head -n1 | awk '{print $2}')
case "$pcode" in
  200 | 204) pass "OPTIONS $BACKEND_URL/api/v1/auth/login -> $pcode" ;;
  '') fail "OPTIONS $BACKEND_URL/api/v1/auth/login -> unreachable" ;;
  5*) fail "OPTIONS $BACKEND_URL/api/v1/auth/login -> server error $pcode" ;;
  *) fail "OPTIONS $BACKEND_URL/api/v1/auth/login -> $pcode (expected 200 or 204)" ;;
esac
if printf '%s' "$headers" | grep -qi '^access-control-allow-origin:'; then
  pass "preflight returns Access-Control-Allow-Origin"
else
  fail "preflight returns no Access-Control-Allow-Origin"
fi

# 4. Dashboard session without a cookie: must be rejected.
code=$(status_of GET "$DASHBOARD_URL/api/auth/me")
expect "GET  $DASHBOARD_URL/api/auth/me (no session)" "$code" 401

# 5. Arabic validation: an empty sign-in with Accept-Language: ar must be a 422 whose messages are Arabic.
#    The empty body sends no credentials. An English message here means the language middleware or lang files are missing.
ar_body=$(curl -sS -m "$TIMEOUT" -w '\n%{http_code}' -X POST "$BACKEND_URL/api/v1/dashboard/login" \
  -H 'content-type: application/json' -H 'accept: application/json' -H 'Accept-Language: ar' -d '{}' 2>/dev/null) || ar_body=$'\n000'
ar_code=${ar_body##*$'\n'}
expect "POST $BACKEND_URL/api/v1/dashboard/login (empty body, Accept-Language: ar)" "$ar_code" 422
if [ "$ar_code" = "422" ]; then
  case "$ar_body" in
    *'\u0645\u0637\u0644\u0648\u0628'*) pass "validation message is Arabic" ;;
    *) fail "validation message is not Arabic (expected the word \u0645\u0637\u0644\u0648\u0628 in an escaped JSON message)" ;;
  esac
fi

if [ "$failures" -eq 0 ]; then
  echo "verify-deploy OK"
  exit 0
fi
echo "verify-deploy: $failures check(s) failed"
exit 1
