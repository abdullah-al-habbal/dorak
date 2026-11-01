<?php

declare(strict_types=1);

namespace Modules\Core\Enums;

enum DevicePlatformEnum: string
{
    case Android = 'android';
    case Ios = 'ios';
    case Web = 'web';

    public function label(): string
    {
        return $this->value;
    }
}
