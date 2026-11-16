"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";

import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { imageFileIssue } from "@/lib/uploads/image-file.util";
import { uploadBrandLogo } from "@/services/api/mutation/brands/brand-logo.mutation";

interface BrandLogoController {
  error: string | undefined;
  onPick: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Uploads the picked file and returns its URL; `undefined` when none is picked. Throws after setting `error` when the upload fails. */
  upload: () => Promise<string | undefined>;
}

/** The logo picked in the add-brand dialog: checked when chosen, uploaded only when the form is submitted. */
export function useBrandLogo(): BrandLogoController {
  const { ownerBrand: t } = useDictionary();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>();

  const onPick = (event: ChangeEvent<HTMLInputElement>): void => {
    const picked = event.target.files?.[0] ?? null;
    const issue = picked ? imageFileIssue(picked) : undefined;
    setError(issue === undefined ? undefined : t.create.validation[issue === "type" ? "logoType" : "logoSize"]);
    setFile(issue === undefined ? picked : null);
  };

  const upload = async (): Promise<string | undefined> => {
    if (file === null) return undefined;
    try {
      return await uploadBrandLogo(file);
    } catch (failure) {
      setError(t.create.validation.logoFailed);
      throw failure;
    }
  };

  return { error, onPick, upload };
}
