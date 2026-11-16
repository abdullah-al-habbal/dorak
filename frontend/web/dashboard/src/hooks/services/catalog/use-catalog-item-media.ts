"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { useFeedbackMutation } from "@/hooks/core/query/use-feedback-mutation";
import { catalogAdminKeys } from "@/lib/query-keys/services/catalog-admin-keys";
import { deleteCatalogItemMedia, uploadCatalogItemMedia } from "@/services/api/mutation/services/catalog-media.mutation";
import type { CatalogMedium } from "@/types/services/catalog-item.type";

interface UploadVariables {
  itemId: string;
  file: File;
}

interface RemoveVariables {
  itemId: string;
  mediaId: string;
}

export function useUploadCatalogItemMedia(): UseMutationResult<CatalogMedium, Error, UploadVariables> {
  const { adminCatalog } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ itemId, file }: UploadVariables) => uploadCatalogItemMedia(itemId, file),
    invalidate: [catalogAdminKeys.all],
    successMessage: () => adminCatalog.items.media.toast.added,
    errorMessage: () => adminCatalog.items.media.toast.addFailed,
  });
}

export function useRemoveCatalogItemMedia(): UseMutationResult<void, Error, RemoveVariables> {
  const { adminCatalog } = useDictionary();
  return useFeedbackMutation({
    mutationFn: ({ itemId, mediaId }: RemoveVariables) => deleteCatalogItemMedia(itemId, mediaId),
    invalidate: [catalogAdminKeys.all],
    successMessage: () => adminCatalog.items.media.toast.removed,
    errorMessage: () => adminCatalog.items.media.toast.removeFailed,
  });
}
