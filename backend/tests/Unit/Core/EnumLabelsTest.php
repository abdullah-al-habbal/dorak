<?php

declare(strict_types=1);

use Modules\Core\Enums\Locale;

/**
 * Every backed enum with a label() must translate every case into English and Arabic.
 * label() returns the translation of `<module>::enums.<group>.<case value>`; a missing
 * translation makes Laravel return the key itself, and the old stub returned the raw value.
 *
 * @return array<string, array{class-string<BackedEnum>}>
 */
function labeledEnums(): array
{
    $found = [];
    // Modules whose enums are localized in a later LOC-3 group.
    $pending = ['ServiceCatalog', 'Marketing', 'Preference', 'OfferedService', 'Core', 'Dashboard', 'Client', 'Activation', 'Ban', 'ClientRecommendation', 'Language', 'Payment', 'Subscription'];

    foreach (glob(dirname(__DIR__, 3).'/modules/*/Enums/*.php') ?: [] as $file) {
        $module = basename(dirname($file, 2));
        if (in_array($module, $pending, true)) {
            continue;
        }

        $class = 'Modules\\'.$module.'\\Enums\\'.basename($file, '.php');
        if (enum_exists($class) && is_a($class, BackedEnum::class, true) && method_exists($class, 'label')) {
            $found[$class] = [$class];
        }
    }

    return $found;
}

it('finds the labeled enums', function () {
    expect(labeledEnums())->not->toBeEmpty();
});

it('translates every case of :dataset into english and arabic', function (string $enum) {
    $previous = app()->getLocale();
    $labels = [];

    foreach ([Locale::En, Locale::Ar] as $locale) {
        app()->setLocale($locale->value);

        foreach ($enum::cases() as $case) {
            $label = $case->label();

            expect($label)->not->toBe('', "{$enum}::{$case->name} has an empty {$locale->value} label")
                ->and($label)->not->toBe((string) $case->value, "{$enum}::{$case->name} returns its raw value in {$locale->value}")
                ->and($label)->not->toContain('::enums.', "{$enum}::{$case->name} lacks a {$locale->value} translation");

            $labels[$locale->value][$case->name] = $label;
        }
    }

    app()->setLocale($previous);

    foreach ($labels['en'] as $name => $english) {
        expect($labels['ar'][$name])->not->toBe($english, "{$enum}::{$name} has the same text in both languages");
    }
})->with(fn () => labeledEnums());
