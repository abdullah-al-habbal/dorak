import { artisan } from "@tests/e2e/support/artisan";

const POLL_ATTEMPTS = 20;
const POLL_DELAY_MS = 500;
const CODE_TTL_SECONDS = 600;
const PLANTED = "planted";

/**
 * The sign-up creates the account after the response, and the code mail goes through the queue, which no worker
 * runs here. So the spec waits for the account and caches a known code for it, the same cache entry the real
 * job writes; the mail itself is covered by the backend tests.
 */
export async function plantVerificationCode(email: string, code: string): Promise<void> {
  const script = [
    `$client = \\Modules\\Client\\Models\\ClientModel::query()->where('email', '${email}')->first();`,
    `if ($client === null) { echo 'missing'; return; }`,
    `\\Illuminate\\Support\\Facades\\Cache::put('email_verify_'.$client->id, '${code}', ${CODE_TTL_SECONDS});`,
    `echo '${PLANTED}';`,
  ].join(" ");

  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
    const output = await artisan(["tinker", `--execute=${script}`]);
    if (output.includes(PLANTED)) return;
    await new Promise((resolve) => setTimeout(resolve, POLL_DELAY_MS));
  }
  throw new Error(`The sign-up for ${email} never created an account.`);
}
