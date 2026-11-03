<?php

declare(strict_types=1);

namespace Modules\Core\Enums;

enum SmsHttpFormatEnum: string
{
    case Json = 'json';
    case Form = 'form';
}
