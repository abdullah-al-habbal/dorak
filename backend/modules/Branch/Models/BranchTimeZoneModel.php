<?php

declare(strict_types=1);

namespace Modules\Branch\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['branch_id', 'time_zone'])]
#[Table('branch_time_zones')]
final class BranchTimeZoneModel extends Model
{
    use HasUuids;
}
