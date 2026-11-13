<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\ValuesObjects;

use Modules\Audit\Enums\StatusChangeActorTypeEnum;

/** Who is recorded in the status-change log for an affiliation change made on a branch's behalf. */
final readonly class AffiliationActor
{
    public function __construct(
        public StatusChangeActorTypeEnum $type,
        public string $id,
    ) {}

    public static function admin(string $adminId): self
    {
        return new self(StatusChangeActorTypeEnum::Admin, $adminId);
    }
}
