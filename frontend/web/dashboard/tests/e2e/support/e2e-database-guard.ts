/**
 * The E2E suite rebuilds and reseeds whatever database the backend is configured with, and the backend reads
 * `DB_DATABASE` from the process environment before `.env`. Project policy: `dorak_test` is the ONLY automated-test
 * database (no `dorak_e2e`, no per-worker copies), so the run must name it explicitly; a missing or any other name
 * would silently target the development database from `.env`. Changing this policy requires explicit approval.
 */
export const E2E_DATABASE = "dorak_test";

export function assertIsolatedE2eDatabase(env: Readonly<Record<string, string | undefined>>): void {
  const database = env.DB_DATABASE;
  if (database !== E2E_DATABASE) {
    throw new Error(
      `Refusing to run E2E against "${database ?? "(DB_DATABASE not set; .env would pick the development database)"}". ` +
        `The only permitted automated-test database is ${E2E_DATABASE}; run with DB_DATABASE=${E2E_DATABASE}.`,
    );
  }
}
