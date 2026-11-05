// A tiny stand-in for the Laravel dashboard API so E2E runs need neither MySQL nor seeded data.
// Plain Node on purpose: Playwright starts it as a web server before the Next.js app.
import { createHmac } from "node:crypto";
import { createServer } from "node:http";

const PORT = Number(process.env.E2E_BACKEND_PORT ?? 4010);
const SECRET = process.env.DASHBOARD_SESSION_SECRET ?? "";
const EMAIL = "manager@example.test";
const PASSWORD = "correct-horse-battery";
const PREFIX = "/api/v1/dashboard";
const ACTORS = { admin: "platform_admin", branch: "branch_manager", barber: "barber", owner: "brand_owner" };

const b64 = (value) => Buffer.from(typeof value === "string" ? value : JSON.stringify(value)).toString("base64url");

function claimFor(actorType) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64({ alg: "HS256", typ: "JWT", kid: "default" });
  const payload = b64({ actor_type: actorType, role: ACTORS[actorType], sub: "u1", branch_id: "br1", brand_id: "brand1", brand_ids: ["brand1"], iat: now, exp: now + 3600, iss: "dorak-backend", jti: `jti-${now}` });
  return `${header}.${payload}.${createHmac("sha256", SECRET).update(`${header}.${payload}`).digest("base64url")}`;
}

const today = new Date();
const at = (hours, minutes = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes).toISOString();
const CHAIRS = [{ id: "c1", label: "Chair 1", branch_id: "br1" }, { id: "c2", label: "Chair 2", branch_id: "br1" }];
const CATEGORIES = [{ id: "cat1", name: { en: "Hair", ar: "الشعر" } }, { id: "cat2", name: { en: "Beard", ar: "اللحية" } }];
const STYLISTS = [
  { id: "s1", name: "Omar Haddad", name_translations: { en: "Omar Haddad", ar: "عمر حداد" }, email: "omar@example.test", phone: null, status: "enabled", rating_average: 4.8, rating_count: 12, chair: CHAIRS[0] },
  { id: "s2", name: "Lina Saad", name_translations: { en: "Lina Saad", ar: "لينا سعد" }, email: "lina@example.test", phone: null, status: "disabled", rating_average: null, rating_count: 0, chair: CHAIRS[1] },
];
const SERVICES = [
  { id: "v1", name: "Classic haircut", name_translations: { en: "Classic haircut", ar: "قص كلاسيكي" }, serviceable_id: "brand1", serviceable_type: "brand", catalog_item_id: null, price_amount_minor: 2500, currency_code: "USD", duration_minutes: 30, is_at_home: false, is_active: true, category: CATEGORIES[0] },
  { id: "v2", name: "Beard trim", name_translations: { en: "Beard trim", ar: "تشذيب اللحية" }, serviceable_id: "brand1", serviceable_type: "brand", catalog_item_id: null, price_amount_minor: 1500, currency_code: "USD", duration_minutes: 20, is_at_home: true, is_active: true, category: CATEGORIES[1] },
];
const BOOKINGS = [
  { id: "b1", starts_at: at(10), ends_at: at(10, 30), booking_status: "confirmed", payment_status: "unpaid", chair: CHAIRS[0], barber: { id: "s1", name: "Omar Haddad" }, services: [{ id: "v1", name: "Classic haircut", price_amount_minor: 2500, currency_code: "USD", duration_minutes: 30 }], client: { id: "k1", name: "Sami Khoury", phone: "0100000000" } },
  { id: "b2", starts_at: at(14), ends_at: at(14, 20), booking_status: "pending", payment_status: "unpaid", chair: CHAIRS[1], barber: { id: "s2", name: "Lina Saad" }, services: [{ id: "v2", name: "Beard trim", price_amount_minor: 1500, currency_code: "USD", duration_minutes: 20 }], client: { id: "k2", name: "Nadia Farah", phone: "0100000001" } },
];

