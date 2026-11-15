<?php

declare(strict_types=1);

use Modules\Admin\Exceptions\AdminUserGuardException;
use Modules\Ban\Http\Responses\AccountBannedResponse;
use Modules\Brand\Exceptions\BrandSuspendedException;
use Modules\Brand\Exceptions\FeatureNotEnabledException;

const API_ENVELOPE_KEYS = ['success', 'statusCode', 'code', 'message', 'timestamp'];

it('keeps the envelope keys, status and stable code on the account responses', function (): void {
    $banned = AccountBannedResponse::make();

    expect($banned->getStatusCode())->toBe(403)
        ->and(array_keys($banned->getData(true)))->toBe(API_ENVELOPE_KEYS)
        ->and($banned->getData(true)['code'])->toBe('ACCOUNT_BANNED')
        ->and($banned->getData(true)['success'])->toBeFalse()
        ->and($banned->getData(true)['timestamp'])->toMatch('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/');
});

it('renders domain exceptions with the standard keys, their own code and status', function (): void {
    $suspended = (new BrandSuspendedException)->render();
    $conflict = AdminUserGuardException::lastActiveAdmin()->render();
    $feature = (new FeatureNotEnabledException('job_board'))->render();

    expect($suspended->getStatusCode())->toBe(403)
        ->and(array_keys($suspended->getData(true)))->toBe(API_ENVELOPE_KEYS)
        ->and($suspended->getData(true)['code'])->toBe('brand_suspended')
        ->and($conflict->getStatusCode())->toBe(409)
        ->and(array_keys($conflict->getData(true)))->toBe(API_ENVELOPE_KEYS)
        ->and($conflict->getData(true)['code'])->toBe('admin_last_active')
        ->and($feature->getStatusCode())->toBe(403)
        ->and($feature->getData(true)['code'])->toBe('feature_not_enabled')
        ->and($feature->getData(true)['errors'])->toBe(['feature' => ['job_board']]);
});
