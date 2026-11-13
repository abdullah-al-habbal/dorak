<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Ban\Exceptions\AccountBanException;
use Modules\Ban\Models\BanModel;
use Modules\Booking\Models\BookingModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Client\Models\ClientModel;
use Modules\Review\Enums\ReviewAuthorTypeEnum;
use Modules\Review\Models\ReviewModel;

const ADMIN_CLIENTS_URL = '/api/v1/dashboard/admin/clients';
const ADMIN_CLIENTS_MISSING_ID = '00000000-0000-4000-8000-0000000000dd';

function bannedClient(array $overrides = [], array $ban = []): ClientModel
{
    $client = ClientModel::factory()->create($overrides);
    $client->bans()->create(['reason' => 'Abuse of staff.', 'banned_at' => now()->subMinute(), ...$ban]);

    return $client;
}

/** NS-07: platform admin client directory, details and bans. */
describe('List clients', function (): void {
    it('filters by status, ban state and search over name, email and phone', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $plain = ClientModel::factory()->create(['email' => 'plain@example.com', 'phone' => '+962700000001', 'status' => ClientStatusEnum::Enabled]);
        $banned = bannedClient(['email' => 'banned@example.com', 'status' => ClientStatusEnum::Enabled]);
        $disabled = ClientModel::factory()->create(['email' => 'off@example.com', 'status' => ClientStatusEnum::Disabled]);

        $ids = fn (string $query): array => collect($this->getJson(ADMIN_CLIENTS_URL.$query)->assertOk()->json('data'))->pluck('id')->all();

        expect($ids('?banned=1'))->toBe([$banned->id])
            ->and($ids('?banned=0'))->toContain($plain->id, $disabled->id)->not->toContain($banned->id)
            ->and($ids('?status=disabled'))->toBe([$disabled->id])
            ->and($ids('?search=plain@'))->toBe([$plain->id])
            ->and($ids('?search=700000001'))->toBe([$plain->id]);
    });

    it('treats an expired or lifted ban as not banned', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $expired = bannedClient([], ['banned_at' => now()->subDays(3), 'expires_at' => now()->subDay()]);
        $future = bannedClient([], ['banned_at' => now()->addDay()]);

        $rows = collect($this->getJson(ADMIN_CLIENTS_URL)->assertOk()->json('data'))->keyBy('id');

        expect($rows[$expired->id]['is_banned'])->toBeFalse()
            ->and($rows[$future->id]['is_banned'])->toBeFalse();
    });

    it('treats wildcards in the search as literal text', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        ClientModel::factory()->create();

        $this->getJson(ADMIN_CLIENTS_URL.'?search=%25')->assertOk()->assertJsonCount(0, 'data');
    });

    it('returns the bookings count and clamps a page size above the maximum', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $client = ClientModel::factory()->create();
        BookingModel::factory()->count(2)->create(['client_id' => $client->id]);

        $row = collect($this->getJson(ADMIN_CLIENTS_URL.'?per_page=100000')->assertOk()->json('data'))->firstWhere('id', $client->id);

        expect($row['bookings_count'])->toBe(2);
    });

    it('rejects an unknown status and a non-boolean banned filter', function (string $query, string $field): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson(ADMIN_CLIENTS_URL.$query)->assertUnprocessable()->assertJsonValidationErrors($field);
    })->with([['?status=ghost', 'status'], ['?banned=maybe', 'banned']]);
});

