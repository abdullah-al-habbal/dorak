<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Models\BarberPortfolioPhotoModel;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\DeviceTokenUserTypeEnum;
use Modules\Core\Models\DeviceTokenModel;

const BARBER_ACCOUNT_URL = '/api/v1/barber/account';

function deletableBarber(array $overrides = []): BarberModel
{
    return BarberModel::factory()->create(array_merge([
        'password' => Hash::make('password123'),
        'email' => 'sam@example.com',
        'phone' => '+963911222444',
        'status' => BarberStatusEnum::Enabled,
    ], $overrides));
}

function deleteBarberAs(BarberModel $barber, string $password = 'password123'): TestResponse
{
    $token = $barber->createToken('stylist-app')->plainTextToken;

    return test()->withToken($token)->deleteJson(BARBER_ACCOUNT_URL, ['password' => $password]);
}

describe('DELETE /api/v1/barber/account guards', function (): void {
    it('rejects an anonymous caller', function (): void {
        $this->deleteJson(BARBER_ACCOUNT_URL, ['password' => 'password123'])->assertUnauthorized();
    });

    it('requires the password', function (): void {
        $barber = deletableBarber();
        $this->withToken($barber->createToken('app')->plainTextToken)->deleteJson(BARBER_ACCOUNT_URL, [])->assertUnprocessable()->assertJsonValidationErrors('password');
    });

    it('refuses a wrong password and changes nothing', function (): void {
        $barber = deletableBarber();

        deleteBarberAs($barber, 'wrong-password')->assertUnauthorized();

        expect($barber->fresh()->email)->toBe('sam@example.com')->and($barber->fresh()->status)->toBe(BarberStatusEnum::Enabled);
    });

    it('does not let a client or branch token reach it', function (): void {
        $client = ClientModel::factory()->create();
        $token = $client->createToken('client-app')->plainTextToken;

        $this->withToken($token)->deleteJson(BARBER_ACCOUNT_URL, ['password' => 'password123'])->assertUnauthorized();
    });
});

describe('DELETE /api/v1/barber/account blocking', function (): void {
    it('returns 409 and leaves the account untouched while a booking is :dataset', function (BookingStatus $status): void {
        $barber = deletableBarber();
        BookingModel::factory()->create(['barber_id' => $barber->id, 'booking_status' => $status]);

        deleteBarberAs($barber)->assertStatus(409)->assertJsonPath('code', 'ACCOUNT_HAS_ACTIVE_BOOKINGS');

        expect($barber->fresh()->email)->toBe('sam@example.com')->and($barber->fresh()->tokens()->count())->toBe(1);
    })->with([
        'pending' => [BookingStatus::Pending],
        'confirmed' => [BookingStatus::Confirmed],
        'in_progress' => [BookingStatus::InProgress],
    ]);

    it('returns 409 while the barber works for a brand or branch', function (): void {
        $barber = deletableBarber();
        BarberAffiliationModel::factory()->create(['barber_id' => $barber->id]);

        deleteBarberAs($barber)->assertStatus(409)->assertJsonPath('code', 'ACCOUNT_HAS_ACTIVE_AFFILIATION');

        expect($barber->fresh()->email)->toBe('sam@example.com');
    });
});

