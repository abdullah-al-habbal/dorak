export interface PasswordFieldOptions {
  min: number;
  max: number;
  message: string;
  /** When false an empty string is accepted (keep the current password). */
  required: boolean;
}
