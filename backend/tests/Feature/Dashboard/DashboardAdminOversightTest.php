<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

const OVERSIGHT_URL = '/api/v1/dashboard';

/** @return array{brandA: BrandModel, brandB: BrandModel, a1: BranchModel, a2: BranchModel, b1: BranchModel} */
function oversightWorld(): array
{
    $brandA = BrandModel::factory()->create();
    $brandB = BrandModel::factory()->create();

    return [
        'brandA' => $brandA,
        'brandB' => $brandB,
        'a1' => BranchModel::factory()->create(['brand_id' => $brandA->id]),
        'a2' => BranchModel::factory()->create(['brand_id' => $brandA->id]),
        'b1' => BranchModel::factory()->create(['brand_id' => $brandB->id]),
    ];
}

function oversightStylistAt(BranchModel $branch): BarberModel
{
    $barber = BarberModel::factory()->create();
    ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $barber->id]);

    return $barber;
}

function oversightIds(string $url): array
{
    return collect(test()->getJson($url)->assertOk()->json('data'))->pluck('id')->sort()->values()->all();
}

/** NS-09: the admin reads every branch's data; a filter narrows a list but never widens an actor's scope. */
describe('Stylists branch_id filter', function (): void {
    it('narrows an admin to one branch and shows every stylist without a filter', function (): void {
        $world = oversightWorld();
        $first = oversightStylistAt($world['a1']);
        $second = oversightStylistAt($world['b1']);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        expect(oversightIds(OVERSIGHT_URL.'/stylists'))->toEqualCanonicalizing([$first->id, $second->id])
            ->and(oversightIds(OVERSIGHT_URL."/stylists?branch_id={$world['a1']->id}"))->toBe([$first->id])
            ->and(oversightIds(OVERSIGHT_URL.'/stylists?branch_id='.fake()->uuid()))->toBe([]);
    });

    it('never widens a manager to another branch, and narrows an owner inside their brand', function (): void {
        $world = oversightWorld();
        $mine = oversightStylistAt($world['a1']);
        $sibling = oversightStylistAt($world['a2']);
        oversightStylistAt($world['b1']);

        $this->authenticateDashboardActor($world['a1']);
        expect(oversightIds(OVERSIGHT_URL."/stylists?branch_id={$world['b1']->id}"))->toBe([])
            ->and(oversightIds(OVERSIGHT_URL."/stylists?branch_id={$world['a2']->id}"))->toBe([]);

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $owner = ClientModel::find($world['brandA']->owner_id);
        $this->authenticateDashboardActor($owner);
        expect(oversightIds(OVERSIGHT_URL.'/stylists'))->toEqualCanonicalizing([$mine->id, $sibling->id])
            ->and(oversightIds(OVERSIGHT_URL."/stylists?branch_id={$world['a2']->id}"))->toBe([$sibling->id])
            ->and(oversightIds(OVERSIGHT_URL."/stylists?branch_id={$world['b1']->id}"))->toBe([]);
    });

    it('rejects a malformed branch id', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson(OVERSIGHT_URL.'/stylists?branch_id=not-a-uuid')->assertUnprocessable()->assertJsonValidationErrors('branch_id');
    });
});

describe('Services brand_id filter', function (): void {
    it('narrows an admin to one brand and leaves barber-owned services out of a brand filter', function (): void {
        $world = oversightWorld();
        $a = OfferedServiceModel::factory()->create(['serviceable_id' => $world['brandA']->id]);
        $b = OfferedServiceModel::factory()->create(['serviceable_id' => $world['brandB']->id]);
        $own = OfferedServiceModel::factory()->create(['serviceable_type' => ServiceableTypeEnum::Barber, 'serviceable_id' => BarberModel::factory()->create()->id]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        expect(oversightIds(OVERSIGHT_URL."/services?brand_id={$world['brandA']->id}"))->toBe([$a->id])
            ->and(oversightIds(OVERSIGHT_URL.'/services'))->toContain($a->id, $b->id, $own->id);
    });

    it('never widens a manager or an owner to another brand', function (): void {
        $world = oversightWorld();
        $a = OfferedServiceModel::factory()->create(['serviceable_id' => $world['brandA']->id]);
        OfferedServiceModel::factory()->create(['serviceable_id' => $world['brandB']->id]);

        $this->authenticateDashboardActor($world['a1']);
        expect(oversightIds(OVERSIGHT_URL."/services?brand_id={$world['brandB']->id}"))->toBe([])
            ->and(oversightIds(OVERSIGHT_URL."/services?brand_id={$world['brandA']->id}"))->toBe([$a->id]);

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->authenticateDashboardActor(ClientModel::find($world['brandA']->owner_id));
        expect(oversightIds(OVERSIGHT_URL."/services?brand_id={$world['brandB']->id}"))->toBe([])
            ->and(oversightIds(OVERSIGHT_URL.'/services'))->toBe([$a->id]);
    });

    it('rejects a malformed brand id', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson(OVERSIGHT_URL.'/services?brand_id=nope')->assertUnprocessable()->assertJsonValidationErrors('brand_id');
    });
});

