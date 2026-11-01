<?php

declare(strict_types=1);

namespace Modules\Language\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

enum TextDirectionEnum: string implements HasColor, HasLabel
{
    case Ltr = 'ltr';
    case Rtl = 'rtl';

    public function label(): string
    {
        return $this->value;
    }

    public function getLabel(): ?string
    {
        return match ($this) {
            self::Ltr => 'Left to Right',
            self::Rtl => 'Right to Left',
        };
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Ltr => 'gray',
            self::Rtl => 'info',
        };
    }
}
