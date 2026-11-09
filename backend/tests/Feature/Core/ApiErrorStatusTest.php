<?php

declare(strict_types=1);

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

const API_ERROR_CASES = [
    400 => ['BAD_REQUEST', 'Bad request', 'طلب غير صالح'],
    401 => ['UNAUTHORIZED', 'Unauthenticated', 'غير مصرح'],
    403 => ['FORBIDDEN', 'Forbidden', 'محظور'],
    404 => ['RESOURCE_NOT_FOUND', 'Not found', 'غير موجود'],
    405 => ['METHOD_NOT_ALLOWED', 'This action is not allowed for this resource.', 'هذا الإجراء غير مسموح لهذا المورد.'],
    409 => ['CONFLICT', 'The request conflicts with the current resource state.', 'يتعارض الطلب مع الحالة الحالية للمورد.'],
    413 => ['PAYLOAD_TOO_LARGE', 'The request is too large.', 'حجم الطلب كبير جدًا.'],
    422 => ['VALIDATION_FAILED', 'Validation failed', 'فشل التحقق'],
    429 => ['TOO_MANY_REQUESTS', 'Too many requests', 'طلبات كثيرة جدًا'],
    500 => ['SERVER_ERROR', 'Server error', 'خطأ في الخادم'],
    503 => ['SERVICE_UNAVAILABLE', 'Service temporarily unavailable', 'الخدمة غير متاحة مؤقتًا'],
];

function throwStatus(int $status): never
{
    throw match ($status) {
        413 => new PostTooLargeException,
        422 => ValidationException::withMessages(['field' => ['bad']]),
        429 => new TooManyRequestsHttpException(30, 'Too Many Attempts.'),
        500 => new RuntimeException('sensitive implementation detail'),
        default => new HttpException($status, 'framework text'),
    };
}

dataset('api error statuses', array_map(
    fn (int $status): array => [$status, ...API_ERROR_CASES[$status]],
    array_keys(API_ERROR_CASES),
));

it('maps each status to its code, localized message and request id', function (int $status, string $code, string $en, string $ar) {
    // The API takes its locale from the signed-in account's preference, which the middleware applies; the route stands in for it.
    Route::get("/api/v1/__status-{$status}", function () use ($status) {
        App::setLocale((string) request('lang'));
        throwStatus($status);
    });

    foreach (['en' => $en, 'ar' => $ar] as $locale => $message) {
        $uuid = Str::uuid()->toString();
        $response = $this->withHeader('X-Request-ID', $uuid)->getJson("/api/v1/__status-{$status}?lang={$locale}");

        $response->assertStatus($status)
            ->assertHeader('X-Request-ID', $uuid)
            ->assertJsonPath('success', false)
            ->assertJsonPath('statusCode', $status)
            ->assertJsonPath('code', $code)
            ->assertJsonPath('message', $message)
            ->assertJsonPath('request_id', $uuid)
            ->assertJsonMissing(['message' => 'framework text'])
            ->assertJsonMissing(['message' => 'sensitive implementation detail']);
    }
})->with('api error statuses');

it('keeps a deliberate translated message on a 403', function (Throwable $exception, string $message) {
    Route::get('/api/v1/__specific', fn () => throw $exception);

    $this->getJson('/api/v1/__specific')
        ->assertForbidden()
        ->assertJsonPath('code', 'FORBIDDEN')
        ->assertJsonPath('message', $message);
})->with([
    'authorization exception' => [fn () => new AuthorizationException('Only brand owners can do this'), 'Only brand owners can do this'],
    'access denied abort' => [fn () => new AccessDeniedHttpException('Owners only'), 'Owners only'],
]);

it('keeps the translated message of a dashboard authorization failure in arabic', function () {
    $message = __('dashboard::messages.admin_operation_only', [], 'ar');
    expect($message)->not->toBe('dashboard::messages.admin_operation_only');
    Route::get('/api/v1/__ar-specific', fn () => throw new AuthorizationException($message));

    $this->getJson('/api/v1/__ar-specific')
        ->assertForbidden()
        ->assertJsonPath('message', $message);
});

it('keeps a deliberate conflict message', function () {
    Route::get('/api/v1/__conflict', fn () => throw new ConflictHttpException('Slot already taken'));

    $this->getJson('/api/v1/__conflict')->assertStatus(409)->assertJsonPath('message', 'Slot already taken');
});

it('uses the generic text when no specific message was set', function (Throwable $exception) {
    Route::get('/api/v1/__generic', fn () => throw $exception);

    $this->getJson('/api/v1/__generic')->assertForbidden()->assertJsonPath('message', 'Forbidden');
})->with([
    'gate default' => [fn () => new AuthorizationException('This action is unauthorized.')],
    'bare authorization exception' => [fn () => new AuthorizationException],
    'abort without message' => [fn () => new AccessDeniedHttpException],
]);

it('does not trust a framework message on a bad request', function () {
    Route::get('/api/v1/__bad', fn () => throw new BadRequestHttpException('internal parser detail'));

    $this->getJson('/api/v1/__bad')->assertStatus(400)->assertJsonPath('message', 'Bad request');
});
