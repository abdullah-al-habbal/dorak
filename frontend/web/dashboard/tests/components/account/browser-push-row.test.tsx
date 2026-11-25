// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BrowserPushRow } from "@/components/account/notifications/browser-push-row";
import { enAccount } from "@/locales/en/account.constant";

const push = vi.hoisted(() => ({ status: "off", pending: false, enable: vi.fn(), disable: vi.fn() }));
vi.mock("@/hooks/account/notifications/use-browser-push", () => ({ useBrowserPush: () => push }));
vi.mock("@/hooks/core/state/use-dictionary", async () => {
  const { enAccount: account } = await import("@/locales/en/account.constant");
  return { useDictionary: () => ({ account }) };
});

const copy = enAccount.notifications.browserPush;
const control = (): HTMLElement => screen.getByRole("switch", { name: copy.label });

describe("BrowserPushRow", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    push.status = "off";
    push.pending = false;
  });

  it.each(["checking", "unconfigured"])("renders nothing while %s", (status) => {
    push.status = status;
    const { container } = render(<BrowserPushRow />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each([["unsupported", copy.unsupported], ["denied", copy.denied]])("explains the %s state and locks the switch", (status, hint) => {
    push.status = status;
    render(<BrowserPushRow />);
    expect(control()).toHaveAttribute("aria-disabled", "true");
    expect(control()).toHaveAccessibleDescription(hint);
  });

  it("turns push on from off and off from on", async () => {
    const view = render(<BrowserPushRow />);
    await userEvent.click(control());
    expect(push.enable).toHaveBeenCalledTimes(1);

    push.status = "on";
    view.rerender(<BrowserPushRow />);
    await userEvent.click(control());
    expect(push.disable).toHaveBeenCalledTimes(1);
  });
});
