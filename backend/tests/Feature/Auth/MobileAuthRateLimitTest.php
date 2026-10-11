<?php

declare(strict_types=1);

it('limits repeated requests to mobile authentication and recovery routes', function (string $path, array $payload): void {
    for ($attempt = 0; $attempt < 5; $attempt++) {
        $response = $this->postJson($path, $payload);
        expect($response->status())->not->toBe(429);
    }

    $this->postJson($path, $payload)->assertTooManyRequests();
})->with([
    'client login' => ['/api/v1/client/login', []],
    'client registration' => ['/api/v1/client/register', []],
    'client social login' => ['/api/v1/client/social/google', []],
    'client password recovery request' => ['/api/v1/client/forgot-password', []],
    'client password reset' => ['/api/v1/client/reset-password', []],
    'barber login' => ['/api/v1/barber/login', []],
    'branch login' => ['/api/v1/branch/login', []],
]);
