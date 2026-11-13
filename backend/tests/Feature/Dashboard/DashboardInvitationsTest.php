<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Queue;
use Modules\Admin\Models\AdminModel;
use Modules\Audit\Models\StatusChangeLogModel;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Jobs\AffiliationInvitedNotification;
use Modules\BarberAffiliation\Jobs\AffiliationRespondedNotification;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Constants\BrandFeatureConstants;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;

const INVITATIONS_URL = '/api/v1/dashboard';

/** NS-16 helper: sign in as another actor inside one test. */
function invitationsSwitchTo(AdminModel|BarberModel|BranchModel|ClientModel $actor): void
{
    app('auth')->forgetGuards();
    test()->flushHeaders();
    test()->authenticateDashboardActor($actor);
}

function invitationsLog(BarberAffiliationModel $affiliation): ?StatusChangeLogModel
{
    return StatusChangeLogModel::query()
        ->where('subject_type', 'affiliation')
        ->where('subject_id', $affiliation->id)
        ->latest('created_at')
        ->first();
}

function invitationsLookup(string $search): array
{
    return test()->getJson(INVITATIONS_URL.'/barber-lookup?search='.urlencode($search))->assertOk()->json('data');
}

/** @return array{owner: ClientModel, brand: BrandModel, branch: BranchModel} */
function invitationsOwnerWorld(): array
{
    $owner = ClientModel::factory()->create();
    $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);

    return ['owner' => $owner, 'brand' => $brand, 'branch' => BranchModel::factory()->create(['brand_id' => $brand->id])];
}

describe('Barber lookup (NS-16)', function (): void {
    it('finds discoverable barbers by name fragment in either language and returns only id and name', function (): void {
        $english = BarberModel::factory()->create(['name' => ['en' => 'Zaid Haddad', 'ar' => 'زيد']]);
        $arabic = BarberModel::factory()->create(['name' => ['en' => 'Other', 'ar' => 'سامر الخطيب']]);
        BarberModel::factory()->create(['name' => ['en' => 'Unrelated', 'ar' => 'مختلف']]);
        $this->authenticateDashboardActor(BranchModel::factory()->create());

        $byEnglish = invitationsLookup('addad');
        $byArabic = invitationsLookup('الخطيب');

        expect(collect($byEnglish)->pluck('id')->all())->toBe([$english->id])
            ->and(collect($byArabic)->pluck('id')->all())->toBe([$arabic->id])
            ->and(array_keys($byEnglish[0]))->toBe(['id', 'name']);
    });

    it('matches email and phone exactly, never by fragment, and never leaks them', function (): void {
        $barber = BarberModel::factory()->create(['email' => 'lookup.me@example.test', 'phone' => '00963111222333']);
        $this->authenticateDashboardActor(BranchModel::factory()->create());

        expect(collect(invitationsLookup('lookup.me@example.test'))->pluck('id')->all())->toBe([$barber->id])
            ->and(collect(invitationsLookup('00963111222333'))->pluck('id')->all())->toBe([$barber->id])
            ->and(invitationsLookup('lookup.me@example'))->toBe([])
            ->and(invitationsLookup('0096311122'))->toBe([]);
    });

    it('hides barbers who are not enabled or are banned, and still shows an expired ban', function (BarberStatusEnum $status): void {
        BarberModel::factory()->create(['name' => ['en' => 'Hidden Person', 'ar' => 'مخفي'], 'status' => $status->value]);
        $this->authenticateDashboardActor(BranchModel::factory()->create());

        expect(invitationsLookup('Hidden Person'))->toBe([]);
    })->with([BarberStatusEnum::Pending, BarberStatusEnum::Disabled, BarberStatusEnum::Rejected]);

    it('hides a currently banned barber and shows one whose ban expired', function (): void {
        $banned = BarberModel::factory()->create(['name' => ['en' => 'Banned Bob', 'ar' => 'محظور']]);
        $banned->bans()->create(['reason' => 'Fraud.', 'banned_at' => now()->subDay()]);
        $expired = BarberModel::factory()->create(['name' => ['en' => 'Banned Eve', 'ar' => 'منتهي']]);
        $expired->bans()->create(['reason' => 'Old.', 'banned_at' => now()->subDays(5), 'expires_at' => now()->subDay()]);
        $this->authenticateDashboardActor(BranchModel::factory()->create());

        expect(invitationsLookup('Banned Bob'))->toBe([])
            ->and(collect(invitationsLookup('Banned Eve'))->pluck('id')->all())->toBe([$expired->id]);
    });

    it('treats percent and underscore as literal characters and caps the answer at ten', function (): void {
        foreach (range(1, 12) as $number) {
            BarberModel::factory()->create(['name' => ['en' => "Crowd Member {$number}", 'ar' => "حشد {$number}"]]);
        }
        $this->authenticateDashboardActor(BranchModel::factory()->create());

        expect(invitationsLookup('%%%'))->toBe([])
            ->and(invitationsLookup('___'))->toBe([])
            ->and(invitationsLookup('Crowd Member'))->toHaveCount(10);
    });

    it('validates the search term', function (string $search): void {
        $this->authenticateDashboardActor(BranchModel::factory()->create());

        $this->getJson(INVITATIONS_URL.'/barber-lookup?search='.urlencode($search))->assertUnprocessable()->assertJsonValidationErrors('search');
    })->with(['too short' => 'ab', 'too long' => str_repeat('a', 101)]);

    it('requires the search parameter', function (): void {
        $this->authenticateDashboardActor(BranchModel::factory()->create());

        $this->getJson(INVITATIONS_URL.'/barber-lookup')->assertUnprocessable()->assertJsonValidationErrors('search');
    });

    it('is open to a manager, an owner and the admin, and closed to a barber and anonymous callers', function (): void {
        $world = invitationsOwnerWorld();
        $url = INVITATIONS_URL.'/barber-lookup?search=nobody';

        $this->getJson($url)->assertUnauthorized();
        foreach ([$world['branch'], $world['owner'], AdminModel::factory()->create()] as $actor) {
            invitationsSwitchTo($actor);
            $this->getJson($url)->assertOk();
        }
        invitationsSwitchTo(BarberModel::factory()->create());
        $this->getJson($url)->assertForbidden();
    });
});

