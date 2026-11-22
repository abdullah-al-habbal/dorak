<?php

declare(strict_types=1);

namespace Modules\Review\Enums;

enum ReviewStatus: string
{
    case Published = 'published';
    case Disputed = 'disputed';
    case Resolved = 'resolved';
    case Hidden = 'hidden';

    /**
     * Statuses an admin may set when deciding a disputed review.
     *
     * @return list<self>
     */
    public static function resolutionOutcomes(): array
    {
        return [self::Published, self::Hidden];
    }

    public function label(): string
    {
        return __('review::enums.review_status.'.$this->value);
    }
}
