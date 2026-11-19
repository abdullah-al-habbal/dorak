// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { BarberApprovalsScreen } from "@/components/barber-approvals/barber-approvals-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeListScreen, installFetchBoundary } from "@tests/helpers/list-screen.helper";

const nav = vi.hoisted(() => ({ search: "", replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: nav.replace }), usePathname: () => "/dashboard/test", useSearchParams: () => new URLSearchParams(nav.search) }));

const t = enDictionary.barberApprovals;
const noor = { id: "bb1", name: { en: "Noor Karim", ar: "نور" }, email: "noor@barber.test", status: "pending", created_at: "2026-01-02T10:00:00Z" };
const sami = { id: "bb2", name: { en: "Sami Dib", ar: "سامي" }, email: "sami@barber.test", status: "enabled", created_at: "2026-01-03T10:00:00Z" };

const server = installFetchBoundary(nav, { listPath: "/admin/barbers?" });

describeListScreen({
  screen: () => <BarberApprovalsScreen actor={AuthActor.Admin} />,
  forbidden: { screen: () => <BarberApprovalsScreen actor={AuthActor.Manager} />, title: t.states.forbiddenTitle },
  server,
  nav,
  states: { ...t.states },
  rows: { records: [noor, sami], visibleText: ["Noor Karim", "noor@barber.test", "Sami Dib"] },
  filtered: { search: "search=zzz", clearLabel: t.filters.clear, sentToApi: "search=zzz" },
});
