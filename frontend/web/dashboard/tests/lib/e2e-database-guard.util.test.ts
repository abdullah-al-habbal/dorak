import { describe, expect, it } from "vitest";

import { assertIsolatedE2eDatabase } from "@tests/e2e/support/e2e-database-guard";

describe("assertIsolatedE2eDatabase", () => {
  it("accepts the single test database", () => {
    expect(() => assertIsolatedE2eDatabase({ DB_DATABASE: "dorak_test" })).not.toThrow();
  });

  it.each(["dorak_backend_development_db", "dorak", "dorak_e2e", "dorak_e2e_run1", "dorak_test_1", "dorak_test_test_1", "x_dorak_test", "Dorak_Test", ""])("refuses %j", (name) => {
    expect(() => assertIsolatedE2eDatabase({ DB_DATABASE: name })).toThrow(/Refusing to run E2E/);
  });

  it("refuses a run that leaves the database to .env", () => {
    expect(() => assertIsolatedE2eDatabase({})).toThrow(/DB_DATABASE not set/);
  });
});
