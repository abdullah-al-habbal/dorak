<?php

declare(strict_types=1);

use Modules\Core\Enums\AccountAccessScope;

it('maps middleware parameters to scopes and falls back to active', function (string $parameter, AccountAccessScope $expected) {
    expect(AccountAccessScope::fromParameter($parameter))->toBe($expected);
})->with([
    'active' => ['active', AccountAccessScope::Active],
    'onboarding' => ['onboarding', AccountAccessScope::Onboarding],
    'approved' => ['approved', AccountAccessScope::Approved],
    'verification' => ['verification', AccountAccessScope::Verification],
    'unknown' => ['everything', AccountAccessScope::Active],
]);
