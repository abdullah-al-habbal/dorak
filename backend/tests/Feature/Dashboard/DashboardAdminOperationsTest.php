<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Client\Models\ClientModel;
use Modules\Commission\Models\CommissionEntryModel;
use Modules\Marketing\Models\TestimonialModel;
use Modules\Payout\Models\PayoutModel;

beforeEach(function (): void {
    $this->authenticateDashboardActor(AdminModel::factory()->create());
});

describe('Client bans', function (): void {
    it('bans a client with a reason and lifts the ban', function (): void {
        $client = ClientModel::factory()->create();

        $this->postJson("/api/v1/dashboard/admin/clients/{$client->id}/ban", ['reason' => 'Repeated no-shows and abuse'])->assertOk();
        expect($client->fresh()->isBanned())->toBeTrue();

        $this->patchJson("/api/v1/dashboard/admin/clients/{$client->id}/unban")->assertOk();
        expect($client->fresh()->isBanned())->toBeFalse();
    });

    it('requires a reason and rejects a past expiry', function (): void {
        $client = ClientModel::factory()->create();

        $this->postJson("/api/v1/dashboard/admin/clients/{$client->id}/ban", [])->assertUnprocessable();
        $this->postJson("/api/v1/dashboard/admin/clients/{$client->id}/ban", [
            'reason' => 'Repeated no-shows and abuse',
            'expires_at' => now()->subDay()->toIso8601String(),
        ])->assertUnprocessable();
        expect($client->fresh()->isBanned())->toBeFalse();
    });
});

describe('Barber review', function (): void {
    it('rejects a barber only with a reason', function (): void {
        $barber = BarberModel::factory()->create();

        $this->patchJson("/api/v1/dashboard/admin/barbers/{$barber->id}/reject", [])->assertUnprocessable();
    });
});

describe('Website testimonials', function (): void {
    it('creates, updates and deletes a testimonial and validates the rating', function (): void {
        $payload = [
            'author_name' => 'Sara',
            'body' => ['en' => 'Great service', 'ar' => 'خدمة رائعة'],
            'rating' => 5,
        ];

        $id = $this->postJson('/api/v1/dashboard/admin/testimonials', $payload)->assertSuccessful()->json('data.id');
        $this->putJson("/api/v1/dashboard/admin/testimonials/{$id}", [...$payload, 'rating' => 4])->assertOk();
        expect(TestimonialModel::query()->findOrFail($id)->rating)->toBe(4);

        $this->postJson('/api/v1/dashboard/admin/testimonials', [...$payload, 'author_name' => 'Omar', 'rating' => 9])->assertUnprocessable();

        $this->deleteJson("/api/v1/dashboard/admin/testimonials/{$id}")->assertSuccessful();
        expect(TestimonialModel::query()->find($id))->toBeNull();
    });
});

describe('Payout lines', function (): void {
    it('lists only the entries settled by the payout', function (): void {
        $payout = PayoutModel::factory()->create();
        $mine = CommissionEntryModel::factory()->create(['payout_id' => $payout->id]);
        CommissionEntryModel::factory()->create(['payout_id' => null]);

        $this->getJson("/api/v1/dashboard/admin/payouts/{$payout->id}/entries")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $mine->id);
    });

    it('answers 404 for an unknown payout', function (): void {
        $this->getJson('/api/v1/dashboard/admin/payouts/00000000-0000-4000-8000-000000000009/entries')->assertNotFound();
    });
});
