<?php

declare(strict_types=1);

use Modules\Admin\Exceptions\AdminUserGuardException;
use Modules\Ban\Exceptions\AccountBanException;
use Modules\Barber\Exceptions\BarberActivationException;
use Modules\Barber\Exceptions\BarberReviewException;
use Modules\Branch\Exceptions\BranchLifecycleException;
use Modules\Branch\Exceptions\BranchNotOperationalException;
use Modules\Branch\Exceptions\BranchReadOnlyException;
use Modules\Brand\Exceptions\BrandNotApprovedException;
use Modules\Brand\Exceptions\BrandReviewException;
use Modules\Brand\Exceptions\BrandSuspendedException;
use Modules\Brand\Exceptions\FeatureNotEnabledException;
use Modules\Core\Exceptions\ApiErrorException;
use Modules\Core\Exceptions\ConflictApiException;
use Modules\Core\Exceptions\ForbiddenApiException;

const API_RESPONSE_ALLOWED_FILES = [
    'modules/Core/Helpers/ApiResponseTrait.php',
    'modules/Core/Services/ApiExceptionResponseHandler.php',
];

const API_RESPONSE_SCANNED_DIRECTORIES = ['modules', 'app', 'bootstrap', 'routes'];

function sourceCallsDirectJsonResponse(string $source): bool
{
    $code = '';
    foreach (PhpToken::tokenize($source) as $token) {
        if ($token->is([T_COMMENT, T_DOC_COMMENT, T_CONSTANT_ENCAPSED_STRING])) {
            continue;
        }
        $code .= $token->text;
    }

    return preg_match('/\bresponse\s*\(\s*\)\s*->\s*json\s*\(/', $code) === 1;
}

/** @return list<string> repo-relative paths (from the backend root) of files that build a JSON response by hand */
function directJsonResponseOffenders(): array
{
    $root = base_path();
    $offenders = [];
    foreach (API_RESPONSE_SCANNED_DIRECTORIES as $directory) {
        if (! is_dir("{$root}/{$directory}")) {
            continue;
        }
        $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator("{$root}/{$directory}", FilesystemIterator::SKIP_DOTS));
        foreach ($files as $file) {
            if ($file->getExtension() !== 'php') {
                continue;
            }
            $relative = ltrim(str_replace($root, '', $file->getPathname()), '/');
            if (in_array($relative, API_RESPONSE_ALLOWED_FILES, true)) {
                continue;
            }
            if (sourceCallsDirectJsonResponse((string) file_get_contents($file->getPathname()))) {
                $offenders[] = $relative;
            }
        }
    }
    sort($offenders);

    return $offenders;
}

it('builds no JSON response by hand outside the response trait and the exception handler', function (): void {
    expect(directJsonResponseOffenders())->toBe([]);
});

it('keeps the allow-list honest: both allowed files exist and really use the helper', function (): void {
    foreach (API_RESPONSE_ALLOWED_FILES as $relative) {
        expect(sourceCallsDirectJsonResponse((string) file_get_contents(base_path($relative))))->toBeTrue($relative);
    }
});

it('detects the banned call and ignores mentions in comments and strings', function (): void {
    expect(sourceCallsDirectJsonResponse('<?php return response()->json([]);'))->toBeTrue()
        ->and(sourceCallsDirectJsonResponse("<?php return response()\n    ->json(['a' => 1]);"))->toBeTrue()
        ->and(sourceCallsDirectJsonResponse('<?php // response()->json( is banned'))->toBeFalse()
        ->and(sourceCallsDirectJsonResponse("<?php /** response()->json( */ \$a = 'response()->json(';"))->toBeFalse();
});

/** @return array<class-string, class-string> the 11 domain exceptions and the base each must extend */
function domainApiExceptions(): array
{
    $conflict = ConflictApiException::class;
    $forbidden = ForbiddenApiException::class;

    return [
        AdminUserGuardException::class => $conflict,
        BranchLifecycleException::class => $conflict,
        BrandReviewException::class => $conflict,
        AccountBanException::class => $conflict,
        BarberActivationException::class => $conflict,
        BarberReviewException::class => $conflict,
        BrandSuspendedException::class => $forbidden,
        BrandNotApprovedException::class => $forbidden,
        BranchReadOnlyException::class => $forbidden,
        BranchNotOperationalException::class => $forbidden,
        FeatureNotEnabledException::class => $forbidden,
    ];
}

it('renders every domain API exception through the shared 409 and 403 base classes', function (): void {
    foreach (domainApiExceptions() as $class => $base) {
        expect(is_subclass_of($class, $base))->toBeTrue($class)
            ->and(is_subclass_of($class, ApiErrorException::class))->toBeTrue($class);
    }
});

it('declares no render method of its own in a module exception', function (): void {
    $own = [];
    foreach (glob(base_path('modules/*/Exceptions/*.php')) ?: [] as $file) {
        if (str_ends_with($file, 'Core/Exceptions/ApiErrorException.php')) {
            continue;
        }
        if (str_contains((string) file_get_contents($file), 'function render(')) {
            $own[] = $file;
        }
    }

    expect($own)->toBe([]);
});
