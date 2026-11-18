<?php

declare(strict_types=1);

namespace Modules\Feedback\Enums;

/** The kind of signed-in account that sent a report; guests have none. */
enum FeedbackUserTypeEnum: string
{
    case Client = 'client';
    case Barber = 'barber';
    case Branch = 'branch';
}
