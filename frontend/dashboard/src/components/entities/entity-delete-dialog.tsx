"use client";

import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { mutateDashboardEntity } from "@/services/api/dashboard/dashboard.mutation";
import { notifySuccess } from "@/services/api/notifications";
import { useState } from "react";

interface EntityDeleteDialogProps {
  resource: "branches" | "chairs" | "services" | "stylists";
  id: string;
}

export function EntityDeleteDialog({ resource, id }: EntityDeleteDialogProps) {
  const dictionary = useDictionary();
  const [open, setOpen] = useState(false);
  const mutation = useDashboardMutation(resource, () =>
    mutateDashboardEntity(resource, "DELETE", undefined, id),
  );

  return (
    <>
      <Button
        appearance="outline"
        variant="danger"
        size="sm"
        onPress={() => setOpen(true)}
      >
        {dictionary.operations.delete}
      </Button>
      <Dialog
        isOpen={open}
        onOpenChange={setOpen}
        labels={dictionary.common.dialog}
      >
        <DialogHeader>
          <DialogTitle>{dictionary.operations.deleteTitle}</DialogTitle>
        </DialogHeader>
        <DialogBody>{dictionary.operations.deleteDescription}</DialogBody>
        <DialogFooter>
          <Button appearance="outline" onPress={() => setOpen(false)}>
            {dictionary.common.actions.cancel}
          </Button>
          <Button
            variant="danger"
            onPress={() =>
              mutation.mutate(undefined, {
                onSuccess: () => {
                  notifySuccess(dictionary.operations.deleted);
                  setOpen(false);
                },
              })
            }
            isDisabled={mutation.isPending}
          >
            {mutation.isPending
              ? dictionary.operations.deleting
              : dictionary.operations.confirmDelete}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
