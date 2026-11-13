<?php

declare(strict_types=1);

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Mail;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\DeviceTokenUserTypeEnum;
use Modules\Core\Enums\NotificationTypeEnum;
use Modules\Core\Enums\PlatformEventEnum;
use Modules\Core\Models\NotificationModel;
use Modules\Core\Services\PlatformNotifier;

const DASHBOARD_FEED_URL = '/api/v1/dashboard/notifications';

function feedRow(Model $account, array $attributes = []): NotificationModel
{
    return NotificationModel::query()->create([
        'notifiable_type' => $account->getMorphClass(),
        'notifiable_id' => $account->getKey(),
        'type' => NotificationTypeEnum::PlatformEvent,
        'title' => 'Title',
        'body' => 'Body',
        'data' => ['event' => 'review_disputed', 'subject_id' => 'x'],
        ...$attributes,
    ]);
}

function feedOwnerWithBrand(): ClientModel
{
    $owner = ClientModel::factory()->create();
    BrandModel::factory()->create(['owner_id' => $owner->id]);

    return $owner;
}

/** NS-10: the dashboard notification feed, for every actor type. */
describe('Dashboard notification feed', function (): void {
    it('lists the caller\'s rows newest first with the unread count, for each actor type', function (string $kind): void {
        $actor = match ($kind) {
            'admin' => AdminModel::factory()->create(),
            'owner' => feedOwnerWithBrand(),
            'barber' => BarberModel::factory()->create(),
            'manager' => BranchModel::factory()->create(),
        };
        $older = feedRow($actor, ['created_at' => now()->subDays(2), 'read_at' => now()]);
        $newer = feedRow($actor, ['created_at' => now()->subDay()]);
        feedRow(AdminModel::factory()->create());
        feedRow(ClientModel::factory()->create());
        $this->authenticateDashboardActor($actor);

        $response = $this->getJson(DASHBOARD_FEED_URL)->assertOk();

        expect(array_column($response->json('data'), 'id'))->toBe([$newer->id, $older->id])
            ->and($response->json('meta.unread_count'))->toBe(1)
            ->and($response->json('meta.pagination.total'))->toBe(2)
            ->and($response->json('data.0'))->toMatchArray(['type' => 'platform_event', 'title' => 'Title', 'body' => 'Body', 'read_at' => null]);
    })->with(['admin', 'owner', 'barber', 'manager']);

    it('filters unread rows without changing the unread count and paginates', function (): void {
        $admin = AdminModel::factory()->create();
        feedRow($admin, ['read_at' => now()]);
        foreach (range(1, 3) as $_) {
            feedRow($admin);
        }
        $this->authenticateDashboardActor($admin);

        $this->getJson(DASHBOARD_FEED_URL.'?unread=1')->assertOk()->assertJsonCount(3, 'data')->assertJsonPath('meta.unread_count', 3);
        $this->getJson(DASHBOARD_FEED_URL.'?per_page=2')->assertOk()->assertJsonCount(2, 'data')->assertJsonPath('meta.pagination.total', 4);
        $this->getJson(DASHBOARD_FEED_URL.'?per_page=100000')->assertOk()->assertJsonCount(4, 'data');
        $this->getJson(DASHBOARD_FEED_URL.'?unread=maybe')->assertUnprocessable()->assertJsonValidationErrors('unread');
    });

    it('rejects anonymous callers on every feed route', function (): void {
        $this->getJson(DASHBOARD_FEED_URL)->assertUnauthorized();
        $this->postJson(DASHBOARD_FEED_URL.'/read-all')->assertUnauthorized();
        $this->patchJson(DASHBOARD_FEED_URL.'/'.feedRow(AdminModel::factory()->create())->id.'/read')->assertUnauthorized();
    });
});

