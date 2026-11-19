// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { BranchesScreen } from "@/components/branches/branches-screen";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { dataReply, describeListScreen, installFetchBoundary } from "@tests/helpers/list-screen.helper";

const nav = vi.hoisted(() => ({ search: "", replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: nav.replace }), usePathname: () => "/dashboard/test", useSearchParams: () => new URLSearchParams(nav.search) }));

const t = enDictionary.branches;
const downtown = { id: "br1", name: { en: "Downtown", ar: "وسط" }, email: "down@branch.test", status: "enabled", brand_id: "b1" };
const uptown = { id: "br2", name: { en: "Uptown", ar: "علوي" }, email: "up@branch.test", status: "pending", brand_id: "b1" };

const server = installFetchBoundary(nav, { listPath: "/branches?", side: { "/brands?": dataReply([]) } });

describeListScreen({
  screen: () => <BranchesScreen actor={AuthActor.Admin} />,
  forbidden: { screen: () => <BranchesScreen actor={AuthActor.Manager} />, title: t.states.forbiddenTitle },
  server,
  nav,
  states: { ...t.states },
  rows: { records: [downtown, uptown], visibleText: ["Downtown", "down@branch.test", "Uptown"] },
  filtered: { search: "search=zzz", clearLabel: t.filters.clear, sentToApi: "search=zzz" },
});