describe('DELETE /api/v1/barber/account when allowed', function (): void {
    it('scrubs personal data, files, tokens and links but keeps the row for bookings and reviews', function (): void {
        Storage::fake('public');
        $barber = deletableBarber(['bio' => ['en' => 'Fades', 'ar' => 'حلاقة'], 'latitude' => 33.5, 'longitude' => 36.3, 'is_workstation_online' => true, 'client_id' => fake()->uuid()]);
        Storage::disk('public')->put('portfolio/a.jpg', 'x');
        BarberPortfolioPhotoModel::factory()->create(['barber_id' => $barber->id, 'image_path' => 'portfolio/a.jpg']);
        BarberScheduleModel::query()->create(['barber_id' => $barber->id, 'day_of_week' => 1, 'start_time' => '09:00', 'end_time' => '17:00', 'is_active' => true]);
        $chair = ChairModel::factory()->create(['barber_id' => $barber->id]);
        $done = BookingModel::factory()->create(['barber_id' => $barber->id, 'booking_status' => BookingStatus::Completed]);
        $invitation = BarberAffiliationModel::factory()->pending()->create(['barber_id' => $barber->id]);
        $ended = BarberAffiliationModel::factory()->terminated()->create(['barber_id' => $barber->id]);
        DeviceTokenModel::query()->create(['user_id' => $barber->id, 'user_type' => DeviceTokenUserTypeEnum::from($barber->getMorphClass()), 'token' => 'fcm-token', 'platform_type' => 'android', 'last_used_at' => now()]);
        $barber->createToken('second-device');

        deleteBarberAs($barber)->assertOk();

        $fresh = $barber->fresh();
        expect($fresh)->not->toBeNull()
            ->and($fresh->getTranslation('name', 'en'))->toBe('Deleted stylist')
            ->and($fresh->getTranslation('name', 'ar'))->toBe('حلاق محذوف')
            ->and($fresh->email)->toBeNull()
            ->and($fresh->phone)->toBeNull()
            ->and(DB::table('barbers')->where('id', $barber->id)->value('bio'))->toBeNull()
            ->and($fresh->client_id)->toBeNull()
            ->and($fresh->latitude)->toBeNull()
            ->and($fresh->is_workstation_online)->toBeFalse()
            ->and($fresh->has_login)->toBeFalse()
            ->and($fresh->status)->toBe(BarberStatusEnum::Disabled)
            ->and($fresh->tokens()->count())->toBe(0)
            ->and(Hash::check('password123', (string) $fresh->password))->toBeFalse()
            ->and(BarberPortfolioPhotoModel::query()->where('barber_id', $barber->id)->count())->toBe(0)
            ->and(BarberScheduleModel::query()->where('barber_id', $barber->id)->count())->toBe(0)
            ->and(DeviceTokenModel::query()->where('user_id', $barber->id)->count())->toBe(0)
            ->and($chair->fresh()->barber_id)->toBeNull()
            ->and($done->fresh()->barber_id)->toBe($barber->id)
            ->and($invitation->fresh()->status)->toBe(AffiliationStatus::Rejected)
            ->and($ended->fresh()->status)->toBe(AffiliationStatus::Terminated);
        Storage::disk('public')->assertMissing('portfolio/a.jpg');
    });

    it('lets a pending, rejected or disabled barber delete too, and the old token stops working', function (BarberStatusEnum $status): void {
        $barber = deletableBarber(['status' => $status]);
        $token = $barber->createToken('stylist-app')->plainTextToken;

        $this->withToken($token)->deleteJson(BARBER_ACCOUNT_URL, ['password' => 'password123'])->assertOk();

        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/v1/barber/profile')->assertUnauthorized();
    })->with([
        'pending' => [BarberStatusEnum::Pending],
        'rejected' => [BarberStatusEnum::Rejected],
        'disabled' => [BarberStatusEnum::Disabled],
    ]);

    it('frees the email and phone so the person can register again', function (): void {
        $barber = deletableBarber();
        deleteBarberAs($barber)->assertOk();

        expect(BarberModel::query()->where('email', 'sam@example.com')->exists())->toBeFalse();
        BarberModel::factory()->create(['email' => 'sam@example.com', 'phone' => '+963911222444']);
    });

    it('cannot sign in afterwards and is hidden from discovery', function (): void {
        $barber = deletableBarber();
        deleteBarberAs($barber)->assertOk();

        $this->postJson('/api/v1/barber/login', ['email' => 'sam@example.com', 'password' => 'password123'])->assertStatus(401);
        expect(BarberModel::query()->discoverable()->whereKey($barber->id)->exists())->toBeFalse();
    });
});
