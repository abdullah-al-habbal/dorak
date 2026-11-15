import type { PasswordPairMessages } from "@/interfaces/account/password-pair-messages.interface";

export interface ChangePasswordMessages extends PasswordPairMessages {
  current: string;
}
