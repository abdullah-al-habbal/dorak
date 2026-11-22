<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Enums;

enum FormalityEnum: string
{
    case Casual = 'casual';
    case Formal = 'formal';
    case Both = 'both';

    public function label(): string
    {
        return __('servicecatalog::enums.formality.'.$this->value);
    }
}
