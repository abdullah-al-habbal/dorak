<?php

declare(strict_types=1);

use Modules\Branch\Models\BranchModel;

dataset('monetization routes', [
    'plans list' => ['GET', 'subscription-plans'],
    'plans store' => ['POST', 'subscription-plans'],
    'plans show' => ['GET', 'subscription-plans/00000000-0000-0000-0000-000000000000'],
    'plans update' => ['PUT', 'subscription-plans/00000000-0000-0000-0000-000000000000'],
    'plans delete' => ['DELETE', 'subscription-plans/00000000-0000-0000-0000-000000000000'],
    'feature keys' => ['GET', 'plan-feature-keys'],
    'subscriptions list' => ['GET', 'subscriptions'],
    'subscriptions assign' => ['POST', 'subscriptions'],
    'subscriptions status' => ['PATCH', 'subscriptions/00000000-0000-0000-0000-000000000000/status'],
    'gateways list' => ['GET', 'payment-gateways'],
    'gateways store' => ['POST', 'payment-gateways'],
    'gateways update' => ['PUT', 'payment-gateways/00000000-0000-0000-0000-000000000000'],
    'gateways active' => ['PATCH', 'payment-gateways/00000000-0000-0000-0000-000000000000/active'],
    'gateways delete' => ['DELETE', 'payment-gateways/00000000-0000-0000-0000-000000000000'],
    'rules list' => ['GET', 'commission-rules'],
    'rules store' => ['POST', 'commission-rules'],
    'rules update' => ['PUT', 'commission-rules/00000000-0000-0000-0000-000000000000'],
    'rules delete' => ['DELETE', 'commission-rules/00000000-0000-0000-0000-000000000000'],
    'entries list' => ['GET', 'commission-entries'],
    'payouts list' => ['GET', 'payouts'],
    'payouts generate' => ['POST', 'payouts/generate'],
    'payouts show' => ['GET', 'payouts/00000000-0000-0000-0000-000000000000'],
    'payouts approve' => ['PATCH', 'payouts/00000000-0000-0000-0000-000000000000/approve'],
    'payouts paid' => ['PATCH', 'payouts/00000000-0000-0000-0000-000000000000/mark-paid'],
    'payouts cancel' => ['PATCH', 'payouts/00000000-0000-0000-0000-000000000000/cancel'],
    'analytics' => ['GET', 'analytics/overview'],
]);

describe('Monetization admin routes', function (): void {
    it('rejects anonymous callers on :dataset', function (string $method, string $uri): void {
        $this->json($method, "/api/v1/dashboard/admin/{$uri}")->assertUnauthorized();
    })->with('monetization routes');

    it('rejects a non-admin dashboard actor on :dataset', function (string $method, string $uri): void {
        $this->authenticateDashboardActor(BranchModel::factory()->create());

        $this->json($method, "/api/v1/dashboard/admin/{$uri}")->assertForbidden();
    })->with('monetization routes');
});
