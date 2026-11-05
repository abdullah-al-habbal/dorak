"use client";

import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { useDictionary } from "@/hooks/use-dictionary";
import { useState } from "react";

interface IConfirmActionButtonProps {
  label: string;
  title: string;
  body: string;
  onConfirm: () => void;
  isPending: boolean;
  danger?: boolean;
}

/** A button that asks for confirmation in a dialog before running `onConfirm`. */
export function ConfirmActionButton({
  label,
  title,
  body,
  onConfirm,
  isPending,
  danger = false,
}: IConfirmActionButtonProps) {
  const dictionary = useDictionary();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        appearance="outline"
        variant={danger ? "danger" : "primary"}
        size="sm"
        onPress={() => setOpen(true)}
      >
        {label}
      </Button>
      <Dialog
        isOpen={open}
        onOpenChange={setOpen}
        labels={dictionary.common.dialog}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>{body}</DialogBody>
        <DialogFooter>
          <Button appearance="outline" onPress={() => setOpen(false)}>
            {dictionary.people.cancel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            isDisabled={isPending}
            onPress={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            {dictionary.people.confirm}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
