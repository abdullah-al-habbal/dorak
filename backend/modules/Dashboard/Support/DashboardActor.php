<?php

declare(strict_types=1);

namespace Modules\Dashboard\Support;

final readonly class DashboardActor
{
    public const string ADMIN = 'admin';

    public const string BRANCH = 'branch';

    public const string BARBER = 'barber';

    public function __construct(
        public string $id,
        public string $actorType,
        public string $role,
        public ?string $branchId = null,
        public ?string $brandId = null,
    ) {}

    public function isPlatformAdmin(): bool
    {
        return $this->actorType === self::ADMIN;
    }

    public function isBarber(): bool
    {
        return $this->actorType === self::BARBER;
    }

    public function isBranchManager(): bool
    {
        return $this->actorType === self::BRANCH;
    }
}