describe('Chairs brand_id filter', function (): void {
    it('narrows an admin by brand, by branch and by both, and finds nothing when they disagree', function (): void {
        $world = oversightWorld();
        $a1 = ChairModel::factory()->create(['branch_id' => $world['a1']->id]);
        $a2 = ChairModel::factory()->create(['branch_id' => $world['a2']->id]);
        $b1 = ChairModel::factory()->create(['branch_id' => $world['b1']->id]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        expect(oversightIds(OVERSIGHT_URL."/chairs?brand_id={$world['brandA']->id}"))->toEqualCanonicalizing([$a1->id, $a2->id])
            ->and(oversightIds(OVERSIGHT_URL."/chairs?brand_id={$world['brandB']->id}"))->toBe([$b1->id])
            ->and(oversightIds(OVERSIGHT_URL."/chairs?brand_id={$world['brandA']->id}&branch_id={$world['a2']->id}"))->toBe([$a2->id])
            ->and(oversightIds(OVERSIGHT_URL."/chairs?brand_id={$world['brandA']->id}&branch_id={$world['b1']->id}"))->toBe([]);
    });

    it('never widens a manager or an owner to another brand', function (): void {
        $world = oversightWorld();
        $mine = ChairModel::factory()->create(['branch_id' => $world['a1']->id]);
        ChairModel::factory()->create(['branch_id' => $world['b1']->id]);

        $this->authenticateDashboardActor($world['a1']);
        expect(oversightIds(OVERSIGHT_URL."/chairs?brand_id={$world['brandB']->id}"))->toBe([])
            ->and(oversightIds(OVERSIGHT_URL."/chairs?brand_id={$world['brandA']->id}"))->toBe([$mine->id]);

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->authenticateDashboardActor(ClientModel::find($world['brandA']->owner_id));
        expect(oversightIds(OVERSIGHT_URL."/chairs?brand_id={$world['brandB']->id}"))->toBe([]);
    });

    it('rejects a malformed brand id and an out-of-range page size', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson(OVERSIGHT_URL.'/chairs?brand_id=nope')->assertUnprocessable()->assertJsonValidationErrors('brand_id');
        $this->getJson(OVERSIGHT_URL.'/chairs?per_page=1000')->assertUnprocessable()->assertJsonValidationErrors('per_page');
    });
});

describe('Admin per-branch oversight reads', function (): void {
    it('lets the admin read reviews, opening hours, affiliations and job postings of any branch', function (string $path): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson(OVERSIGHT_URL."/branches/{$branch->id}/{$path}")->assertOk();
    })->with(['reviews', 'opening-hours', 'affiliations', 'job-postings']);

    it('answers 404 for a manager of another branch on the same routes', function (string $path): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor(BranchModel::factory()->create());

        $this->getJson(OVERSIGHT_URL."/branches/{$branch->id}/{$path}")->assertNotFound();
    })->with(['reviews', 'opening-hours', 'affiliations', 'job-postings']);

    it('keeps the job board write and application routes closed to the platform admin', function (): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->postJson(OVERSIGHT_URL."/branches/{$branch->id}/job-postings", [
            'title' => ['en' => 'Barber', 'ar' => 'حلاق'],
            'description' => ['en' => 'Join us', 'ar' => 'انضم'],
        ])->assertForbidden();
    });
});
