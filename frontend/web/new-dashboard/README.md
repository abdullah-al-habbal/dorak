# Dorak Dashboard (new)

Next.js 16 (App Router, Cache Components), React 19, Tailwind 4 and shadcn/ui on Base UI.
One workspace per role at `/dashboard/<guard>`: `admin`, `manager`, `barber`, `owner`.

## Run it

```bash
cp .env.example .env.local   # set DASHBOARD_SESSION_SECRET to the backend's value
npm install
npm run dev                  # http://localhost:3000/dashboard
```

The Laravel API must be reachable at `BACKEND_API_URL`. Only the Next server calls it.

## Checks

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## How it fits together

- **Session:** `src/app/api/auth/*` route handlers wrap the backend dashboard auth endpoints and
  store tokens in HttpOnly cookies. `src/proxy.ts` guards `/dashboard/**`; the portal layout
  re-checks `/me`. See [ADR 0003](../../../docs/adr/0003-new-dashboard-foundation.md).
- **Theme:** `src/store/theme.store.ts` (light, dark, system), saved in a cookie and applied
  before paint by an inline script.
- **Localization:** `src/locales/` holds typed EN and AR dictionaries; Arabic switches the page to RTL.
- **Design:** tokens live in `src/app/globals.css`; the decisions are in `.interface-design/system.md`.
- **Layout rules:** [src/README.md](src/README.md).
