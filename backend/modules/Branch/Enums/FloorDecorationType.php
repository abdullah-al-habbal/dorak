<?php

declare(strict_types=1);

namespace Modules\Branch\Enums;

enum FloorDecorationType: string
{
    case WaitingArea = 'waiting_area';
    case Mirror = 'mirror';
    case Reception = 'reception';
    case Entrance = 'entrance';
    case Restroom = 'restroom';
    case Plant = 'plant';
    case Storage = 'storage';
}
