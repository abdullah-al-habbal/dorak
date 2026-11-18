<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Owner;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\TokenAbility;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Repositories\DashboardOwnerActorResolver;

/**
 * `GET /owner/me`: tells the business app which experience to open. Any active client
 * may ask; `is_owner` is false for one with no brand (the app then offers the web
 * registration), and `brands` carries each brand's approval state for the banners.
 */
final class OwnerMobileMeAction extends BaseApiAction
{
    public function __construct(
        private readonly DashboardOwnerActorResolver $ownerActors,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $client = $request->user('client');
        abort_unless($client instanceof ClientModel && $client->tokenCan(TokenAbility::ClientActive->value), 401);

        $actor = $this->ownerActors->forClient($client);
        $brands = $actor === null ? collect() : BrandModel::query()->whereIn('id', $actor->brandIds)->orderBy('id')->get(['id', 'name', 'status']);

        return $this->success(data: [
            'is_owner' => $actor !== null,
            'brand_ids' => $actor?->brandIds ?? [],
            'branch_count' => count($actor?->branchIds ?? []),
            'brands' => $brands->map(fn (BrandModel $brand): array => [
                'id' => (string) $brand->getKey(),
                'name' => $brand->getTranslations('name'),
                'status' => $brand->status->value,
            ])->values()->all(),
        ]);
    }
}
