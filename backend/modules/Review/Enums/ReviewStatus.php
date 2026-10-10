<?php

declare(strict_types=1);

namespace Modules\Review\Enums;

enum ReviewStatus: string
{
    case Published = 'published';
    case Disputed = 'disputed';
    case Resolved = 'resolved';
    case Hidden = 'hidden';

    public function label(): string
    {
        return $this->value;
    }
}
