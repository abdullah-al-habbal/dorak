/** TanStack mutation keys for auth writes; one entry per `auth.mutation.ts` request. */
export const AUTH_MUTATION_KEYS = {
  login: ["auth", "login"],
  logout: ["auth", "logout"],
} as const;
