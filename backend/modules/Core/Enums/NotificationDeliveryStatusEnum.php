<?php

declare(strict_types=1);

namespace Modules\Core\Enums;

enum NotificationDeliveryStatusEnum: string
{
    case Sent = 'sent';
    case Failed = 'failed';
}