describe('Show a client (D4 data boundary)', function (): void {
    it('returns the account with ban history newest first and nothing beyond the D4 fields', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $client = ClientModel::factory()->create();
        $client->bans()->create(['reason' => 'Old ban.', 'banned_at' => now()->subDays(10), 'expires_at' => now()->subDays(9)]);
        $client->bans()->create(['reason' => 'Recent ban.', 'banned_at' => now()->subDay(), 'expires_at' => now()->subHour()]);

        $response = $this->getJson(ADMIN_CLIENTS_URL."/{$client->id}")->assertOk();

        $response->assertJsonPath('data.bans.0.reason', 'Recent ban.')
            ->assertJsonPath('data.bans.1.reason', 'Old ban.')
            ->assertJsonPath('data.bans.0.active', false);
        expect(array_keys($response->json('data')))->toEqualCanonicalizing([
            'id', 'name', 'email', 'phone', 'email_verified_at', 'phone_verified_at', 'status',
            'is_banned', 'bookings_count', 'bans', 'created_at',
        ]);
    });

    it('answers 404 for an unknown client', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson(ADMIN_CLIENTS_URL.'/'.ADMIN_CLIENTS_MISSING_ID)->assertNotFound();
    });
});

describe('A client\'s bookings and reviews', function (): void {
    it('lists only that client\'s bookings, newest first, and 404 for an unknown client', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $client = ClientModel::factory()->create();
        $older = BookingModel::factory()->create(['client_id' => $client->id, 'starts_at' => now()->addDays(2), 'ends_at' => now()->addDays(2)->addMinutes(30)]);
        $newer = BookingModel::factory()->create(['client_id' => $client->id, 'starts_at' => now()->addDays(5), 'ends_at' => now()->addDays(5)->addMinutes(30)]);
        BookingModel::factory()->create();

        $page = $this->getJson(ADMIN_CLIENTS_URL."/{$client->id}/bookings")->assertOk()->assertJsonCount(2, 'data');

        expect($page->json('data.0.id'))->toBe($newer->id)->and($page->json('data.1.id'))->toBe($older->id);
        $this->getJson(ADMIN_CLIENTS_URL.'/'.ADMIN_CLIENTS_MISSING_ID.'/bookings')->assertNotFound();
    });

    it('lists only reviews the client wrote and 404 for an unknown client', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $client = ClientModel::factory()->create();
        $written = ReviewModel::factory()->create(['author_id' => $client->id, 'author_type' => ReviewAuthorTypeEnum::Client]);
        ReviewModel::factory()->create(['subject_id' => $client->id]);
        ReviewModel::factory()->create();

        $this->getJson(ADMIN_CLIENTS_URL."/{$client->id}/reviews")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $written->id);
        $this->getJson(ADMIN_CLIENTS_URL.'/'.ADMIN_CLIENTS_MISSING_ID.'/reviews')->assertNotFound();
    });

    it('paginates with the requested page size', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $client = ClientModel::factory()->create();
        BookingModel::factory()->count(3)->create(['client_id' => $client->id]);

        $this->getJson(ADMIN_CLIENTS_URL."/{$client->id}/bookings?per_page=2")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.pagination.total', 3);
    });
});

