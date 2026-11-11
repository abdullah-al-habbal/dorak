<?php

declare(strict_types=1);

namespace Modules\Branch\Enums;

enum BranchStatusEnum: string
{
    case Pending = 'pending';
    case Enabled = 'enabled';
    case Disabled = 'disabled';
    case Suspended = 'suspended';

    public function label(): string
    {
        return __('branch::enums.status.'.$this->value);
    }

    public function isEnabled(): bool
    {
        return $this === self::Enabled;
    }
}
