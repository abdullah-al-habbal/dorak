<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\Currency\Models\ExchangeRateModel;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Models\ReviewModel;

function disputedReview(array $overrides = []): ReviewModel
{
    return ReviewModel::factory()->create([
        'status' => ReviewStatus::Disputed,
        'dispute_reason' => 'Wrong appointment.',
        'disputed_at' => now(),
        ...$overrides,
    ]);
}

describe('Admin review listing', function (): void {
    it('lists only disputed reviews for an admin token', function (): void {
        $disputed = disputedReview();
        ReviewModel::factory()->create(['status' => ReviewStatus::Published]);
        $this->actingAs(AdminModel::factory()->create(), 'admin_api');

        $this->getJson('/api/v1/admin/reviews?status=disputed')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $disputed->id)
            ->assertJsonPath('data.0.dispute_reason', 'Wrong appointment.');
    });

    it('defaults to the disputed queue and honours other statuses', function (): void {
        disputedReview();
        ReviewModel::factory()->create(['status' => ReviewStatus::Hidden]);
        $this->actingAs(AdminModel::factory()->create(), 'admin_api');

        $this->getJson('/api/v1/admin/reviews')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/admin/reviews?status=hidden')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/admin/reviews?status=bogus')->assertUnprocessable();
    });

    it('rejects anonymous and non-admin callers', function (): void {
        $this->getJson('/api/v1/admin/reviews?status=disputed')->assertUnauthorized();

        $this->actingAs(BranchModel::factory()->create(), 'branch_api');
        $this->getJson('/api/v1/admin/reviews?status=disputed')->assertUnauthorized();
    });
});

describe('Dashboard admin moderation', function (): void {
    it('lets an admin list and resolve a dispute with a note', function (): void {
        $admin = AdminModel::factory()->create();
        $review = disputedReview();
        $this->authenticateDashboardActor($admin);

        $this->getJson('/api/v1/dashboard/admin/reviews')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $review->id);

        $this->patchJson("/api/v1/dashboard/admin/reviews/{$review->id}/resolve", ['status' => 'hidden', 'note' => 'Confirmed mismatch.'])
            ->assertOk()
            ->assertJsonPath('data.status', 'hidden')
            ->assertJsonPath('data.resolution_note', 'Confirmed mismatch.');

        $this->getJson('/api/v1/dashboard/admin/reviews')->assertOk()->assertJsonCount(0, 'data');
        expect($review->fresh())
            ->status->toBe(ReviewStatus::Hidden)
            ->resolved_by->toBe($admin->id);
    });

    it('rejects an invalid resolution status', function (): void {
        $review = disputedReview();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson("/api/v1/dashboard/admin/reviews/{$review->id}/resolve", ['status' => 'disputed'])
            ->assertUnprocessable();
        expect($review->fresh()->status)->toBe(ReviewStatus::Disputed);
    });

    it('lists exchange rates with currency codes for an admin', function (): void {
        $from = CurrencyModel::factory()->create(['code' => 'USD']);
        $to = CurrencyModel::factory()->create(['code' => 'SAR']);
        ExchangeRateModel::factory()->create(['from_currency_id' => $from->id, 'to_currency_id' => $to->id, 'rate' => 3.75]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson('/api/v1/dashboard/admin/exchange-rates')
            ->assertOk()
            ->assertJsonPath('data.0.from_currency_code', 'USD')
            ->assertJsonPath('data.0.to_currency_code', 'SAR');
    });

    it('forbids a branch manager from every admin moderation route', function (): void {
        $review = disputedReview();
        $this->authenticateDashboardActor(BranchModel::factory()->create());

        $this->getJson('/api/v1/dashboard/admin/reviews')->assertForbidden();
        $this->patchJson("/api/v1/dashboard/admin/reviews/{$review->id}/resolve", ['status' => 'hidden'])->assertForbidden();
        $this->getJson('/api/v1/dashboard/admin/exchange-rates')->assertForbidden();
        expect($review->fresh()->status)->toBe(ReviewStatus::Disputed);
    });
});
