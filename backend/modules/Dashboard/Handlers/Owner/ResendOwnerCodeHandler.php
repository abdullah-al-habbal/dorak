<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Owner;

use Modules\Client\Jobs\SendEmailVerificationCodeJob;
use Modules\Client\Models\ClientModel;
use Throwable;

use function Illuminate\Support\defer;

/** Public. Sends the code again to an unverified, unbanned account; the answer is the same for any email. */
final class ResendOwnerCodeHandler
{
    public function handle(string $email): void
    {
        defer(function () use ($email): void {
            try {
                $client = ClientModel::query()->where('email', $email)->first();

                if ($client instanceof ClientModel && $client->email_verified_at === null && ! $client->isBanned()) {
                    SendEmailVerificationCodeJob::dispatch((string) $client->getKey());
                }
            } catch (Throwable $exception) {
                report($exception);
            }
        });
    }
}
