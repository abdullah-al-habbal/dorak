<?php

declare(strict_types=1);

namespace Modules\Settings\Enums;

enum SettingGroup: string
{
    case Media = 'media';
    case Auth = 'auth';
    case Booking = 'booking';
    case Search = 'search';
    case FloorPlan = 'floor_plan';
}
