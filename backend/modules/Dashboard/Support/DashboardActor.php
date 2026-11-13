<?php

declare(strict_types=1);

namespace Modules\Dashboard\Support;

use Illuminate\Contracts\Auth\Access\Authorizable;
use Illuminate\Support\Facades\Gate;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;

final readonly class DashboardActor implements Authorizable
{
    /**
     * @param  list<string>  $brandIds  brands a brand owner owns
     * @param  list<string>  $branchIds  branches of those brands (brand owners only)
     */
    public function __construct(
        public string $id,
        public DashboardActorTypeEnum $actorType,
        public string $role,
        public ?string $branchId = null,
        public ?string $brandId = null,
        public array $brandIds = [],
        public array $branchIds = [],
    ) {}

    /** Lets policies authorize a dashboard actor through the Gate like any other user. */
    public function can($abilities, $arguments = []): bool
    {
        return Gate::forUser($this)->check($abilities, $arguments);
    }

    /** A platform-admin actor for code paths outside the dashboard middleware (for example the legacy `admin_api` routes). */
    public static function platformAdmin(string $adminId): self
    {
        return new self($adminId, DashboardActorTypeEnum::Admin, 'platform_admin', null);
    }

    public function isPlatformAdmin(): bool
    {
        return $this->actorType === DashboardActorTypeEnum::Admin;
    }

    public function isBarber(): bool
    {
        return $this->actorType === DashboardActorTypeEnum::Barber;
    }

    public function isBranchManager(): bool
    {
        return $this->actorType === DashboardActorTypeEnum::Branch;
    }

    public function isBrandOwner(): bool
    {
        return $this->actorType === DashboardActorTypeEnum::Owner;
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
            DashboardActorTypeEnum::Admin => null,
            DashboardActorTypeEnum::Branch => $this->branchId === null ? [] : [$this->branchId],
            DashboardActorTypeEnum::Owner => $this->branchIds,
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
            DashboardActorTypeEnum::Admin => null,
            DashboardActorTypeEnum::Branch => $this->brandId === null ? [] : [$this->brandId],
            DashboardActorTypeEnum::Owner => $this->brandIds,
            default => [],
        };
    }

    /** Barber affiliations and the job board: the platform admin, a branch manager or a brand owner (decided 2026-11-13). */
    public function canManageStaffing(): bool
    {
        return $this->isPlatformAdmin() || $this->isBranchManager() || $this->isBrandOwner();
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
