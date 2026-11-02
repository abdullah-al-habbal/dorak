<?php

declare(strict_types=1);

use Filament\Facades\Filament;
use Filament\Tables\Actions\DeleteAction;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;
use Livewire\Livewire;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Client\Filament\Panels\Admin\Resources\ClientResource\Pages\ListClientsPage;
use Modules\Client\Models\ClientModel;
use Modules\Client\Models\SocialAccountModel;
use Modules\ClientHistory\Enums\HistoryMediaType;
use Modules\ClientHistory\Models\ClientServiceHistoryMediaModel;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

function deletableClient(): ClientModel
{
    return ClientModel::factory()->create([
        'password' => Hash::make('password123'),
        'phone' => '+963911222333',
        'phone_verified_at' => now(),
    ]);
}

function deleteAccountAs(ClientModel $client): TestResponse
{
    $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

    return test()->withToken($token)->deleteJson('/api/v1/client/account', ['password' => 'password123']);
}

function historyForDeletedClient(ClientModel $client, ?BookingModel $booking = null): ClientServiceHistoryModel
{
    $barber = BarberModel::factory()->create();
    $service = OfferedServiceModel::factory()->create([
        'serviceable_id' => $barber->id,
        'serviceable_type' => ServiceableTypeEnum::Barber,
    ]);

    return ClientServiceHistoryModel::query()->create([
        'client_id' => $client->id,
        'booking_id' => $booking?->id,
        'barber_id' => $barber->id,
        'offered_service_id' => $service->id,
        'performed_at' => now()->subDay(),
        'client_rating' => 5,
        'client_notes' => 'Sara loved the fade',
        'barber_notes' => 'Regular, call Sara on 0911222333',
    ]);
}

describe('DELETE /api/v1/client/account blocking bookings', function (): void {
    it('returns 409 and leaves the account untouched while a booking is :dataset', function (BookingStatus $status): void {
        $client = deletableClient();
        BookingModel::factory()->create(['client_id' => $client->id, 'booking_status' => $status]);

        deleteAccountAs($client)
            ->assertStatus(409)
            ->assertJsonPath('success', false)
            ->assertJsonPath('code', 'ACCOUNT_HAS_ACTIVE_BOOKINGS');

        $fresh = $client->fresh();
        expect($fresh)->not->toBeNull()
            ->and($fresh->email)->toBe($client->email)
            ->and($fresh->phone)->toBe('+963911222333')
            ->and($fresh->tokens()->count())->toBe(1);
        $this->assertNotSoftDeleted('clients', ['id' => $client->id]);
    })->with([
        'pending' => [BookingStatus::Pending],
        'confirmed' => [BookingStatus::Confirmed],
        'in_progress' => [BookingStatus::InProgress],
    ]);
});