describe('Ban and unban a client', function (): void {
    it('bans permanently, records who and why, and signs the client out', function (): void {
        $admin = AdminModel::factory()->create();
        $client = ClientModel::factory()->create();
        $client->createToken('mobile');
        $this->authenticateDashboardActor($admin);

        $this->postJson(ADMIN_CLIENTS_URL."/{$client->id}/ban", ['reason' => '  Repeated no-shows.  '])
            ->assertOk()
            ->assertJsonPath('data.is_banned', true)
            ->assertJsonPath('data.bans.0.reason', 'Repeated no-shows.')
            ->assertJsonPath('data.bans.0.expires_at', null);

        $ban = BanModel::query()->where('bannable_id', $client->id)->firstOrFail();
        expect($ban->banned_by_id)->toBe($admin->id)
            ->and($client->tokens()->count())->toBe(0);
    });

    it('stores a timed ban and lets it lapse on its own', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $client = ClientModel::factory()->create();

        $this->postJson(ADMIN_CLIENTS_URL."/{$client->id}/ban", ['reason' => 'Cooling off.', 'expires_at' => now()->addDay()->toIso8601String()])->assertOk();
        expect($client->fresh()->isBanned())->toBeTrue();

        $this->travel(2)->days();
        expect($client->fresh()->isBanned())->toBeFalse();
    });

    it('answers 409 account_already_banned for a second ban and keeps one row', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $client = bannedClient();

        $this->postJson(ADMIN_CLIENTS_URL."/{$client->id}/ban", ['reason' => 'Again and again.'])
            ->assertStatus(409)
            ->assertJsonPath('code', AccountBanException::CODE_ALREADY_BANNED);

        expect($client->bans()->count())->toBe(1);
    });

    it('allows a new ban once the previous one expired', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $client = bannedClient([], ['banned_at' => now()->subDays(3), 'expires_at' => now()->subDay()]);

        $this->postJson(ADMIN_CLIENTS_URL."/{$client->id}/ban", ['reason' => 'Back again.'])->assertOk();

        expect($client->bans()->count())->toBe(2);
    });

    it('validates the reason length and the expiry', function (array $payload, string $field): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $client = ClientModel::factory()->create();

        $this->postJson(ADMIN_CLIENTS_URL."/{$client->id}/ban", $payload)->assertUnprocessable()->assertJsonValidationErrors($field);

        expect($client->fresh()->isBanned())->toBeFalse();
    })->with([
        'missing reason' => [[], 'reason'],
        'short reason' => [['reason' => 'ab'], 'reason'],
        'bad date' => [['reason' => 'Valid reason.', 'expires_at' => 'tomorrow-ish'], 'expires_at'],
    ]);

    it('lifts a ban but keeps its row with who lifted it', function (): void {
        $admin = AdminModel::factory()->create();
        $client = bannedClient();
        $this->authenticateDashboardActor($admin);

        $this->patchJson(ADMIN_CLIENTS_URL."/{$client->id}/unban")
            ->assertOk()
            ->assertJsonPath('data.is_banned', false);

        $ban = $client->bans()->firstOrFail();
        expect($ban->lifted_at)->not->toBeNull()->and($ban->lifted_by_id)->toBe($admin->id)
            ->and($client->fresh()->isBanned())->toBeFalse();
    });

    it('answers 409 account_not_banned when there is no active ban', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $client = ClientModel::factory()->create();

        $this->patchJson(ADMIN_CLIENTS_URL."/{$client->id}/unban")
            ->assertStatus(409)
            ->assertJsonPath('code', AccountBanException::CODE_NOT_BANNED);
    });

    it('answers 404 for an unknown client on ban and unban', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->postJson(ADMIN_CLIENTS_URL.'/'.ADMIN_CLIENTS_MISSING_ID.'/ban', ['reason' => 'Valid reason.'])->assertNotFound();
        $this->patchJson(ADMIN_CLIENTS_URL.'/'.ADMIN_CLIENTS_MISSING_ID.'/unban')->assertNotFound();
    });

    it('refuses a banned brand owner the dashboard session they held', function (): void {
        $owner = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $owner->id]);
        $this->authenticateDashboardActor($owner);
        $this->getJson('/api/v1/dashboard/brands')->assertOk();

        $owner->bans()->create(['reason' => 'Fraud.', 'banned_at' => now()->subMinute()]);
        app('auth')->forgetGuards();

        $this->getJson('/api/v1/dashboard/brands')->assertUnauthorized();
    });
});

describe('Client admin routes are platform-admin only', function (): void {
    it('rejects anonymous callers and brand owners without changing anything', function (string $method, string $path): void {
        $client = ClientModel::factory()->create();
        $owner = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $owner->id]);
        $url = ADMIN_CLIENTS_URL.'/'.str_replace('{id}', $client->id, $path);

        $this->json($method, $url, ['reason' => 'Valid reason.'])->assertUnauthorized();

        $this->authenticateDashboardActor($owner);
        $this->json($method, $url, ['reason' => 'Valid reason.'])->assertForbidden();
        expect($client->fresh()->isBanned())->toBeFalse();
    })->with([
        ['GET', ''], ['GET', '{id}'], ['GET', '{id}/bookings'], ['GET', '{id}/reviews'],
        ['POST', '{id}/ban'], ['PATCH', '{id}/unban'],
    ]);
});
