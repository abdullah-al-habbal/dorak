<?php

declare(strict_types=1);

namespace Modules\Ban\Services;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Modules\Admin\Models\AdminModel;
use Modules\Ban\Enums\BannableTypeEnum;
use Modules\Ban\Exceptions\AccountBanException;
use Modules\Ban\Models\BanModel;

/** NS-07 and NS-08: bans and unbans a client or a barber under a row lock. A ban's history is kept; lifting only closes it. */
final class AccountBanService
{
    public function ban(BannableTypeEnum $type, string $id, AdminModel $admin, string $reason, ?CarbonInterface $expiresAt): BanModel
    {
        return DB::transaction(function () use ($type, $id, $admin, $reason, $expiresAt): BanModel {
            $account = $this->lock($type, $id);

            if ($account->bans()->active()->exists()) {
                throw AccountBanException::alreadyBanned();
            }

            // The BanObserver revokes the account's tokens, so a dashboard session ends with the ban.
            return $account->bans()->create([
                'reason' => $reason,
                'banned_at' => now(),
                'expires_at' => $expiresAt,
                'banned_by_id' => $admin->getKey(),
            ]);
        });
    }

    public function unban(BannableTypeEnum $type, string $id, AdminModel $admin): void
    {
        DB::transaction(function () use ($type, $id, $admin): void {
            $account = $this->lock($type, $id);
            $active = $account->bans()->active()->get();

            if ($active->isEmpty()) {
                throw AccountBanException::notBanned();
            }

            $now = now();
            foreach ($active as $ban) {
                $ban->forceFill(['expires_at' => $now, 'lifted_at' => $now, 'lifted_by_id' => $admin->getKey()])->save();
            }
        });
    }

    private function lock(BannableTypeEnum $type, string $id): Model
    {
        $class = $type->modelClass();

        return $class::query()->lockForUpdate()->findOrFail($id);
    }
}
