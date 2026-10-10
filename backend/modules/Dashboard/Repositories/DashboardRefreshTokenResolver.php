<?php

declare(strict_types=1);

namespace Modules\Dashboard\Repositories;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Modules\Dashboard\Models\DashboardRefreshTokenModel;
use Modules\Dashboard\Support\DashboardActor;
use RuntimeException;

final class DashboardRefreshTokenResolver
{
    private const int DefaultTtlSeconds = 2592000;

    private const int MinimumTtlSeconds = 3600;

    public function ttl(): int
    {
        $ttl = config('dashboard.dashboard.refresh_ttl_seconds', self::DefaultTtlSeconds);
        if (! is_int($ttl) || $ttl < self::MinimumTtlSeconds) {
            throw new RuntimeException('DASHBOARD_REFRESH_TTL_SECONDS must be at least 3600 seconds.');
        }

        return $ttl;
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
            [$newRecord, $newPlainText] = $this->persist($actor);

            $record->forceFill([
                'revoked_at' => now(),
                'replaced_by_id' => $newRecord->getKey(),
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
        DashboardRefreshTokenModel::query()
            ->where('actor_type', $actor->actorType)
            ->where('actor_id', $actor->id)
            ->whereNull('revoked_at')
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
            'guard' => $this->guardFor($actor->actorType),
            'token_hash' => $this->hash($plainText),
            'expires_at' => now()->addSeconds($this->ttl()),
        ]);

        return [$record, $plainText];
    }

    private function actorFromRecord(DashboardRefreshTokenModel $record): DashboardActor
    {
        return match ($record->actor_type) {
            DashboardActor::ADMIN => new DashboardActor($record->actor_id, DashboardActor::ADMIN, 'platform_admin', null),
            DashboardActor::BRANCH => new DashboardActor($record->actor_id, DashboardActor::BRANCH, 'branch_manager', $record->actor_id),
            DashboardActor::BARBER => new DashboardActor($record->actor_id, DashboardActor::BARBER, 'barber', null),
            default => throw new InvalidArgumentException('Unsupported dashboard actor type: '.$record->actor_type),
        };
    }

    private function guardFor(string $actorType): string
    {
        return match ($actorType) {
            DashboardActor::ADMIN => 'admin_api',
            DashboardActor::BRANCH => 'branch_api',
            DashboardActor::BARBER => 'barber',
            default => throw new InvalidArgumentException('Unsupported dashboard actor type: '.$actorType),
        };
    }

    private function hash(string $plainText): string
    {
        return hash('sha256', $plainText);
    }
}
