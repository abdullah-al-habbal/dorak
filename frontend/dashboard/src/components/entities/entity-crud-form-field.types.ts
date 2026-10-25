import type { EntityFormFieldOptions } from "@/components/entities/entity-crud-field-options.types";
import type { Dictionary } from "@/i18n/dictionary.types";
import type { UseFormReturn } from "react-hook-form";

export interface IEntityCrudFormFieldProps {
  field: string;
  fieldCopy: Dictionary["operations"]["field"];
  options: EntityFormFieldOptions;
  form: UseFormReturn<Record<string, unknown>>;
}
