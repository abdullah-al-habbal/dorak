"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { api } from "@/services/api/core/client";
import { notifySuccess } from "@/services/api/core/notifications";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import { activationBody } from "@/services/api/dashboard/moderation/moderation.query";
import { activationReasonFormSchema } from "@/services/api/dashboard/moderation/schemas/moderation.schema";
import type { IActivationReasonForm } from "@/services/api/dashboard/moderation/types/iactivation-reason-form.types";
import { STYLIST_STATUS } from "@/services/api/dashboard/stylist/stylist.constant";
import type { IStylist } from "@/services/api/dashboard/stylist/types/istylist.types";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface StylistActivationToggleProps {
  id: string;
  status: IStylist["status"];
}

export function StylistActivationToggle({
  id,
  status,
}: StylistActivationToggleProps) {
  const dictionary = useDictionary();
  const copy = dictionary.moderation.activation;
  const [open, setOpen] = useState(false);
  const isEnabled = status === STYLIST_STATUS.enabled;
  const action = isEnabled ? "deactivate" : "activate";
  const form = useForm<IActivationReasonForm>({
    resolver: zodResolver(activationReasonFormSchema),
    defaultValues: { reason: "" },
  });
  const mutation = useDashboardMutation(
    "stylists",
    (value: IActivationReasonForm) =>
      api.patch<IStylist>(
        DashboardEndpoints.resourceAction("stylists", id, action),
        activationBody(value),
      ),
  );

  return (
    <>
      <Button
        appearance="outline"
        variant={isEnabled ? "danger" : "primary"}
        size="sm"
        isDisabled={mutation.isPending}
        onPress={() => setOpen(true)}
      >
        {isEnabled
          ? dictionary.operations.deactivate
          : dictionary.operations.activate}
      </Button>
      <Dialog
        isOpen={open}
        onOpenChange={setOpen}
        labels={dictionary.common.dialog}
      >
        <form
          onSubmit={form.handleSubmit((value) =>
            mutation.mutate(value, {
              onSuccess: () => {
                notifySuccess(
                  isEnabled
                    ? dictionary.operations.deactivated
                    : dictionary.operations.activated,
                );
                form.reset();
                setOpen(false);
              },
            }),
          )}
        >
          <DialogHeader>
            <DialogTitle>
              {isEnabled ? copy.deactivateTitle : copy.activateTitle}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <label className="grid gap-2 text-sm text-text-100">
              <span>{copy.reason}</span>
              <TextArea
                state={form.formState.errors.reason ? "error" : "default"}
                {...form.register("reason")}
              />
            </label>
          </DialogBody>
          <DialogFooter>
            <Button
              appearance="outline"
              type="button"
              onPress={() => setOpen(false)}
            >
              {dictionary.people.cancel}
            </Button>
            <Button
              type="submit"
              variant={isEnabled ? "danger" : "primary"}
              isDisabled={mutation.isPending}
            >
              {copy.confirm}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
