/** A failed write, split into messages under form fields and an optional form-level message. */
export interface MappedFormError {
  /** Messages keyed by the form field they belong under. */
  fieldErrors: Record<string, string>;
  /** Shown in the form-level alert when no field owns the problem. */
  formError?: string;
}
