import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import type { MappedFormError } from "@/interfaces/core/query/mapped-form-error.interface";
import type { FormFieldNameMapper } from "@/types/core/api/form-field-name-mapper.type";

export const FORM_ROOT_FIELD = "root";

/**
 * A `FormFieldNameMapper` from a table of backend field names to form field names. A nested name such as
 * `body.en.heading` resolves through its longest listed parent (`body.en`); anything unlisted maps to the form root.
 */
export function createFieldNameMapper(fields: Readonly<Record<string, string>>): FormFieldNameMapper {
  return (apiName) => {
    const parent = Object.keys(fields).find((key) => apiName === key || apiName.startsWith(`${key}.`));
    return parent === undefined ? FORM_ROOT_FIELD : fields[parent];
  };
}

/** Puts a mapped failure on the form: each field error under its field (unknown names on the root) and the form-level message on the root. */
export function applyFormError<TValues extends FieldValues>(form: Pick<UseFormReturn<TValues>, "setError"> & { getValues: () => TValues }, mapped: MappedFormError): void {
  const known = Object.keys(form.getValues());
  for (const [name, message] of Object.entries(mapped.fieldErrors)) {
    const field = known.find((key): key is Path<TValues> => key === name);
    form.setError(field ?? FORM_ROOT_FIELD, { message });
  }
  if (mapped.formError) form.setError(FORM_ROOT_FIELD, { message: mapped.formError });
}
