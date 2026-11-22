<?php

declare(strict_types=1);

namespace Modules\Client\Enums;

enum ClientStatusEnum: string
{
    case Pending = 'pending';
    case Enabled = 'enabled';
    case Disabled = 'disabled';

    public function label(): string
    {
        return __('client::enums.client_status.'.$this->value);
    }

    public function isEnabled(): bool
    {
        return $this === self::Enabled;
    }
}
