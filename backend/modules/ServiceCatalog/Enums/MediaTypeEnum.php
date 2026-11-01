<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Enums;

enum MediaTypeEnum: string
{
    case Image = 'image';
    case Video = 'video';

    public function label(): string
    {
        return $this->value;
    }
}
