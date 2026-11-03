<?php

declare(strict_types=1);

namespace Modules\Brand\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

/** G2: a brand created by an owner stays `pending` until a platform admin approves it. */
enum BrandStatusEnum: string implements HasColor, HasLabel
{
    case Pending = 'pending';
    case Active = 'active';

    public function label(): string
    {
        return __('brand::enums.status.'.$this->value);
    }

    public function getLabel(): ?string
    {
        return $this->label();
    }

    public function getColor(): string
    {
        return match ($this) {
            self::Pending => 'warning',
            self::Active => 'success',
        };
    }
}
