<?php

declare(strict_types=1);

namespace Modules\Dashboard\Repositories;

use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Support\DashboardActor;

/**
 * Builds the brand-owner dashboard actor. A brand owner is a client account
 * referenced by `brands.owner_id`; the capability exists only while the client
 * is enabled, email-verified, and owns at least one brand, and the brand and
 * branch scope is recomputed on every request so ownership changes apply at
 * once.
 */
final class DashboardOwnerActorResolver
{
    public function forClient(ClientModel $client): ?DashboardActor
    {
        if ($client->getAttribute('status') !== ClientStatusEnum::Enabled
            || $client->getAttribute('email_verified_at') === null
            || $client->trashed()) {
            return null;
        }

        $clientId = (string) $client->getKey();

        $brandIds = BrandModel::query()
            ->where('owner_id', $clientId)
            ->orderBy('id')
            ->pluck('id')
            ->map(fn (mixed $id): string => (string) $id)
            ->values()
            ->all();

        if ($brandIds === []) {
            return null;
        }

        $branchIds = BranchModel::query()
            ->whereIn('brand_id', $brandIds)
            ->orderBy('id')
            ->pluck('id')
            ->map(fn (mixed $id): string => (string) $id)
            ->values()
            ->all();

        return new DashboardActor(
            id: $clientId,
            actorType: DashboardActorTypeEnum::Owner,
            role: 'brand_owner',
            branchId: null,
            brandId: $brandIds[0],
            brandIds: $brandIds,
            branchIds: $branchIds,
        );
    }

    public function forClientId(string $clientId): ?DashboardActor
    {
        $client = ClientModel::query()->find($clientId);

        return $client instanceof ClientModel ? $this->forClient($client) : null;
    }
}
