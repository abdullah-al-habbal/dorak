<?php

declare(strict_types=1);

namespace Modules\Audit\Enums;

enum StatusChangeActorTypeEnum: string
{
    case Client = 'client';
    case Barber = 'barber';
    case Branch = 'branch';
    case Admin = 'admin';
    case Owner = 'owner';
    case System = 'system';
}
