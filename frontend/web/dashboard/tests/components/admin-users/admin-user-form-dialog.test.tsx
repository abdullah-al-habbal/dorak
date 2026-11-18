// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminUserFormDialog } from "@/components/admin-users/admin-user-form-dialog";
import { ApiErrorCode } from "@/enums/access/api-error-code.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { labelStart } from "@tests/helpers/label.helper";
import { renderInApp } from "@tests/helpers/list-screen.helper";
import type { AdminUser } from "@/types/platform/admin-user.type";

const mutateAsync = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/platform/admin-users/use-save-admin-user", () => ({ useSaveAdminUser: () => ({ mutateAsync, isPending: false }) }));

const t = enDictionary.adminUsers.form;

async function fillValid(): Promise<void> {
  await userEvent.type(screen.getByLabelText(labelStart(t.nameEn)), " Lina ");
  await userEvent.type(screen.getByLabelText(labelStart(t.nameAr)), "لينا");
  await userEvent.type(screen.getByLabelText(labelStart(t.email)), " lina@dorak.test ");
}

describe("AdminUserFormDialog", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue(undefined);
  });

  it("flags missing names and a bad email without calling the API", async () => {
    renderInApp(<AdminUserFormDialog onClose={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(labelStart(t.email)), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: t.invite }));
    expect((await screen.findAllByText(t.validation.name)).length).toBe(2);
    expect(screen.getByText(t.validation.email)).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("invites with trimmed names and email", async () => {
    const onClose = vi.fn();
    renderInApp(<AdminUserFormDialog onClose={onClose} />);
    await fillValid();
    await userEvent.click(screen.getByRole("button", { name: t.invite }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mutateAsync).toHaveBeenCalledWith({ id: undefined, payload: { name: { en: "Lina", ar: "لينا" }, email: "lina@dorak.test" } });
  });

  it("starts an edit from the admin's current details and saves under their id", async () => {
    const admin = { id: "a1", name: { en: "Omar", ar: "عمر" }, email: "omar@dorak.test" } as unknown as AdminUser;
    const onClose = vi.fn();
    renderInApp(<AdminUserFormDialog admin={admin} onClose={onClose} />);
    expect(screen.getByLabelText(labelStart(t.nameEn))).toHaveValue("Omar");
    expect(screen.getByLabelText(labelStart(t.email))).toHaveValue("omar@dorak.test");
    await userEvent.click(screen.getByRole("button", { name: t.save }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mutateAsync).toHaveBeenCalledWith({ id: "a1", payload: { name: { en: "Omar", ar: "عمر" }, email: "omar@dorak.test" } });
  });

  it("puts a taken-email error under the email field and stays open", async () => {
    mutateAsync.mockImplementation(async () => {
      throw new ApiClientError({ status: 422, code: ApiErrorCode.InvalidRequest, message: "", fields: { email: ["That email is taken."] } });
    });
    const onClose = vi.fn();
    renderInApp(<AdminUserFormDialog onClose={onClose} />);
    await fillValid();
    await userEvent.click(screen.getByRole("button", { name: t.invite }));
    expect(await screen.findByText("That email is taken.")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows the generic failure for a server error", async () => {
    mutateAsync.mockImplementation(async () => {
      throw new ApiClientError({ status: 500, code: ApiErrorCode.Server, message: "" });
    });
    renderInApp(<AdminUserFormDialog onClose={vi.fn()} />);
    await fillValid();
    await userEvent.click(screen.getByRole("button", { name: t.invite }));
    expect(await screen.findByText(t.errors.generic)).toBeInTheDocument();
  });
});
