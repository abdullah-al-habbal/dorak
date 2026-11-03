<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Core\Enums\TokenAbility;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

/** Mobile-scoped routes (Gap G10/G11): dashboard Actions behind branch-app / barber-app tokens. */
function mobileServicePayload(string $brandId, CurrencyModel $currency, array $overrides = []): array
{
    return array_replace([
        'serviceable_id' => $brandId,
        'serviceable_type' => ServiceableTypeEnum::Brand,
        'catalog_item_id' => null,
        'currency_code' => $currency->code,
        'name' => ['en' => 'Haircut', 'ar' => 'قص شعر'],
        'price_amount_minor' => 2500,
        'duration_minutes' => 30,
        'is_active' => true,
    ], $overrides);
}

describe('branch mobile routes', function (): void {
    beforeEach(function (): void {
        $this->branch = BranchModel::factory()->create();
        $this->other = BranchModel::factory()->create();
        $this->token = $this->branch->createToken('branch-app', TokenAbility::forBranchApp())->plainTextToken;
    });

    it('lists only the brand services with a branch-app token', function (): void {
        OfferedServiceModel::factory()->create(['serviceable_id' => $this->branch->brand_id]);
        OfferedServiceModel::factory()->create(['serviceable_id' => $this->other->brand_id]);

        $this->withToken($this->token)->getJson('/api/v1/branch/services')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('creates updates and deletes a brand service', function (): void {
        $currency = CurrencyModel::factory()->create();

        $id = $this->withToken($this->token)
            ->postJson('/api/v1/branch/services', mobileServicePayload($this->branch->brand_id, $currency))
            ->assertCreated()->json('data.id');
        $this->withToken($this->token)
            ->putJson("/api/v1/branch/services/{$id}", mobileServicePayload($this->branch->brand_id, $currency, ['price_amount_minor' => 3100]))
            ->assertOk()->assertJsonPath('data.price_amount_minor', 3100);
        $this->withToken($this->token)->deleteJson("/api/v1/branch/services/{$id}")->assertOk();
    });

    it('rejects creating a service for another brand and hides foreign services', function (): void {
        $currency = CurrencyModel::factory()->create();
        $foreign = OfferedServiceModel::factory()->create(['serviceable_id' => $this->other->brand_id]);

        $this->withToken($this->token)
            ->postJson('/api/v1/branch/services', mobileServicePayload($this->other->brand_id, $currency))
            ->assertForbidden();
        $this->withToken($this->token)->getJson("/api/v1/branch/services/{$foreign->id}")->assertNotFound();
    });

    it('lists the staff of the branch only', function (): void {
        $mine = BarberModel::factory()->create();
        $foreign = BarberModel::factory()->create();
        ChairModel::factory()->create(['branch_id' => $this->branch->id, 'barber_id' => $mine->id]);
        ChairModel::factory()->create(['branch_id' => $this->other->id, 'barber_id' => $foreign->id]);

        $this->withToken($this->token)->getJson('/api/v1/branch/barbers')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $mine->id);
    });

    it('rejects unauthenticated and dashboard-scoped tokens', function (): void {
        $this->getJson('/api/v1/branch/services')->assertUnauthorized();
        $dashboard = $this->branch->createToken('dashboard-session', TokenAbility::forDashboard())->plainTextToken;
        $this->withToken($dashboard)->getJson('/api/v1/branch/services')->assertForbidden();
    });

    it('serves earnings with the branch scope', function (): void {
        $this->withToken($this->token)->getJson('/api/v1/branch/earnings')
            ->assertOk()
            ->assertJsonPath('data.scope', 'branch');
    });
});

describe('barber mobile routes', function (): void {
    beforeEach(function (): void {
        $this->barber = BarberModel::factory()->create();
        $this->token = $this->barber->createToken('barber-app', TokenAbility::forBarberApp())->plainTextToken;
    });

    it('serves personal earnings with the barber scope', function (): void {
        $this->withToken($this->token)->getJson('/api/v1/barber/earnings')
            ->assertOk()
            ->assertJsonPath('data.scope', 'barber');
    });

    it('rejects earnings without a barber token', function (): void {
        $this->getJson('/api/v1/barber/earnings')->assertUnauthorized();
    });

    it('lists only the own appointment history, newest first, with filters', function (): void {
        $mine = BookingModel::factory()->create(['barber_id' => $this->barber->id, 'booking_status' => BookingStatus::Completed, 'starts_at' => now()->subDays(3)]);
        $newer = BookingModel::factory()->create(['barber_id' => $this->barber->id, 'booking_status' => BookingStatus::Cancelled, 'starts_at' => now()->subDay()]);
        BookingModel::factory()->create(['barber_id' => BarberModel::factory()->create()->id, 'booking_status' => BookingStatus::Completed]);

        $this->withToken($this->token)->getJson('/api/v1/barber/appointments')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $newer->id);
        $this->withToken($this->token)->getJson('/api/v1/barber/appointments?status=completed')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $mine->id);
    });

    it('validates the appointment filters', function (): void {
        $this->withToken($this->token)->getJson('/api/v1/barber/appointments?status=bogus&per_page=500')
            ->assertUnprocessable();
    });

    it('rejects unauthenticated appointment history', function (): void {
        $this->getJson('/api/v1/barber/appointments')->assertUnauthorized();
    });
});
