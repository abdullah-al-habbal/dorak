// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { vi } from "vitest";

import { BranchSuspendDialog } from "@/components/branches/oversight/branch-suspend-dialog";
import { BranchLifecycleAction } from "@/enums/venue/branch-lifecycle-action.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { describeReasonDialog } from "@tests/helpers/reason-dialog.helper";
import type { Branch } from "@/types/branches/branch.type";

const mutateAsync = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/branches/use-branch-lifecycle", () => ({ useBranchLifecycle: () => ({ mutateAsync, isPending: false }) }));

const t = enDictionary.branches.lifecycle;
const branch = { id: "br1", name: "Downtown" } as unknown as Branch;

describeReasonDialog({
  dialog: (onClose) => <BranchSuspendDialog branch={branch} onClose={onClose} />,
  mutate: mutateAsync,
  reasonLabel: t.reason,
  submitLabel: t.suspendDialog.confirm,
  tooShort: t.reasonRequired,
  failed: t.toast.failed,
  expectedArgs: (reason) => ({ id: "br1", action: BranchLifecycleAction.Suspend, reason }),
});
