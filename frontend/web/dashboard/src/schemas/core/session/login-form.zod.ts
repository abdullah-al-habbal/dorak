import { z } from "zod";

import { passwordField } from "@/schemas/fields/password-field.zod";
import { MAX_PASSWORD_LENGTH } from "@/schemas/core/session/login-body.zod";

/** Sign-in accepts any stored password, so only presence and the backend maximum are checked. */
const LOGIN_PASSWORD_MIN_LENGTH = 1;

export const loginFormSchema = z.object({
  email: z.email({ error: "emailInvalid" }),
  password: passwordField({ min: LOGIN_PASSWORD_MIN_LENGTH, max: MAX_PASSWORD_LENGTH, message: "passwordRequired", required: true }),
});
