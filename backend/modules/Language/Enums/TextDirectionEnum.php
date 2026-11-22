<?php

declare(strict_types=1);

namespace Modules\Language\Enums;

enum TextDirectionEnum: string
{
    case Ltr = 'ltr';
    case Rtl = 'rtl';

    public function label(): string
    {
        return __('language::enums.text_direction.'.$this->value);
    }
}
