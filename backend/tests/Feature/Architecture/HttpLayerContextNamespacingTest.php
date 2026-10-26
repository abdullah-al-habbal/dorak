<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;

it('keeps every Http Actions/Requests/Resources file out of the layer root per BE-18', function (): void {
    $exemptions = [
        'Core/Http/Actions/BaseApiAction.php',
        'Core/Http/Requests/BaseApiFormRequest.php',
    ];

    $violations = collect(File::directories(base_path('modules')))
        ->flatMap(function (string $moduleDirectory): array {
            $files = [];
            foreach (['Http/Actions', 'Http/Requests', 'Http/Resources'] as $layer) {
                $layerDirectory = "{$moduleDirectory}/{$layer}";
                if (! File::isDirectory($layerDirectory)) {
                    continue;
                }
                foreach (File::files($layerDirectory) as $file) {
                    if ($file->getExtension() === 'php') {
                        $files[] = $file->getPathname();
                    }
                }
            }

            return $files;
        })
        ->map(fn (string $path): string => str($path)->after(base_path('modules').DIRECTORY_SEPARATOR)->toString())
        ->reject(fn (string $relative): bool => in_array($relative, $exemptions, true))
        ->values();

    expect($violations->all())->toBe([]);
});
