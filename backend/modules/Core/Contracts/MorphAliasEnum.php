<?php

declare(strict_types=1);

namespace Modules\Core\Contracts;

use Illuminate\Database\Eloquent\Model;

/**
 * A backed enum whose cases are polymorphic-type aliases.
 *
 * Every case maps to exactly one Eloquent model. The application registers
 * these mappings into the global morph map, so persisted `*_type` columns
 * always hold the stable alias and never a fully-qualified class name.
 */
interface MorphAliasEnum
{
    /** @return class-string<Model> */
    public function modelClass(): string;
}
