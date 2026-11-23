<?php

declare(strict_types=1);

namespace Modules\Core\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\UniqueConstraintViolationException;
use Modules\Core\CQRS\Command\Shared\RegisterDeviceTokenCommand;
use Modules\Core\Enums\DeviceTokenUserTypeEnum;
use Modules\Core\Models\DeviceTokenModel;

/**
 * Registers, refreshes and revokes push device tokens. A token proves possession of one
 * physical install, so registering it again for another account moves it to that account.
 */
final class DeviceTokenService
{
    public function register(Model $actor, RegisterDeviceTokenCommand $command): DeviceTokenModel
    {
        $attributes = [
            'user_id' => $actor->getKey(),
            'user_type' => DeviceTokenUserTypeEnum::from($actor->getMorphClass()),
            'platform_type' => $command->platform,
            'locale' => $command->locale,
            'app_version' => $command->appVersion,
            'access_token_id' => $command->accessTokenId,
            'last_used_at' => now(),
            'revoked_at' => null,
        ];

        try {
            return DeviceTokenModel::query()->updateOrCreate(['token' => $command->token], $attributes);
        } catch (UniqueConstraintViolationException) {
            // A parallel registration of the same token won the insert; refresh the row it created.
            return DeviceTokenModel::query()->updateOrCreate(['token' => $command->token], $attributes);
        }
    }

    public function revoke(DeviceTokenModel $deviceToken): void
    {
        $deviceToken->forceFill(['revoked_at' => now()])->save();
    }

    /** Revokes one token only when it belongs to the account (a foreign or unknown token is ignored). */
    public function revokeOwnedToken(Model $account, string $token): void
    {
        DeviceTokenModel::query()
            ->where('token', $token)
            ->where('user_id', $account->getKey())
            ->where('user_type', $account->getMorphClass())
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }

    /** Stops pushes to every device that signed in with the given API token (used on logout). */
    public function revokeForAccessToken(int|string|null $accessTokenId): void
    {
        if ($accessTokenId === null) {
            return;
        }

        DeviceTokenModel::query()
            ->where('access_token_id', $accessTokenId)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }

    /**
     * Stops pushes to every device of an account whose API tokens were just invalidated (password
     * change or reset, ban, deactivation). With a kept access token, devices signed in with it stay.
     */
    public function revokeAllForAccount(Model $account, int|string|null $keepAccessTokenId = null): void
    {
        DeviceTokenModel::query()
            ->where('user_id', $account->getKey())
            ->where('user_type', $account->getMorphClass())
            ->whereNull('revoked_at')
            ->when($keepAccessTokenId !== null, fn ($query) => $query->where(
                fn ($inner) => $inner->whereNull('access_token_id')->orWhere('access_token_id', '!=', $keepAccessTokenId),
            ))
            ->update(['revoked_at' => now()]);
    }

    /** Erases every device token of an account (account deletion: no push address may outlive it). */
    public function deleteAllForAccount(Model $account): void
    {
        DeviceTokenModel::query()
            ->where('user_id', $account->getKey())
            ->where('user_type', $account->getMorphClass())
            ->delete();
    }
}