describe('Mark notifications read', function (): void {
    it('marks one row read and keeps the first read time on a repeat', function (): void {
        $admin = AdminModel::factory()->create();
        $row = feedRow($admin);
        $this->authenticateDashboardActor($admin);

        $this->patchJson(DASHBOARD_FEED_URL."/{$row->id}/read")->assertOk();
        $firstRead = $row->fresh()->read_at;
        expect($firstRead)->not->toBeNull();

        $this->travel(1)->hour();
        $this->patchJson(DASHBOARD_FEED_URL."/{$row->id}/read")->assertOk();

        expect($row->fresh()->read_at->equalTo($firstRead))->toBeTrue();
    });

    it('answers 404 for another account\'s row, an unknown row and a malformed id, leaving it unread', function (): void {
        $admin = AdminModel::factory()->create();
        $foreign = feedRow(AdminModel::factory()->create());
        $this->authenticateDashboardActor($admin);

        $this->patchJson(DASHBOARD_FEED_URL."/{$foreign->id}/read")->assertNotFound();
        $this->patchJson(DASHBOARD_FEED_URL.'/00000000-0000-4000-8000-0000000000ff/read')->assertNotFound();
        $this->patchJson(DASHBOARD_FEED_URL.'/not-a-uuid/read')->assertNotFound();

        expect($foreign->fresh()->read_at)->toBeNull();
    });

    it('marks every own unread row read and touches nobody else', function (): void {
        $admin = AdminModel::factory()->create();
        $mine = [feedRow($admin), feedRow($admin)];
        $alreadyRead = feedRow($admin, ['read_at' => now()->subDay()]);
        $theirs = feedRow(AdminModel::factory()->create());
        $this->authenticateDashboardActor($admin);

        $this->postJson(DASHBOARD_FEED_URL.'/read-all')
            ->assertOk()
            ->assertJsonPath('data.updated', 2)
            ->assertJsonPath('data.unread_count', 0);

        expect($mine[0]->fresh()->read_at)->not->toBeNull()->and($mine[1]->fresh()->read_at)->not->toBeNull()
            ->and($alreadyRead->fresh()->read_at->lt(now()->subHours(12)))->toBeTrue()
            ->and($theirs->fresh()->read_at)->toBeNull();
    });

    it('keeps an owner and a barber with the same id space from reading each other\'s rows', function (): void {
        $owner = feedOwnerWithBrand();
        $barber = BarberModel::factory()->create();
        $barberRow = feedRow($barber);
        $this->authenticateDashboardActor($owner);

        $this->patchJson(DASHBOARD_FEED_URL."/{$barberRow->id}/read")->assertNotFound();
        $this->getJson(DASHBOARD_FEED_URL)->assertOk()->assertJsonCount(0, 'data');
    });
});

describe('Platform event rows', function (): void {
    it('writes one row per active admin, none for a deactivated admin', function (): void {
        $active = AdminModel::factory()->create();
        $deactivated = AdminModel::factory()->create(['deactivated_at' => now()]);

        app(PlatformNotifier::class)->toAdmins(PlatformEventEnum::ReviewDisputed, 'review-1');

        $row = NotificationModel::query()->where('notifiable_id', $active->id)->sole();
        expect($row->type)->toBe(NotificationTypeEnum::PlatformEvent)
            ->and($row->title)->toBe(PlatformEventEnum::ReviewDisputed->title())
            ->and($row->data)->toMatchArray(['event' => 'review_disputed', 'subject_id' => 'review-1'])
            ->and(NotificationModel::query()->where('notifiable_id', $deactivated->id)->count())->toBe(0);
    });

    it('does not duplicate the same event for the same subject within a minute', function (): void {
        $admin = AdminModel::factory()->create();
        $notifier = app(PlatformNotifier::class);

        $notifier->toAdmins(PlatformEventEnum::BarberAwaitingApproval, 'barber-1');
        $notifier->toAdmins(PlatformEventEnum::BarberAwaitingApproval, 'barber-1');
        $notifier->toAdmins(PlatformEventEnum::BarberAwaitingApproval, 'barber-2');

        expect(NotificationModel::query()->where('notifiable_id', $admin->id)->count())->toBe(2);
    });

    it('never breaks the business action when the inbox write fails', function (): void {
        AdminModel::factory()->create();
        NotificationModel::creating(static fn () => throw new RuntimeException('inbox down'));

        app(PlatformNotifier::class)->toAdmins(PlatformEventEnum::ReviewDisputed, 'review-1');
        app(PlatformNotifier::class)->toAccount(DeviceTokenUserTypeEnum::Client, (string) ClientModel::factory()->create()->id, PlatformEventEnum::BrandApproved, 'brand-1');

        expect(NotificationModel::query()->count())->toBe(0);
    });

    it('tells the owner when an admin approves, suspends and reactivates their brand', function (): void {
        Mail::fake();
        $owner = ClientModel::factory()->create();
        $brand = BrandModel::factory()->create(['owner_id' => $owner->id, 'status' => BrandStatusEnum::Pending]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $base = '/api/v1/dashboard/admin/brands/'.$brand->id;

        $this->patchJson("{$base}/approve")->assertOk();
        $this->travel(2)->minutes();
        $this->patchJson("{$base}/suspend", ['reason' => 'Chargebacks.'])->assertOk();
        $this->travel(2)->minutes();
        $this->patchJson("{$base}/reactivate")->assertOk();

        $events = NotificationModel::query()->where('notifiable_id', $owner->id)->orderBy('created_at')->get()->map(fn (NotificationModel $row): string => $row->data['event'])->all();
        expect($events)->toBe(['brand_approved', 'brand_suspended', 'brand_reactivated']);
    });

    it('shows a new platform row in the admin\'s feed with its event key and subject', function (): void {
        $admin = AdminModel::factory()->create();
        app(PlatformNotifier::class)->toAdmins(PlatformEventEnum::BrandSubmitted, 'brand-9');
        $this->authenticateDashboardActor($admin);

        $this->getJson(DASHBOARD_FEED_URL)
            ->assertOk()
            ->assertJsonPath('data.0.data.event', 'brand_submitted')
            ->assertJsonPath('data.0.data.subject_id', 'brand-9')
            ->assertJsonPath('meta.unread_count', 1);
    });
});
