<?php

declare(strict_types=1);

namespace Modules\Ban\Services;

use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Modules\Admin\Models\AdminModel;
use Modules\Ban\Exceptions\ClientBanException;
use Modules\Ban\Models\BanModel;
use Modules\Client\Models\ClientModel;

/** NS-07: bans and unbans a client under a row lock. A ban's history is kept; lifting only closes it. */
final class ClientBanService
{
    public function ban(string $clientId, AdminModel $admin, string $reason, ?CarbonInterface $expiresAt): BanModel
    {
        return DB::transaction(function () use ($clientId, $admin, $reason, $expiresAt): BanModel {
            $client = ClientModel::query()->lockForUpdate()->findOrFail($clientId);

            if ($client->isBanned()) {
                throw ClientBanException::alreadyBanned();
            }

            // The BanObserver revokes the client's tokens, so a dashboard session ends with the ban.
            return $client->bans()->create([
                'reason' => $reason,
                'banned_at' => now(),
                'expires_at' => $expiresAt,
                'banned_by_id' => $admin->getKey(),
            ]);
        });
    }

    public function unban(string $clientId, AdminModel $admin): void
    {
        DB::transaction(function () use ($clientId, $admin): void {
            $client = ClientModel::query()->lockForUpdate()->findOrFail($clientId);
            $active = $client->bans()->active()->get();

            if ($active->isEmpty()) {
                throw ClientBanException::notBanned();
            }

            $now = now();
            foreach ($active as $ban) {
                $ban->forceFill(['expires_at' => $now, 'lifted_at' => $now, 'lifted_by_id' => $admin->getKey()])->save();
            }
        });
    }
}
