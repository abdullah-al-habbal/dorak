<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;

beforeEach(fn () => config(['app.debug' => false]));

it('renders the branded not found page in each language', function (string $language, string $title, string $dir) {
    $this->withHeader('Accept-Language', $language)->get('/__missing-page')
        ->assertNotFound()
        ->assertSee($title)
        ->assertSee("lang=\"{$language}\" dir=\"{$dir}\"", false);
})->with([
    'english' => ['en', 'Page not found', 'ltr'],
    'arabic' => ['ar', 'الصفحة غير موجودة', 'rtl'],
]);

it('renders the branded server error and maintenance pages in each language', function (int $status, string $language, string $title) {
    Route::get("/__web-{$status}", fn () => $status === 503
        ? throw new ServiceUnavailableHttpException
        : throw new RuntimeException('boom'));

    $this->withHeader('Accept-Language', $language)->get("/__web-{$status}")
        ->assertStatus($status)
        ->assertSee($title)
        ->assertDontSee('boom');
})->with([
    '500 en' => [500, 'en', 'Something went wrong'],
    '500 ar' => [500, 'ar', 'حدث خطأ ما'],
    '503 en' => [503, 'en', 'Back soon'],
    '503 ar' => [503, 'ar', 'نعود قريبًا'],
]);
