"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { useDictionary } from "@/hooks/use-dictionary";
import { ApiClientError } from "@/services/api/core/client-error";
import {
  notifyApiError,
  notifySuccess,
} from "@/services/api/core/notifications";
import { inviteBarber } from "@/services/api/dashboard/people/people.query";
import { inviteAffiliationFormSchema } from "@/services/api/dashboard/people/schemas/people.schema";
import type {
  IInviteAffiliation,
  IInviteAffiliationInput,
} from "@/services/api/dashboard/people/types/ipeople.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

interface IInviteAffiliationFormProps {
  branchId: string;
}

const SERVER_FIELD_MAP: Record<string, "barberId" | "commissionRate"> = {
  barber_id: "barberId",
  commission_rate: "commissionRate",
};

export function InviteAffiliationForm({
  branchId,
}: IInviteAffiliationFormProps) {
  const dictionary = useDictionary();
  const copy = dictionary.people.affiliations;
  const queryClient = useQueryClient();
  const form = useForm<IInviteAffiliationInput, unknown, IInviteAffiliation>({
    resolver: zodResolver(inviteAffiliationFormSchema),
    defaultValues: { barberId: "", commissionRate: "" },
  });
  const { errors } = form.formState;

  const invite = useMutation({
    mutationFn: (value: IInviteAffiliation) => inviteBarber(branchId, value),
    onSuccess: async () => {
      notifySuccess(copy.invited);
      form.reset();
      await queryClient.invalidateQueries({
        queryKey: ["dashboard", "affiliations"],
      });
    },
    onError: (error) => {
      if (error instanceof ApiClientError && error.status === 422) {
        Object.entries(error.errors ?? {}).forEach(([key, messages]) => {
          const field = SERVER_FIELD_MAP[key];
          if (field)
            form.setError(field, { type: "server", message: messages[0] });
        });
        return;
      }
      notifyApiError(error, dictionary);
    },
  });

  return (
    <form
      className="grid items-end gap-3 sm:grid-cols-3"
      onSubmit={form.handleSubmit((value) => invite.mutate(value))}
    >
      <label className="grid gap-1 text-sm text-text-100">
        <span>{copy.barberId}</span>
        <Input
          state={errors.barberId ? "error" : "default"}
          {...form.register("barberId")}
        />
        {errors.barberId?.type === "server" ? (
          <span className="text-input-error-focus-border" role="alert">
            {errors.barberId.message}
          </span>
        ) : null}
      </label>
      <label className="grid gap-1 text-sm text-text-100">
        <span>{copy.commissionRate}</span>
        <Input
          inputMode="decimal"
          state={errors.commissionRate ? "error" : "default"}
          {...form.register("commissionRate")}
        />
      </label>
      <Button type="submit" isDisabled={invite.isPending}>
        {copy.sendInvite}
      </Button>
    </form>
  );
}
