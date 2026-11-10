<?php

declare(strict_types=1);

namespace Modules\Core\Enums;

enum NotificationTypeEnum: string
{
    case BookingUpdate = 'booking_update';
    case Invite = 'invite';
    case Application = 'application';
    case ReviewRequest = 'review_request';
    case PlatformEvent = 'platform_event';
}