describe('Invite a barber (NS-16)', function (): void {
    it('stores a pending branch-initiated invitation with its commission, logs it and notifies the barber', function (): void {
        Queue::fake();
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $this->authenticateDashboardActor($branch);

        $response = $this->postJson(INVITATIONS_URL."/branches/{$branch->id}/affiliations", ['barber_id' => $barber->id, 'commission_percent' => 12.5])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.barber_id', $barber->id)
            ->assertJsonPath('data.initiated_by_type', AffiliationInitiatorTypeEnum::Branch->value);

        $affiliation = BarberAffiliationModel::query()->findOrFail($response->json('data.id'));
        expect($affiliation->status)->toBe(AffiliationStatus::Pending)
            ->and($affiliation->barber_id)->toBe($barber->id)
            ->and($affiliation->affiliable_id)->toBe($branch->id)
            ->and($affiliation->initiated_by_id)->toBe($branch->id)
            ->and((float) $affiliation->commission_percent)->toBe(12.5)
            ->and($affiliation->invited_at)->not->toBeNull()
            ->and($affiliation->accepted_at)->toBeNull()
            ->and(invitationsLog($affiliation))->to_status->toBe('pending')->from_status->toBeNull();
        Queue::assertPushed(AffiliationInvitedNotification::class, 1);
    });

    it('lets an owner invite into a branch of their brand and not into another brand\'s branch', function (): void {
        $world = invitationsOwnerWorld();
        $foreign = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $this->authenticateDashboardActor($world['owner']);

        $this->postJson(INVITATIONS_URL."/branches/{$world['branch']->id}/affiliations", ['barber_id' => $barber->id])->assertCreated();
        $this->postJson(INVITATIONS_URL."/branches/{$foreign->id}/affiliations", ['barber_id' => $barber->id])->assertNotFound();

        expect(BarberAffiliationModel::query()->where('affiliable_id', $foreign->id)->count())->toBe(0)
            ->and(BarberAffiliationModel::query()->where('affiliable_id', $world['branch']->id)->count())->toBe(1);
    });

    it('keeps a manager inside their own branch, whatever the URL says', function (): void {
        $mine = BranchModel::factory()->create();
        $other = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $this->authenticateDashboardActor($mine);

        $this->postJson(INVITATIONS_URL."/branches/{$other->id}/affiliations", ['barber_id' => $barber->id])->assertNotFound();

        expect(BarberAffiliationModel::query()->count())->toBe(0);
    });

    it('answers 409 for a pending or active duplicate but lets a rejected or terminated barber be invited again', function (): void {
        Queue::fake();
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor($branch);
        $url = INVITATIONS_URL."/branches/{$branch->id}/affiliations";

        $pending = BarberModel::factory()->create();
        BarberAffiliationModel::factory()->pending()->create(['barber_id' => $pending->id, 'affiliable_id' => $branch->id]);
        $active = BarberModel::factory()->create();
        BarberAffiliationModel::factory()->create(['barber_id' => $active->id, 'affiliable_id' => $branch->id]);
        $terminated = BarberModel::factory()->create();
        BarberAffiliationModel::factory()->terminated()->create(['barber_id' => $terminated->id, 'affiliable_id' => $branch->id]);
        $rejected = BarberModel::factory()->create();
        BarberAffiliationModel::factory()->create(['barber_id' => $rejected->id, 'affiliable_id' => $branch->id, 'status' => AffiliationStatus::Rejected]);

        $this->postJson($url, ['barber_id' => $pending->id])->assertStatus(409);
        $this->postJson($url, ['barber_id' => $active->id])->assertStatus(409);
        $this->postJson($url, ['barber_id' => $terminated->id])->assertCreated();
        $this->postJson($url, ['barber_id' => $rejected->id])->assertCreated();

        expect(BarberAffiliationModel::query()->where('affiliable_id', $branch->id)->count())->toBe(6);
        Queue::assertPushed(AffiliationInvitedNotification::class, 2);
    });

    it('validates the barber and the commission and writes nothing', function (array $payload, string $field): void {
        Queue::fake();
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor($branch);

        $this->postJson(INVITATIONS_URL."/branches/{$branch->id}/affiliations", $payload)->assertUnprocessable()->assertJsonValidationErrors($field);

        expect(BarberAffiliationModel::query()->count())->toBe(0);
        Queue::assertNothingPushed();
    })->with([
        'missing barber' => [[], 'barber_id'],
        'unknown barber' => [['barber_id' => '00000000-0000-4000-8000-0000000000b1'], 'barber_id'],
        'negative commission' => [['barber_id' => 'x', 'commission_percent' => -1], 'commission_percent'],
        'commission over 100' => [['barber_id' => 'x', 'commission_percent' => 100.5], 'commission_percent'],
        'text commission' => [['barber_id' => 'x', 'commission_percent' => 'lots'], 'commission_percent'],
    ]);

    it('is blocked for a pending or suspended brand, and for an extra branch after a multi_branch downgrade', function (): void {
        $barber = BarberModel::factory()->create();

        $pendingWorld = invitationsOwnerWorld();
        $pendingWorld['brand']->update(['status' => 'pending']);
        $this->authenticateDashboardActor($pendingWorld['owner']);
        $this->postJson(INVITATIONS_URL."/branches/{$pendingWorld['branch']->id}/affiliations", ['barber_id' => $barber->id])
            ->assertForbidden()->assertJsonPath('code', 'brand_not_approved');

        $suspended = invitationsOwnerWorld();
        $suspended['brand']->update(['status' => 'suspended']);
        invitationsSwitchTo($suspended['owner']);
        $this->postJson(INVITATIONS_URL."/branches/{$suspended['branch']->id}/affiliations", ['barber_id' => $barber->id])->assertForbidden();

        $downgraded = invitationsOwnerWorld();
        $extra = BranchModel::factory()->create(['brand_id' => $downgraded['brand']->id]);
        app(BrandFeatures::class)->set($downgraded['brand'], [BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH => false]);
        invitationsSwitchTo($downgraded['owner']);
        $this->postJson(INVITATIONS_URL."/branches/{$extra->id}/affiliations", ['barber_id' => $barber->id])
            ->assertForbidden()->assertJsonPath('code', 'feature_not_enabled');

        expect(BarberAffiliationModel::query()->count())->toBe(0);
    });

    it('refuses a barber and anonymous callers', function (): void {
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $url = INVITATIONS_URL."/branches/{$branch->id}/affiliations";

        $this->postJson($url, ['barber_id' => $barber->id])->assertUnauthorized();
        invitationsSwitchTo($barber);
        $this->postJson($url, ['barber_id' => $barber->id])->assertForbidden();

        expect(BarberAffiliationModel::query()->count())->toBe(0);
    });
});

