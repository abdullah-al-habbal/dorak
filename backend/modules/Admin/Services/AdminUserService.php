<?php

declare(strict_types=1);

namespace Modules\Admin\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Admin\Exceptions\AdminUserGuardException;
use Modules\Admin\Models\AdminModel;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Services\DashboardPasswordResetLinkSender;

/** Platform admin accounts: invite, edit, deactivate, reactivate. Every guard runs under a row lock. */
final class AdminUserService
{
    public function __construct(private readonly DashboardPasswordResetLinkSender $links) {}

    /**
     * The colleague never learns a password: the account starts with a random one and the
     * NS-01 reset link is how they set their own.
     *
     * @param  array{en: string, ar: string}  $name
     */
    public function invite(array $name, string $email, string $locale): AdminModel
    {
        $admin = DB::transaction(fn (): AdminModel => AdminModel::query()->create([
            'name' => $name,
            'email' => $email,
            'password' => Str::random(64),
        ]));
        $this->links->send(DashboardActorTypeEnum::Admin, $admin, $locale);

        return $admin;
    }

    public function resendInvite(string $adminId, string $locale): bool
    {
        $admin = AdminModel::query()->whereKey($adminId)->whereNull('deactivated_at')->firstOrFail();

        return $this->links->send(DashboardActorTypeEnum::Admin, $admin, $locale);
    }

    /** @param array<string, mixed> $changes */
    public function update(string $adminId, array $changes): AdminModel
    {
        return DB::transaction(function () use ($adminId, $changes): AdminModel {
            $admin = $this->lock($adminId);
            $admin->fill($changes)->save();

            return $admin;
        });
    }

    public function deactivate(string $adminId, string $actingAdminId): AdminModel
    {
        return DB::transaction(function () use ($adminId, $actingAdminId): AdminModel {
            if ($adminId === $actingAdminId) {
                throw AdminUserGuardException::selfDeactivation();
            }

            // Lock every active admin so two simultaneous deactivations cannot both pass the count.
            $active = AdminModel::query()->whereNull('deactivated_at')->lockForUpdate()->pluck('id');
            $admin = $this->lock($adminId);
            if ($admin->isActive() && $active->count() <= 1) {
                throw AdminUserGuardException::lastActiveAdmin();
            }

            $admin->forceFill(['deactivated_at' => $admin->deactivated_at ?? now()])->save();
            $admin->tokens()->delete();

            return $admin;
        });
    }

    public function reactivate(string $adminId): AdminModel
    {
        return DB::transaction(function () use ($adminId): AdminModel {
            $admin = $this->lock($adminId);
            $admin->forceFill(['deactivated_at' => null])->save();

            return $admin;
        });
    }

    private function lock(string $adminId): AdminModel
    {
        return AdminModel::query()->whereKey($adminId)->lockForUpdate()->firstOrFail();
    }
}