// Mirrors the real endpoint: a PUT replaces the listed days; a day is closed or carries shifts.
let openingHours = [];
function saveOpeningHours(hours) {
  const byDay = new Map(openingHours.map((entry) => [entry.day_of_week, entry]));
  for (const day of hours ?? []) {
    const shifts = day.is_closed ? [] : day.shifts ?? [{ opens_time: day.opens_time, closes_time: day.closes_time }];
    byDay.set(day.day_of_week, { day_of_week: day.day_of_week, is_closed: shifts.length === 0, opens_time: shifts[0]?.opens_time ?? null, closes_time: shifts.at(-1)?.closes_time ?? null, shifts });
  }
  openingHours = [...byDay.values()].sort((a, b) => a.day_of_week - b.day_of_week);
}

const envelope = (statusCode, data, extra = {}) => ({ success: statusCode < 400, statusCode, code: statusCode < 400 ? "OK" : "ERROR", message: "", timestamp: new Date().toISOString(), data, ...extra });
const paged = (items) => envelope(200, items, { meta: { pagination: { total: items.length, per_page: 100, current_page: 1, total_pages: 1 } } });

function route(method, path, body, search) {
  if (method === "POST" && path === "/__reset") {
    openingHours = [];
    return [200, envelope(200, null)];
  }
  if (method === "POST" && path === "/login") {
    if (body?.email !== EMAIL || body?.password !== PASSWORD) return [401, envelope(401, null, { errors: {} })];
    return [200, envelope(200, { claim: claimFor(body.actor_type), token: "access-token", refresh_token: "refresh-token", expires_in: 3600, refresh_expires_in: 86400 })];
  }
  if (method === "POST" && (path === "/logout" || path === "/refresh")) return [200, envelope(200, path === "/logout" ? null : { claim: claimFor("branch"), token: "access-token", refresh_token: "refresh-token", expires_in: 3600, refresh_expires_in: 86400 })];
  if (method === "GET" && path === "/me") return [200, envelope(200, { id: "u1", actor_type: "branch", role: "branch_manager", branch_id: "br1", brand_id: "brand1", brand_ids: ["brand1"], display_name: "Dana Manager", email: EMAIL, permissions: [] })];
  if (path === "/branches/br1/opening-hours") {
    if (method === "PUT") saveOpeningHours(body?.hours);
    return [200, envelope(200, { opening_hours: openingHours })];
  }
  if (method === "GET" && path === "/bookings") return [200, paged(BOOKINGS)];
  if (method === "GET" && path === "/chairs") return [200, envelope(200, CHAIRS)];
  if (method === "GET" && path === "/currencies") return [200, envelope(200, [{ code: "USD", name: { en: "US dollar", ar: "دولار" }, symbol: "$", is_default: true }])];
  if (method === "GET" && path === "/service-categories") return [200, envelope(200, CATEGORIES)];
  if (method === "GET" && path === "/stylists") return [200, paged(STYLISTS.filter((s) => !search.get("status") || s.status === search.get("status")))];
  if (method === "GET" && path === "/services") return [200, paged(SERVICES)];
  return [404, envelope(404, null)];
}

createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${PORT}`);
  const chunks = [];
  request.on("data", (chunk) => chunks.push(chunk));
  request.on("end", () => {
    let body = null;
    try { body = JSON.parse(Buffer.concat(chunks).toString() || "null"); } catch { body = null; }
    const path = url.pathname.startsWith(PREFIX) ? url.pathname.slice(PREFIX.length) : null;
    const [status, payload] = path === null ? [404, envelope(404, null)] : route(request.method ?? "GET", path, body, url.searchParams);
    response.writeHead(status, { "Content-Type": "application/json" });
    response.end(JSON.stringify(payload));
  });
}).listen(PORT, "127.0.0.1", () => console.log(`fake backend on ${PORT}`));