describe('Answer a join request and end an affiliation (NS-16)', function (): void {
    it('accepts a barber request: activates it, stamps accepted_at, logs it and tells the barber', function (): void {
        Queue::fake();
        $branch = BranchModel::factory()->create();
        $request = BarberAffiliationModel::factory()->pending()->create([
            'affiliable_id' => $branch->id,
            'initiated_by_type' => AffiliationInitiatorTypeEnum::Barber,
            'initiated_by_id' => null,
        ]);
        $this->authenticateDashboardActor($branch);

        $this->postJson(INVITATIONS_URL."/branches/{$branch->id}/affiliations/{$request->id}/accept")
            ->assertOk()
            ->assertJsonPath('data.status', 'active');

        $fresh = $request->fresh();
        expect($fresh->status)->toBe(AffiliationStatus::Active)
            ->and($fresh->accepted_at)->not->toBeNull()
            ->and(invitationsLog($fresh))->from_status->toBe('pending')->to_status->toBe('active');
        Queue::assertPushed(AffiliationRespondedNotification::class, 1);
    });

    it('rejects a barber request without stamping accepted_at', function (): void {
        Queue::fake();
        $branch = BranchModel::factory()->create();
        $request = BarberAffiliationModel::factory()->pending()->create(['affiliable_id' => $branch->id, 'initiated_by_type' => AffiliationInitiatorTypeEnum::Barber, 'initiated_by_id' => null]);
        $this->authenticateDashboardActor($branch);

        $this->postJson(INVITATIONS_URL."/branches/{$branch->id}/affiliations/{$request->id}/reject")->assertOk()->assertJsonPath('data.status', 'rejected');

        expect($request->fresh())->status->toBe(AffiliationStatus::Rejected)->accepted_at->toBeNull()
            ->and(invitationsLog($request))->to_status->toBe('rejected');
        Queue::assertPushed(AffiliationRespondedNotification::class, 1);
    });

    it('refuses to answer anything that is not pending, and to answer its own invite, and changes nothing', function (): void {
        Queue::fake();
        $branch = BranchModel::factory()->create();
        $active = BarberAffiliationModel::factory()->create(['affiliable_id' => $branch->id, 'initiated_by_type' => AffiliationInitiatorTypeEnum::Barber, 'initiated_by_id' => null]);
        $own = BarberAffiliationModel::factory()->pending()->create(['affiliable_id' => $branch->id, 'initiated_by_id' => $branch->id]);
        $this->authenticateDashboardActor($branch);

        foreach (['accept', 'reject'] as $verb) {
            $this->postJson(INVITATIONS_URL."/branches/{$branch->id}/affiliations/{$active->id}/{$verb}")->assertStatus(400);
            $this->postJson(INVITATIONS_URL."/branches/{$branch->id}/affiliations/{$own->id}/{$verb}")->assertForbidden();
        }

        expect($active->fresh()->status)->toBe(AffiliationStatus::Active)
            ->and($own->fresh()->status)->toBe(AffiliationStatus::Pending)
            ->and(StatusChangeLogModel::query()->where('subject_type', 'affiliation')->count())->toBe(0);
        Queue::assertNothingPushed();
    });

    it('terminates an active affiliation, frees only that branch chairs and logs the branch as actor', function (): void {
        $branch = BranchModel::factory()->create();
        $other = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $affiliation = BarberAffiliationModel::factory()->create(['barber_id' => $barber->id, 'affiliable_id' => $branch->id]);
        $here = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $barber->id]);
        $elsewhere = ChairModel::factory()->create(['branch_id' => $other->id, 'barber_id' => $barber->id]);
        $this->authenticateDashboardActor($branch);

        $this->postJson(INVITATIONS_URL."/branches/{$branch->id}/affiliations/{$affiliation->id}/terminate")
            ->assertOk()
            ->assertJsonPath('data.status', 'terminated');

        expect($affiliation->fresh())->status->toBe(AffiliationStatus::Terminated)->terminated_at->not->toBeNull()
            ->and($here->fresh()->barber_id)->toBeNull()
            ->and($elsewhere->fresh()->barber_id)->toBe($barber->id)
            ->and(invitationsLog($affiliation))->from_status->toBe('active')->to_status->toBe('terminated')->actor_id->toBe($branch->id);
    });

    it('answers 400 when ending anything that is not active and leaves it as it was', function (AffiliationStatus $status): void {
        $branch = BranchModel::factory()->create();
        $affiliation = BarberAffiliationModel::factory()->create(['affiliable_id' => $branch->id, 'status' => $status]);
        $this->authenticateDashboardActor($branch);

        $this->postJson(INVITATIONS_URL."/branches/{$branch->id}/affiliations/{$affiliation->id}/terminate")->assertStatus(400);

        expect($affiliation->fresh()->status)->toBe($status);
    })->with([AffiliationStatus::Pending, AffiliationStatus::Rejected, AffiliationStatus::Terminated]);

    it('answers 404 for another branch\'s affiliation on every action, for owners and managers', function (): void {
        $world = invitationsOwnerWorld();
        $foreign = BarberAffiliationModel::factory()->pending()->create();
        $mine = BranchModel::factory()->create();

        foreach ([$world['owner'], $mine] as $actor) {
            invitationsSwitchTo($actor);
            foreach (['accept', 'reject', 'terminate'] as $verb) {
                $this->postJson(INVITATIONS_URL."/branches/{$foreign->affiliable_id}/affiliations/{$foreign->id}/{$verb}")->assertNotFound();
                $branchId = $actor instanceof BranchModel ? $actor->id : $world['branch']->id;
                $this->postJson(INVITATIONS_URL."/branches/{$branchId}/affiliations/{$foreign->id}/{$verb}")->assertNotFound();
            }
        }

        expect($foreign->fresh()->status)->toBe(AffiliationStatus::Pending);
    });

    it('refuses a barber and anonymous callers on every action', function (): void {
        $branch = BranchModel::factory()->create();
        $affiliation = BarberAffiliationModel::factory()->pending()->create(['affiliable_id' => $branch->id, 'initiated_by_type' => AffiliationInitiatorTypeEnum::Barber, 'initiated_by_id' => null]);
        $base = INVITATIONS_URL."/branches/{$branch->id}/affiliations/{$affiliation->id}";

        $this->postJson("{$base}/accept")->assertUnauthorized();
        invitationsSwitchTo(BarberModel::factory()->create());
        foreach (['accept', 'reject', 'terminate'] as $verb) {
            $this->postJson("{$base}/{$verb}")->assertForbidden();
        }

        expect($affiliation->fresh()->status)->toBe(AffiliationStatus::Pending);
    });
});

