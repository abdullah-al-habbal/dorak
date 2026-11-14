<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;

const MISSING_RECORD_ID = '00000000-0000-4000-8000-0000000000aa';

/**
 * An admin acting on an id that does not exist gets 404, never a 500 or a silent success. Each payload is valid on its
 * own, so the 404 comes from the missing record and not from validation.
 *
 * @return list<array{0: string, 1: string, 2: array<string, mixed>}>
 */
function missingRecordRoutes(): array
{
    return [
        ['PATCH', 'catalog-categories/{id}/active', ['is_active' => true]],
        ['PATCH', 'currencies/{id}/active', ['is_active' => true]],
        ['PATCH', 'languages/{id}/active', ['is_active' => true]],
        ['PUT', 'catalog-tags/{id}', ['name' => ['en' => 'Tag', 'ar' => 'وسم']]],
        ['DELETE', 'catalog-tags/{id}', []],
        ['PUT', 'payment-gateways/{id}', ['code' => 'missing_gateway', 'name' => ['en' => 'Gateway', 'ar' => 'بوابة'], 'driver' => 'offline', 'is_active' => true]],
        ['PATCH', 'payment-gateways/{id}/active', ['is_active' => true]],
        ['DELETE', 'payment-gateways/{id}', []],
        ['PATCH', 'payouts/{id}/cancel', []],
        ['PATCH', 'payouts/{id}/mark-paid', ['transfer_reference' => 'TRX-1']],
        ['PUT', 'commission-rules/{id}', ['scope' => 'global', 'type' => 'percent', 'value_bps' => 1000, 'is_active' => true]],
        ['DELETE', 'commission-rules/{id}', []],
    ];
}

it('answers 404 when the record does not exist', function (): void {
    $this->authenticateDashboardActor(AdminModel::factory()->create());

    $wrong = [];
    foreach (missingRecordRoutes() as [$method, $path, $payload]) {
        $url = '/api/v1/dashboard/admin/'.str_replace('{id}', MISSING_RECORD_ID, $path);
        $status = $this->json($method, $url, $payload)->getStatusCode();
        if ($status !== 404) {
            $wrong[] = "{$method} {$path} answered {$status}";
        }
    }

    expect($wrong)->toBe([]);
});
