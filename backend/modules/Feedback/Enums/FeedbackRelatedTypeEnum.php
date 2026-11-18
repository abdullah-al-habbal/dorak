<?php

declare(strict_types=1);

namespace Modules\Feedback\Enums;

/** The business record a report is about, when the sender picked one. */
enum FeedbackRelatedTypeEnum: string
{
    case Booking = 'booking';
    case Branch = 'branch';
    case Brand = 'brand';
    case Barber = 'barber';
    case Review = 'review';
}
