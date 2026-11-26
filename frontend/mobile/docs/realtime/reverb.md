---
nodeid: mobile.realtime.reverb
parentnode: mobile.docs
childnodes:
  - mobile.realtime.reverb.part-2
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# Mobile Reverb contract

Status: `DONE` for the mobile client integration. A live environment walkthrough
remains an operational verification step.

`packages/core` exposes `RealtimeClient`, backed by `laravel_reverb`. It speaks
the Pusher protocol used by Laravel Reverb, reconnects after backgrounding, and
re-authorizes every private channel after a reconnect.

## Environment

Each app's ignored `.env` must define these values. The committed
`.env.example` files show the required shape.

| Key | Meaning |
| --- | --- |
| `REVERB_APP_KEY` | Public Reverb application key |
| `REVERB_HOST` | Public WebSocket hostname, without a protocol |
| `REVERB_PORT` | `443` for production/staging WSS |
| `REVERB_SCHEME` | `https` or `wss` for TLS; `http` only for an intentional local setup |
| `REVERB_SERVER_PATH` | Optional reverse-proxy WebSocket path, otherwise empty |

The API base URL remains the source of the private-channel auth endpoint:
`$API_BASE_URL_V1/broadcasting/auth`. Mobile apps do not call the dashboard's
cookie-only `/api/realtime/auth` BFF route.

## Authentication and authorization

Create the client with the same secure token storage used by the app's
`ApiClient`. On every private-channel authorization, core sends:

```http
Authorization: Bearer <Sanctum token>
Accept: application/json
```

Laravel applies its existing `admin_api`, `branch_api`, `barber` and `client`
channel policies at `POST /api/v1/broadcasting/auth`; the client never chooses access
rights. A missing token fails authorization rather than subscribing.

```dart
final realtime = RealtimeClient(
  configuration: ConfigProvider.realtimeConfiguration,
  tokenProvider: SecureBranchTokenStorage().read,
  onError: (error, stackTrace) {
    // Send to the app's approved error reporting pipeline.
  },
);

await realtime.connect();
```

## Continued in

- [Part 2: Channels and events](reverb-part-2.md)
