'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/components/buttons/button';

const chairConflictEvent = 'dorak:chair-conflict';

export function publishChairConflict(): void {
  window.dispatchEvent(new Event(chairConflictEvent));
}

export function ChairConflictDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onConflict = () => setOpen(true);
    window.addEventListener(chairConflictEvent, onConflict);
    return () => window.removeEventListener(chairConflictEvent, onConflict);
  }, []);
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
    }
  }, [open]);
  const close = () => {
    dialog.current?.close();
    setOpen(false);
  };
  return (
    <dialog
      aria-labelledby="chair-conflict-title"
      className="max-w-md rounded-lg border bg-surface p-6 text-foreground backdrop:bg-foreground/20"
      ref={dialog}
      onClose={close}
    >
      <h2 className="text-lg font-semibold" id="chair-conflict-title">
        Chair schedule is protected
      </h2>
      <p className="mt-2 text-sm">
        Active or future bookings are assigned to this chair. Complete, cancel, or reassign those
        bookings before changing its status, barber, or deleting it.
      </p>
      <div className="mt-6 flex justify-end">
        <Button onClick={close} type="button">
          Understood
        </Button>
      </div>
    </dialog>
  );
}
