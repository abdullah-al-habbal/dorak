<?php

declare(strict_types=1);

namespace Modules\Core\Enums;

enum SmsDriverEnum: string
{
    case Log = 'log';
    case GenericHttp = 'generic_http';
}
