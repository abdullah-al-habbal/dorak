<?php

declare(strict_types=1);

namespace Modules\Chair\ValuesObjects;

use Modules\Chair\Models\ChairModel;

final readonly class ChairStatusChangeResult
{
    /** @param list<string> $cancelledBookingIds */
    public function __construct(public ChairModel $chair, public array $cancelledBookingIds) {}
}
