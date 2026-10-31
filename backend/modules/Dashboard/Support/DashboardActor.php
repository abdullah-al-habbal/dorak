<?php

declare(strict_types=1);

namespace Modules\Dashboard\Support;

use Modules\Dashboard\Constants\DashboardActorConstants;

final readonly class DashboardActor
{
    /**
     * @param  list<string>  $brandIds  brands a brand owner owns
     * @param  list<string>  $branchIds  branches of those brands (brand owners only)
     */
    public function __construct(
        public string $id,
        public string $actorType,
        public string $role,
        public ?string $branchId = null,
        public ?string $brandId = null,
        public array $brandIds = [],
        public array $branchIds = [],
    ) {}

    public function isPlatformAdmin(): bool
    {
        return $this->actorType === DashboardActorConstants::DASHBOARD_ACTOR_ADMIN;
    }

    public function isBarber(): bool
    {
        return $this->actorType === DashboardActorConstants::DASHBOARD_ACTOR_BARBER;
    }

    public function isBranchManager(): bool
    {
        return $this->actorType === DashboardActorConstants::DASHBOARD_ACTOR_BRANCH;
    }

    public function isBrandOwner(): bool
    {
        return $this->actorType === DashboardActorConstants::DASHBOARD_ACTOR_OWNER;
    }

    /**
     * The branches this actor may operate on: null means unrestricted
     * (platform admin), otherwise a list that may be empty.
     *
     * @return list<string>|null
     */
    public function scopedBranchIds(): ?array
    {
        return match ($this->actorType) {
            DashboardActorConstants::DASHBOARD_ACTOR_ADMIN => null,
            DashboardActorConstants::DASHBOARD_ACTOR_BRANCH => $this->branchId === null ? [] : [$this->branchId],
            DashboardActorConstants::DASHBOARD_ACTOR_OWNER => $this->branchIds,
            default => [],
        };
    }

    /**
     * The brands this actor may see: null means unrestricted.
     *
     * @return list<string>|null
     */
    public function scopedBrandIds(): ?array
    {
        return match ($this->actorType) {
            DashboardActorConstants::DASHBOARD_ACTOR_ADMIN => null,
            DashboardActorConstants::DASHBOARD_ACTOR_BRANCH => $this->brandId === null ? [] : [$this->brandId],
            DashboardActorConstants::DASHBOARD_ACTOR_OWNER => $this->brandIds,
            default => [],
        };
    }

    public function canAccessBranch(mixed $branchId): bool
    {
        $scope = $this->scopedBranchIds();

        return $scope === null || ((is_string($branchId) || is_int($branchId)) && in_array((string) $branchId, $scope, true));
    }

    public function canManageBrand(mixed $brandId): bool
    {
        if ($this->isPlatformAdmin()) {
            return true;
        }

        return $this->isBrandOwner() && (is_string($brandId) || is_int($brandId)) && in_array((string) $brandId, $this->brandIds, true);
    }

    /**
     * D1 (Task 54): services are owned by a Brand. A branch manager may
     * manage their own branch's brand services in addition to a brand owner.
     */
    public function canManageBrandServices(mixed $brandId): bool
    {
        if ($this->canManageBrand($brandId)) {
            return true;
        }

        return $this->isBranchManager() && (is_string($brandId) || is_int($brandId)) && $this->brandId === (string) $brandId;
    }
}
