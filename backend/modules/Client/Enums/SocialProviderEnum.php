<?php

declare(strict_types=1);

namespace Modules\Client\Enums;

enum SocialProviderEnum: string
{
    case Google = 'google';
    case Apple = 'apple';

    public function label(): string
    {
        return $this->value;
    }
}
