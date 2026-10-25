import { z } from "zod";

export function createUpdatePasswordFormSchema(copy: {
  passwordMismatch: string;
}) {
  return z
    .object({
      currentPassword: z.string().min(1),
      password: z.string().min(12),
      passwordConfirmation: z.string().min(12),
    })
    .refine((input) => input.password === input.passwordConfirmation, {
      message: copy.passwordMismatch,
      path: ["passwordConfirmation"],
    });
}
