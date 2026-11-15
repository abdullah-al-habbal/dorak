<?php

declare(strict_types=1);

namespace Modules\Language\Rules;

use BackedEnum;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Modules\Language\Models\LanguageModel;

/**
 * A language code a user picks must not be switched off by the platform. It rejects new input only:
 * accounts already on an inactive language keep it, and a code with no language row is left to the
 * locale enum rule that runs beside this one.
 */
final class ActiveLanguageRule implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $code = $value instanceof BackedEnum ? $value->value : $value;

        if (! is_string($code)) {
            return;
        }

        $isInactive = LanguageModel::query()->where('code', $code)->where('is_active', false)->exists();

        if ($isInactive) {
            $fail(__('language::messages.language_not_available'));
        }
    }
}
