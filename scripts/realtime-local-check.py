#!/usr/bin/env python3
"""Local realtime check against the seeded test database. Prints no tokens.

Signs in the committed seeder accounts (branch, stylist, brand owner), runs
scripts/realtime-probe.mjs as them, then performs the requested actions so you
can see who receives what. It only ever talks to 127.0.0.1.

    python3 scripts/realtime-local-check.py SECONDS [STEP,STEP...]

Steps: chair (change one chair's status), chair-same (save the same status),
suspend (suspend the seeded brand; reseed afterwards), admin-chair (an admin changes
a chair, which works even while the brand is suspended). See docs/waves/runbook.md.
"""
import functools
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

BASE = "http://127.0.0.1:8100/api/v1"
SOCKET = "ws://127.0.0.1:8180/app/local-key"
SEEDED_PASSWORD = "password"
STEP_PAUSE_SECONDS = 3
MAX_RETRY_WAIT_SECONDS = 70


def call(method, path, body=None, token=None, extra=None, retries=1):
    headers = {"Accept": "application/json", "Content-Type": "application/json", **(extra or {})}
    if token:
        headers["Authorization"] = "Bearer " + token
    data = None if body is None else json.dumps(body).encode()
    request = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, json.loads(response.read() or b"{}")
    except urllib.error.HTTPError as error:
        if error.code == 429 and retries > 0:
            # The sign-in routes share a per-minute limit.
            wait = int(error.headers.get("Retry-After") or MAX_RETRY_WAIT_SECONDS)
            say("rate limited, waiting", min(wait, MAX_RETRY_WAIT_SECONDS), "seconds")
            time.sleep(min(wait, MAX_RETRY_WAIT_SECONDS) + 1)
            return call(method, path, body, token, extra, retries - 1)
        return error.code, json.loads(error.read() or b"{}")


def login(path, email):
    status, body = call("POST", path, {"email": email, "password": SEEDED_PASSWORD})
    data = body.get("data") or {}
    token = data.get("token") or data.get("access_token")
    if not token:
        sys.exit(f"{path} {status} {body.get('code') or body.get('message')}")
    return token


def say(*parts):
    print(time.strftime("%H:%M:%S", time.gmtime()), "-- step:", *parts, flush=True)


def change_chair(branch, same):
    chairs = call("GET", "/branch/chairs", token=branch)[1]["data"]
    chairs = chairs if isinstance(chairs, list) else chairs["data"]
    chair = next(c for c in chairs if c["status"] == "available")
    target = "available" if same else "occupied"
    status, body = call("PATCH", f"/branch/chairs/{chair['id']}/status", {"status": target}, branch)
    say("chair-same" if same else "chair", "->", target, status, body.get("code"))


@functools.cache
def admin_session():
    status, body = call("POST", "/dashboard/login", {"actor_type": "admin", "email": "admin@dorak.sy", "password": SEEDED_PASSWORD})
    return body.get("data") or sys.exit(f"admin login {status} {body.get('code')}")


def admin_call(method, path, body=None):
    admin = admin_session()
    return call(method, path, body, admin["token"], {"X-Dashboard-Session": admin["claim"]})


def suspend_brand(brand_id):
    status, body = admin_call(
        "PATCH", f"/dashboard/admin/brands/{brand_id}/suspend",
        {"reason": "local realtime check", "cancel_future_bookings": False},
    )
    say("suspend", status, body.get("code"))


def change_chair_as_admin(branch_id):
    """The admin may still write after a suspension, so this shows who keeps receiving."""
    chairs = admin_call("GET", f"/dashboard/chairs?branch_id={branch_id}&per_page=50")[1]["data"]
    chairs = chairs if isinstance(chairs, list) else chairs["data"]
    chair = next(c for c in chairs if c["status"] in ("available", "occupied"))
    target = "occupied" if chair["status"] == "available" else "available"
    update = {key: chair[key] for key in ("label", "layout_settings")}
    # Seeded chairs have no zone, and the update route requires one.
    update["floor_zone"] = chair.get("floor_zone") or "shared"
    status, body = admin_call("PUT", f"/dashboard/chairs/{chair['id']}", {**update, "branch_id": branch_id, "status": target})
    say("admin-chair ->", target, status, body.get("code"), body.get("errors") or "")


def main():
    seconds = int(sys.argv[1])
    steps = sys.argv[2].split(",") if len(sys.argv) > 2 else []
    branch = login("/branch/login", "branch@dorak.sy")
    stylist = login("/barber/login", "barber@dorak.sy")
    owner = login("/client/login", "admin@dorak.sy")
    profile = call("GET", "/branch/profile", token=branch)[1]["data"]
    branch_id, brand_id = profile["id"], profile["brand_id"]
    stylist_id = call("GET", "/barber/profile", token=stylist)[1]["data"]["id"]
    owner_id = call("GET", "/owner/me", token=owner)[1]["data"]["client_id"]
    branch_channels = [f"private-branch.{branch_id}", f"private-floor-plan.{branch_id}"]
    spec = {
        "apiUrl": BASE, "wsUrl": SOCKET, "seconds": seconds, "origin": None,
        "actors": [
            {"name": "branch ", "token": branch, "channels": [*branch_channels, f"private-barber.{stylist_id}"]},
            {"name": "stylist", "token": stylist, "channels": [f"private-barber.{stylist_id}", *branch_channels]},
            {"name": "owner  ", "token": owner, "channels": [f"private-client.{owner_id}", f"private-branch.{branch_id}"]},
        ],
    }
    probe = Path(__file__).resolve().parent / "realtime-probe.mjs"
    node = subprocess.Popen(["node", str(probe)], stdin=subprocess.PIPE, text=True)
    node.stdin.write(json.dumps(spec))
    node.stdin.close()
    for step in steps:
        time.sleep(STEP_PAUSE_SECONDS)
        if step in ("chair", "chair-same"):
            change_chair(branch, step == "chair-same")
        elif step == "suspend":
            suspend_brand(brand_id)
        elif step == "admin-chair":
            change_chair_as_admin(branch_id)
        else:
            say("unknown step", step)
    node.wait()


if __name__ == "__main__":
    main()
