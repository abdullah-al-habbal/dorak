<?php

declare(strict_types=1);

namespace Modules\Brand\Enums;

/** G2: a brand created by an owner stays `pending` until a platform admin approves it. */
enum BrandStatusEnum: string
{
    case Pending = 'pending';
    case Active = 'active';
    case Rejected = 'rejected';
    case Suspended = 'suspended';

    public function label(): string
    {
        return __('brand::enums.status.'.$this->value);
    }
}