describe('DELETE /api/v1/client/account when allowed', function (): void {
    it('deletes with only finished bookings, revokes tokens and scrubs PII', function (): void {
        Storage::fake('public');
        $client = deletableClient();
        $avatar = UploadedFile::fake()->image('me.jpg')->store('avatars', 'public');
        $client->forceFill(['avatar' => $avatar])->save();
        $client->createToken('second-device');
        SocialAccountModel::factory()->create(['client_id' => $client->id]);

        foreach ([BookingStatus::Completed, BookingStatus::Cancelled, BookingStatus::NoShow] as $status) {
            BookingModel::factory()->create(['client_id' => $client->id, 'booking_status' => $status]);
        }

        deleteAccountAs($client)->assertOk();

        $this->assertSoftDeleted('clients', ['id' => $client->id]);
        $deleted = ClientModel::withTrashed()->findOrFail($client->id);

        expect($deleted->tokens()->count())->toBe(0)
            ->and(SocialAccountModel::query()->where('client_id', $client->id)->exists())->toBeFalse()
            ->and($deleted->email)->not->toBe($client->email)
            ->and($deleted->email)->toEndWith('@deleted.invalid')
            ->and($deleted->getTranslation('name', 'en'))->not->toBe($client->getTranslation('name', 'en'))
            ->and($deleted->phone)->toBeNull()
            ->and($deleted->phone_verified_at)->toBeNull()
            ->and($deleted->email_verified_at)->toBeNull()
            ->and($deleted->avatar)->toBeNull()
            ->and($deleted->status)->toBe(ClientStatusEnum::Disabled)
            ->and(Hash::check('password123', $deleted->password))->toBeFalse();
        Storage::disk('public')->assertMissing($avatar);
    });

    it('frees the email so the person can register again', function (): void {
        $client = deletableClient();
        $email = $client->email;

        deleteAccountAs($client)->assertOk();

        $this->postJson('/api/v1/client/register', [
            'name' => 'Sara Again',
            'email' => $email,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated();
    });

    it('anonymizes service history but keeps the rows for aggregates', function (): void {
        $client = deletableClient();
        $booking = BookingModel::factory()->create(['client_id' => $client->id, 'booking_status' => BookingStatus::Completed]);
        $history = historyForDeletedClient($client, $booking);
        ClientServiceHistoryMediaModel::query()->create([
            'client_service_history_id' => $history->id,
            'photo_url' => 'https://cdn.example.com/sara-after.jpg',
            'photo_type' => HistoryMediaType::After,
            'uploaded_at' => now(),
        ]);
        $otherClient = ClientModel::factory()->create();
        $untouched = historyForDeletedClient($otherClient);

        deleteAccountAs($client)->assertOk();

        $row = ClientServiceHistoryModel::query()->findOrFail($history->id);
        expect($row->client_id)->toBeNull()
            ->and($row->booking_id)->toBeNull()
            ->and($row->client_notes)->toBeNull()
            ->and($row->barber_notes)->toBeNull()
            ->and($row->barber_id)->toBe($history->barber_id)
            ->and($row->offered_service_id)->toBe($history->offered_service_id)
            ->and($row->client_rating)->toBe(5)
            ->and(ClientServiceHistoryMediaModel::query()->where('client_service_history_id', $history->id)->exists())->toBeFalse();

        $serialized = json_encode($row->getAttributes(), JSON_THROW_ON_ERROR);
        expect($serialized)->not->toContain($client->id)
            ->not->toContain($client->email)
            ->not->toContain('Sara');

        expect($untouched->fresh()->client_id)->toBe($otherClient->id)
            ->and($untouched->fresh()->client_notes)->toBe('Sara loved the fade');
    });

    it('still rejects a wrong password with 401 and deletes nothing', function (): void {
        $client = deletableClient();
        $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

        $this->withToken($token)
            ->deleteJson('/api/v1/client/account', ['password' => 'wrong-password'])
            ->assertUnauthorized();

        $this->assertNotSoftDeleted('clients', ['id' => $client->id]);
    });
});

describe('admin panel client deletion', function (): void {
    beforeEach(function (): void {
        Filament::setCurrentPanel(Filament::getPanel('admin'));
        $this->actingAs(AdminModel::factory()->create(), 'admin');
    });

    it('goes through the same rules and anonymization', function (): void {
        $client = deletableClient();
        $history = historyForDeletedClient($client);

        Livewire::test(ListClientsPage::class)
            ->callTableAction(DeleteAction::class, $client);

        $this->assertSoftDeleted('clients', ['id' => $client->id]);
        expect(ClientModel::withTrashed()->findOrFail($client->id)->email)->toEndWith('@deleted.invalid')
            ->and($history->fresh()->client_id)->toBeNull();
    });

    it('is blocked while the client has an active booking', function (): void {
        $client = deletableClient();
        BookingModel::factory()->create(['client_id' => $client->id, 'booking_status' => BookingStatus::Confirmed]);

        Livewire::test(ListClientsPage::class)
            ->callTableAction(DeleteAction::class, $client)
            ->assertNotified(__('client::ui.delete_blocked_active_bookings'));

        $this->assertNotSoftDeleted('clients', ['id' => $client->id]);
        expect($client->fresh()->email)->toBe($client->email);
    });
});
