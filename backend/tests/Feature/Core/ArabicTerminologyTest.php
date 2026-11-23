<?php

declare(strict_types=1);

/*
 * Terminology standard (docs/architecture/localization-of-machine-keys.md): machine keys stay `barber`, but user-facing
 * Arabic calls that person "المصفف" (English UI: "Stylist"). The trade "الحلاقة" (barbering) stays allowed.
 */
it('never calls the stylist "الحلاق" in the backend Arabic language files', function (): void {
    $files = array_merge(
        glob(base_path('modules/*/Lang/ar/*.php')) ?: [],
        glob(base_path('lang/ar/*.php')) ?: [],
    );

    $offenders = [];

    foreach ($files as $file) {
        if (preg_match('/حلاق(?!ة)/u', (string) file_get_contents($file)) === 1) {
            $offenders[] = str_replace(base_path().'/', '', $file);
        }
    }

    expect($files)->not->toBeEmpty()
        ->and($offenders)->toBe([]);
});
