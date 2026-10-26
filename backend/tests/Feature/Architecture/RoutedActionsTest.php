<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;

it('routes every Http Action class to at least one registered route', function (): void {
    $routeFiles = collect(File::directories(base_path('modules')))
        ->flatMap(fn (string $moduleDirectory): array => array_merge(
            File::isDirectory("{$moduleDirectory}/Routes/Api") ? File::allFiles("{$moduleDirectory}/Routes/Api") : [],
            File::isDirectory("{$moduleDirectory}/Routes/Web") ? File::allFiles("{$moduleDirectory}/Routes/Web") : [],
        ));
    $routeFileContents = $routeFiles->map(fn ($file): string => $file->getContents())->implode("\n");

    $unrouted = collect(File::directories(base_path('modules')))
        ->flatMap(function (string $moduleDirectory): array {
            $actionsDirectory = "{$moduleDirectory}/Http/Actions";

            return File::isDirectory($actionsDirectory) ? File::allFiles($actionsDirectory) : [];
        })
        ->filter(fn ($file): bool => str_ends_with($file->getFilename(), 'Action.php'))
        ->reject(fn ($file): bool => str_contains($file->getContents(), 'abstract class'))
        ->map(fn ($file): string => actionClassFromPath($file->getPathname()))
        ->reject(fn (string $fqcn): bool => str_contains($routeFileContents, $fqcn))
        ->values();

    expect($unrouted->all())->toBe([]);
});

function actionClassFromPath(string $path): string
{
    $relative = str($path)->after(base_path('modules').DIRECTORY_SEPARATOR)->beforeLast('.php');

    return 'Modules\\'.str_replace(DIRECTORY_SEPARATOR, '\\', (string) $relative);
}
