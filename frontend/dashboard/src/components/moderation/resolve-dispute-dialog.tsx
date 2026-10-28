"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FloorPlanEnumSelect } from "@/components/floor-plan/floor-plan-enum-select";
import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { useDictionary } from "@/hooks/use-dictionary";
import {
  notifyApiError,
  notifySuccess,
} from "@/services/api/core/notifications";
import { DISPUTE_RESOLUTIONS } from "@/services/api/dashboard/moderation/moderation.constant";
import { resolveDispute } from "@/services/api/dashboard/moderation/moderation.query";
import { resolveDisputeFormSchema } from "@/services/api/dashboard/moderation/schemas/moderation.schema";
import type { IResolveDisputeForm } from "@/services/api/dashboard/moderation/types/imoderation.types";
import { MODERATION_QUERY_KEYS } from "@/services/api/dashboard/moderation/moderation.constant";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface IResolveDisputeDialogProps {
  reviewId: string;
}

export function ResolveDisputeDialog({ reviewId }: IResolveDisputeDialogProps) {
  const dictionary = useDictionary();
  const copy = dictionary.moderation.disputes;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const form = useForm<IResolveDisputeForm>({
    resolver: zodResolver(resolveDisputeFormSchema),
    defaultValues: { status: "published", note: "" },
  });
  const resolve = useMutation({
    mutationFn: (value: IResolveDisputeForm) => resolveDispute(reviewId, value),
    onSuccess: async () => {
      notifySuccess(copy.resolved);
      setOpen(false);
      await queryClient.invalidateQueries({
        queryKey: MODERATION_QUERY_KEYS.disputedReviews,
      });
    },
    onError: (error) => notifyApiError(error, dictionary),
  });

  return (
    <>
      <Button appearance="outline" size="sm" onPress={() => setOpen(true)}>
        {copy.resolve}
      </Button>
      <Dialog
        isOpen={open}
        onOpenChange={setOpen}
        labels={dictionary.common.dialog}
      >
        <form onSubmit={form.handleSubmit((value) => resolve.mutate(value))}>
          <DialogHeader>
            <DialogTitle>{copy.resolveTitle}</DialogTitle>
          </DialogHeader>
          <DialogBody className="grid gap-4">
            <FloorPlanEnumSelect
              control={form.control}
              name="status"
              label={copy.decision}
              options={DISPUTE_RESOLUTIONS.map(
                (value) => [value, copy.resolutions[value]] as const,
              )}
            />
            <label className="grid gap-2 text-sm text-text-100">
              <span>{copy.note}</span>
              <TextArea
                state={form.formState.errors.note ? "error" : "default"}
                {...form.register("note")}
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
            <Button type="submit" isDisabled={resolve.isPending}>
              {copy.submit}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
