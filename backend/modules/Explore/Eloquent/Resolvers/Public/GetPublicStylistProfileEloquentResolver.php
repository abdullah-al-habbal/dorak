<?php

declare(strict_types=1);

namespace Modules\Explore\Eloquent\Resolvers\Public;

use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Explore\CQRS\Query\Public\GetPublicProfileQuery;
use Modules\Explore\Http\Resources\Public\PublicStylistProfileResource;

final class GetPublicStylistProfileEloquentResolver
{
    /** A discoverable stylist by slug (404 when missing, disabled or banned), with the bookable services and active workplaces. */
    public function resolve(GetPublicProfileQuery $query): PublicStylistProfileResource
    {
        $stylist = BarberModel::discoverable()
            ->with(['portfolioPhotos' => fn ($photos) => $photos->orderBy('sort_order'), 'services' => fn ($services) => $services->bookable()])
            ->where('slug', $query->slug)
            ->firstOrFail();

        return new PublicStylistProfileResource($stylist, [
            'services' => $stylist->services,
            'workplaces' => $this->workplaces($stylist),
        ]);
    }

    /** @return list<array{type: string, slug: string, name: array<string, string>}> */
    private function workplaces(BarberModel $stylist): array
    {
        $affiliations = BarberAffiliationModel::query()
            ->where('barber_id', $stylist->getKey())
            ->where('status', AffiliationStatus::Active)
            ->get(['affiliable_type', 'affiliable_id']);

        $idsOf = fn (AffiliableType $type): array => $affiliations
            ->filter(fn (BarberAffiliationModel $affiliation): bool => $affiliation->getAttribute('affiliable_type') === $type)
            ->pluck('affiliable_id')
            ->all();

        $branches = BranchModel::discoverable()->whereKey($idsOf(AffiliableType::Branch))->orderBy('slug')->get()
            ->map(fn (BranchModel $branch): array => ['type' => 'branch', 'slug' => (string) $branch->getAttribute('slug'), 'name' => $branch->getTranslations('name')]);
        $brands = BrandModel::active()->whereKey($idsOf(AffiliableType::Brand))->orderBy('slug')->get()
            ->map(fn (BrandModel $brand): array => ['type' => 'brand', 'slug' => (string) $brand->getAttribute('slug'), 'name' => $brand->getTranslations('name')]);

        return $branches->concat($brands)->values()->all();
    }
}
