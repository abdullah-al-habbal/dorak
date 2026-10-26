<?php

declare(strict_types=1);

namespace Modules\ClientInteraction\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Eloquent\Relations\Relation;

final readonly class FavorableExists implements ValidationRule
{
    public function __construct(private ?string $favorableType) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($this->favorableType === null) {
            return;
        }

        $modelClass = Relation::getMorphedModel($this->favorableType);
        if ($modelClass === null || ! class_exists($modelClass)) {
            return;
        }

        if (! $modelClass::query()->whereKey($value)->exists()) {
            $fail(__('clientinteraction::messages.favorable_not_found'));
        }
    }
}
