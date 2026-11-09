import type { PasswordPairMessages } from "@/interfaces/password-pair-messages.interface";

export interface ChangePasswordMessages extends PasswordPairMessages {
  current: string;
}
