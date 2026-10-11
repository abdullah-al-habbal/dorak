<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;

it('does not use the session-backed admin guard in API route files', function () {
    foreach (File::directories(base_path('modules')) as $moduleDirectory) {
        $apiRoutesDirectory = "{$moduleDirectory}/Routes/Api";

        if (! File::isDirectory($apiRoutesDirectory)) {
            continue;
        }

        foreach (File::allFiles($apiRoutesDirectory) as $routeFile) {
            expect($routeFile->getContents())
                ->not->toMatch('/auth:admin\\b/');
        }
    }
});
