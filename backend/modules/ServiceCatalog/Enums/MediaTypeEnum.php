<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Enums;

enum MediaTypeEnum: string
{
    case Image = 'image';
    case Video = 'video';

    public function label(): string
    {
        return __('servicecatalog::enums.media_type.'.$this->value);
    }
}
