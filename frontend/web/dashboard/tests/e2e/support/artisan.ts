import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { assertIsolatedE2eDatabase } from "@tests/e2e/support/e2e-database-guard";
import { E2E_BACKEND_DIR } from "@tests/e2e/support/e2e-env.constant";

const run = promisify(execFile);
const MAX_OUTPUT_BYTES = 10 * 1024 * 1024;

export interface ArtisanOptions {
  /** Kills the command after this many milliseconds; unbounded when left out (the global setup's `migrate:fresh`). */
  timeoutMs?: number;
}

/** Runs an artisan command in the backend project and returns its output; refuses unless the run names a throwaway database. */
export async function artisan(args: readonly string[], options: ArtisanOptions = {}): Promise<string> {
  assertIsolatedE2eDatabase(process.env);
  const { stdout } = await run("php", ["artisan", ...args, "--no-interaction"], {
    cwd: E2E_BACKEND_DIR,
    maxBuffer: MAX_OUTPUT_BYTES,
    timeout: options.timeoutMs,
  });
  return stdout;
}
