"use client";

import { CheckIcon, PauseIcon, PencilIcon, PlayIcon, XIcon } from "lucide-react";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { BrandLifecycleAction } from "@/enums/venue/brand-lifecycle-action.enum";
import { BrandStatus } from "@/enums/venue/brand-status.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useConfirmApproveBrand } from "@/hooks/brands/admin/use-confirm-approve-brand";
import { useConfirmReactivateBrand } from "@/hooks/brands/admin/use-confirm-reactivate-brand";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

/** What an admin can do with a brand in its current status. Each move opens its own dialog on top of this one. */
export function BrandDetailActions({ brand }: { brand: AdminBrand }): JSX.Element {
  const { adminBrands: t } = useDictionary();
  const overlay = useOverlay();
  const confirmApprove = useConfirmApproveBrand();
  const confirmReactivate = useConfirmReactivateBrand();
  const reason = (action: BrandLifecycleAction.Reject | BrandLifecycleAction.Suspend) => overlay.open({ kind: OverlayKind.BrandReason, brand, action });

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button type="button" variant="outline" onClick={() => overlay.open({ kind: OverlayKind.BrandEdit, brand })}>
        <PencilIcon aria-hidden data-icon="inline-start" />
        {t.edit.open}
      </Button>
      {brand.status === BrandStatus.Pending ? (
        <>
          <Button type="button" variant="outline" onClick={() => reason(BrandLifecycleAction.Reject)}>
            <XIcon aria-hidden data-icon="inline-start" />
            {t.reject.action}
          </Button>
          <Button type="button" onClick={() => confirmApprove(brand)}>
            <CheckIcon aria-hidden data-icon="inline-start" />
            {t.approve}
          </Button>
        </>
      ) : null}
      {brand.status === BrandStatus.Active ? (
        <Button type="button" variant="outline" onClick={() => reason(BrandLifecycleAction.Suspend)}>
          <PauseIcon aria-hidden data-icon="inline-start" />
          {t.suspend.action}
        </Button>
      ) : null}
      {brand.status === BrandStatus.Suspended ? (
        <Button type="button" onClick={() => confirmReactivate(brand)}>
          <PlayIcon aria-hidden data-icon="inline-start" />
          {t.reactivate.action}
        </Button>
      ) : null}
    </div>
  );
}
