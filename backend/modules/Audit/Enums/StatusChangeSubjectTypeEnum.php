<?php

declare(strict_types=1);

namespace Modules\Audit\Enums;

enum StatusChangeSubjectTypeEnum: string
{
    case Booking = 'booking';
    case Affiliation = 'affiliation';
}
