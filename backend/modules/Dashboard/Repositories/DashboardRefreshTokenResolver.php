<?php

declare(strict_types=1);

namespace Modules\Dashboard\Repositories;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Models\DashboardRefreshTokenModel;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class DashboardRefreshTokenResolver
{
    public function __construct(
        private readonly DashboardOwnerActorResolver $ownerActors,
    ) {}

    public function ttl(): int
    {
        return app(SettingsService::class)->int(SettingKey::DashboardRefreshTtlSeconds);
    }

    public function issue(DashboardActor $actor): string
    {
        [, $plainText] = $this->persist($actor);

        return $plainText;
    }

    /**
     * Validate and single-use rotate a refresh token.
     *
     * @return array{actor: DashboardActor, token: string}|null
     */
    public function rotate(string $plainText): ?array
    {
        return DB::transaction(function () use ($plainText): ?array {
            $record = DashboardRefreshTokenModel::query()
                ->where('token_hash', $this->hash($plainText))
                ->lockForUpdate()
                ->first();

            if (! $record instanceof DashboardRefreshTokenModel || ! $record->isActive()) {
                return null;
            }

            $actor = $this->actorFromRecord($record);
            if ($actor === null) {
                $record->forceFill(['revoked_at' => now()])->save();

                return null;
            }
            [$newRecord, $newPlainText] = $this->persist($actor);

            $record->forceFill([
                'revoked_at' => now(),
                'replaced_by_token_id' => $newRecord->getKey(),
            ])->save();

            return ['actor' => $actor, 'token' => $newPlainText];
        });
    }

    public function revoke(string $plainText): void
    {
        DashboardRefreshTokenModel::query()
            ->where('token_hash', $this->hash($plainText))
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }

    public function revokeForActor(DashboardActor $actor): void
    {
        $this->revokeAllFor($actor->actorType, $actor->id);
    }

    /** Revokes every active refresh token of an account, except the one given (the session making a change). */
    public function revokeAllFor(DashboardActorTypeEnum $actorType, string $actorId, ?string $exceptPlainText = null): void
    {
        DashboardRefreshTokenModel::query()
            ->where('actor_type', $actorType)
            ->where('actor_id', $actorId)
            ->whereNull('revoked_at')
            ->when($exceptPlainText !== null, fn ($query) => $query->where('token_hash', '!=', $this->hash((string) $exceptPlainText)))
            ->update(['revoked_at' => now()]);
    }

    /**
     * @return array{0: DashboardRefreshTokenModel, 1: string}
     */
    private function persist(DashboardActor $actor): array
    {
        $plainText = Str::random(64);

        $record = DashboardRefreshTokenModel::query()->create([
            'actor_type' => $actor->actorType,
            'actor_id' => $actor->id,
            'guard_name' => $actor->actorType->guard(),
            'token_hash' => $this->hash($plainText),
            'expires_at' => now()->addSeconds($this->ttl()),
        ]);

        return [$record, $plainText];
    }

    private function actorFromRecord(DashboardRefreshTokenModel $record): ?DashboardActor
    {
        return match ($record->actor_type) {
            DashboardActorTypeEnum::Admin => new DashboardActor($record->actor_id, DashboardActorTypeEnum::Admin, 'platform_admin', null),
            DashboardActorTypeEnum::Branch => new DashboardActor($record->actor_id, DashboardActorTypeEnum::Branch, 'branch_manager', $record->actor_id),
            DashboardActorTypeEnum::Barber => new DashboardActor($record->actor_id, DashboardActorTypeEnum::Barber, 'barber', null),
            DashboardActorTypeEnum::Owner => $this->ownerActors->forClientId($record->actor_id),
        };
    }

    private function hash(string $plainText): string
    {
        return hash('sha256', $plainText);
    }
}
