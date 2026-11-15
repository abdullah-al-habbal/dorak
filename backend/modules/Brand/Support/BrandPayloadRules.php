<?php

declare(strict_types=1);

namespace Modules\Brand\Support;

use Illuminate\Validation\Rule;
use Modules\Core\Enums\VenueUniverse;
use Modules\Currency\Rules\ActiveCurrencyRule;

/** The brand fields every brand-creating request validates the same way, optionally under a key prefix. */
final class BrandPayloadRules
{
    /** @return array<string, mixed> */
    public static function rules(string $prefix = ''): array
    {
        $rules = [
            'name.en' => ['required', 'string', 'max:255'],
            'name.ar' => ['required', 'string', 'max:255'],
            'base_currency_code' => ['required', 'string', new ActiveCurrencyRule],
            'logo_url' => ['nullable', 'url', 'max:2048'],
            'description.en' => ['nullable', 'string', 'max:5000'],
            'description.ar' => ['nullable', 'string', 'max:5000'],
            'universe' => ['sometimes', Rule::enum(VenueUniverse::class)],
            'first_branch' => ['sometimes', 'array'],
            'first_branch.name.en' => ['sometimes', 'string', 'max:120'],
            'first_branch.name.ar' => ['sometimes', 'string', 'max:120'],
            'first_branch.latitude' => ['nullable', 'required_with:first_branch.longitude', 'numeric', 'between:-90,90'],
            'first_branch.longitude' => ['nullable', 'required_with:first_branch.latitude', 'numeric', 'between:-180,180'],
            'first_branch.email' => ['nullable', 'email', 'max:255', Rule::unique('branches', 'email')],
            'first_branch.password' => ['nullable', 'required_with:first_branch.email', 'string', 'min:12', 'max:255'],
        ];

        if ($prefix === '') {
            return $rules;
        }

        $prefixed = [];
        foreach ($rules as $key => $rule) {
            $prefixed[$prefix.'.'.$key] = $rule;
        }

        // `required_with` names sibling fields, so they take the prefix too.
        return array_map(
            static fn (array $rule): array => array_map(
                static fn (mixed $part): mixed => is_string($part) && str_starts_with($part, 'required_with:first_branch.')
                    ? 'required_with:'.$prefix.'.'.substr($part, strlen('required_with:'))
                    : $part,
                $rule,
            ),
            $prefixed,
        );
    }
}
