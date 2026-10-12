"use client";

import { useDictionary } from "@/hooks/use-dictionary";

type Resource = "branches" | "chairs" | "services" | "stylists";

export function EntityCrudHeading({
  resource,
  editing = false,
}: {
  resource: Resource;
  editing?: boolean;
}) {
  const dictionary = useDictionary();
  const action = editing
    ? dictionary.operations.edit
    : dictionary.operations.create;

  return (
    <h1 className="text-2xl font-semibold text-title-50">
      {action} {dictionary.common.nav[resource]}
    </h1>
  );
}
