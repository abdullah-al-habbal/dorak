import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { E2E_BACKEND_DIR } from "@tests/e2e/support/e2e-env.constant";

const run = promisify(execFile);

/** Runs an artisan command in the backend project and returns its output. */
export async function artisan(...args: string[]): Promise<string> {
  const { stdout } = await run("php", ["artisan", ...args, "--no-interaction"], { cwd: E2E_BACKEND_DIR, maxBuffer: 10 * 1024 * 1024 });
  return stdout;
}
