<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;

it('passes no default to env() in any module config file', function (): void {
    $offenders = collect(File::glob(base_path('modules/*/Config/*.php')))
        ->filter(fn (string $path): bool => preg_match('/\benv\(\s*([\'"])[A-Za-z0-9_]+\1\s*,\s*(?!\))/', File::get($path)) === 1)
        ->map(fn (string $path): string => str_replace(base_path().'/', '', $path))
        ->values()
        ->all();

    expect($offenders)->toBe([]);
});

it('keeps the null broadcast connection that the test environment asks for', function (): void {
    expect(config('broadcasting.default'))->toBe('null');
});