describe('List a branch\'s invitations (NS-16)', function (): void {
    it('lists only this branch\'s affiliations newest first with the barber name, and filters by status', function (): void {
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create(['name' => ['en' => 'Listed Barber', 'ar' => 'مدرج']]);
        $older = BarberAffiliationModel::factory()->create(['affiliable_id' => $branch->id, 'barber_id' => $barber->id, 'created_at' => now()->subDay()]);
        $newer = BarberAffiliationModel::factory()->pending()->create(['affiliable_id' => $branch->id, 'created_at' => now()]);
        BarberAffiliationModel::factory()->create();
        $this->authenticateDashboardActor($branch);
        $url = INVITATIONS_URL."/branches/{$branch->id}/affiliations";

        $all = $this->getJson($url)->assertOk();
        expect(collect($all->json('data'))->pluck('id')->all())->toBe([$newer->id, $older->id])
            ->and($all->json('data.1.barber_name'))->toBe('Listed Barber');
        expect(collect($this->getJson("{$url}?status=pending")->json('data'))->pluck('id')->all())->toBe([$newer->id])
            ->and($this->getJson("{$url}?status=terminated")->json('data'))->toBe([]);
    });

    it('rejects an unknown status filter and denies another branch, a barber and anonymous callers', function (): void {
        $branch = BranchModel::factory()->create();
        $url = INVITATIONS_URL."/branches/{$branch->id}/affiliations";

        $this->getJson($url)->assertUnauthorized();
        $this->authenticateDashboardActor($branch);
        $this->getJson("{$url}?status=banana")->assertUnprocessable()->assertJsonValidationErrors('status');
        invitationsSwitchTo(BranchModel::factory()->create());
        $this->getJson($url)->assertNotFound();
        invitationsSwitchTo(BarberModel::factory()->create());
        $this->getJson($url)->assertForbidden();
    });
});
