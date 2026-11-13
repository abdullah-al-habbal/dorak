<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Constants\BranchFloorPlanConstants;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Constants\BrandFeatureConstants;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\Settings\Constants\SettingsConstants;

/** The migration's column default: a branch nobody edited yet. */
const PLAN_DEFAULT_PRESET = 'standard';

function planUrl(BranchModel $branch): string
{
    return "/api/v1/dashboard/branches/{$branch->id}/floor-plan";
}

/** @return array<int, array<string, mixed>> */
function planZones(): array
{
    return [
        ['zone' => 'men', 'x' => 0, 'y' => 0, 'width' => 50, 'height' => 100],
        ['zone' => 'women', 'x' => 50, 'y' => 0, 'width' => 50, 'height' => 100],
    ];
}

function planDecoration(array $overrides = []): array
{
    return ['type' => 'mirror', 'x' => 1, 'y' => 2, 'width' => 10, 'height' => 5, ...$overrides];
}

/** NS-15: floor plan read and save from the dashboard. */
describe('Read the floor plan (NS-15)', function (): void {
    it('returns the default canvas, no decorations and the branch chairs with their barber', function (): void {
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $barber->id]);
        ChairModel::factory()->create();
        $this->authenticateDashboardActor($branch);

        $this->getJson(planUrl($branch))
            ->assertOk()
            ->assertJsonPath('data.branch_id', $branch->id)
            ->assertJsonPath('data.floor_plan.canvas', BranchFloorPlanConstants::BRANCH_FLOOR_PLAN_DEFAULT_CANVAS)
            ->assertJsonPath('data.floor_plan.decorations', [])
            ->assertJsonPath('data.floor_plan.zones', [])
            ->assertJsonCount(1, 'data.chairs')
            ->assertJsonPath('data.chairs.0.id', $chair->id);
    });
});

describe('Save the floor plan (NS-15)', function (): void {
    it('saves preset, canvas and decorations and serves them back', function (): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor($branch);

        $this->patchJson(planUrl($branch), [
            'preset' => 'compact',
            'canvas' => ['width' => 30, 'height' => 12.5, 'unit' => 'ft'],
            'decorations' => [planDecoration(['label' => 'Front mirror']), planDecoration(['type' => 'plant', 'x' => 90, 'y' => 90])],
        ])->assertOk()->assertJsonPath('data.preset', 'compact')->assertJsonPath('data.canvas.unit', 'ft');

        $this->getJson(planUrl($branch))
            ->assertOk()
            ->assertJsonPath('data.floor_plan.canvas.height', 12.5)
            ->assertJsonCount(2, 'data.floor_plan.decorations')
            ->assertJsonPath('data.floor_plan.decorations.0.label', 'Front mirror');
    });

    it('keeps the saved canvas and decorations when a later save omits them', function (): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor($branch);
        $this->patchJson(planUrl($branch), [
            'preset' => 'standard',
            'canvas' => ['width' => 40, 'height' => 20, 'unit' => 'm'],
            'decorations' => [planDecoration()],
        ])->assertOk();

        $this->patchJson(planUrl($branch), ['preset' => 'compact'])->assertOk()->assertJsonPath('data.preset', 'compact');

        $this->getJson(planUrl($branch))->assertJsonPath('data.floor_plan.canvas.width', 40)->assertJsonCount(1, 'data.floor_plan.decorations');
    });

    it('can clear every decoration with an empty list', function (): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor($branch);
        $this->patchJson(planUrl($branch), ['preset' => 'standard', 'decorations' => [planDecoration()]])->assertOk();

        $this->patchJson(planUrl($branch), ['preset' => 'standard', 'decorations' => []])->assertOk()->assertJsonPath('data.decorations', []);
    });

    it('keeps both zones for a zoned layout and drops them when the preset changes', function (): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor($branch);

        $this->patchJson(planUrl($branch), ['preset' => 'unisex_zoned', 'zones' => planZones()])
            ->assertOk()
            ->assertJsonCount(2, 'data.zones');
        $this->patchJson(planUrl($branch), ['preset' => 'standard', 'zones' => planZones()])
            ->assertOk()
            ->assertJsonPath('data.zones', []);
    });

    it('refuses a zoned layout with a missing or duplicated zone', function (array $zones): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor($branch);

        $this->patchJson(planUrl($branch), ['preset' => 'unisex_zoned', 'zones' => $zones])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('zones');

        expect($branch->fresh()->floor_plan_preset->value)->toBe(PLAN_DEFAULT_PRESET);
    })->with([
        'none' => [[]],
        'only men' => [[['zone' => 'men', 'x' => 0, 'y' => 0, 'width' => 50, 'height' => 100]]],
        'men twice' => [[['zone' => 'men', 'x' => 0, 'y' => 0, 'width' => 50, 'height' => 100], ['zone' => 'men', 'x' => 50, 'y' => 0, 'width' => 50, 'height' => 100]]],
    ]);

    it('validates the preset, canvas, zones and decorations', function (array $payload, string $field): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor($branch);

        $this->patchJson(planUrl($branch), $payload)->assertUnprocessable()->assertJsonValidationErrors($field);

        expect($branch->fresh()->floor_plan_preset->value)->toBe(PLAN_DEFAULT_PRESET);
    })->with([
        'missing preset' => [[], 'preset'],
        'unknown preset' => [['preset' => 'loft'], 'preset'],
        'canvas without unit' => [['preset' => 'standard', 'canvas' => ['width' => 10, 'height' => 10]], 'canvas.unit'],
        'canvas unit unknown' => [['preset' => 'standard', 'canvas' => ['width' => 10, 'height' => 10, 'unit' => 'cm']], 'canvas.unit'],
        'canvas zero height' => [['preset' => 'standard', 'canvas' => ['width' => 10, 'height' => 0, 'unit' => 'm']], 'canvas.height'],
        'canvas above the maximum' => [['preset' => 'standard', 'canvas' => ['width' => SettingsConstants::SETTING_FLOOR_PLAN_MAX_CANVAS_SIZE_DEFAULT + 1, 'height' => 10, 'unit' => 'm']], 'canvas.width'],
        'decoration unknown type' => [['preset' => 'standard', 'decorations' => [planDecoration(['type' => 'sofa'])]], 'decorations.0.type'],
        'decoration x above 100' => [['preset' => 'standard', 'decorations' => [planDecoration(['x' => 101])]], 'decorations.0.x'],
        'decoration y below 0' => [['preset' => 'standard', 'decorations' => [planDecoration(['y' => -1])]], 'decorations.0.y'],
        'decoration zero width' => [['preset' => 'standard', 'decorations' => [planDecoration(['width' => 0])]], 'decorations.0.width'],
        'decoration width above 100' => [['preset' => 'standard', 'decorations' => [planDecoration(['width' => 101])]], 'decorations.0.width'],
        'decoration label too long' => [['preset' => 'standard', 'decorations' => [planDecoration(['label' => str_repeat('a', SettingsConstants::SETTING_FLOOR_PLAN_MAX_LABEL_LENGTH_DEFAULT + 1)])]], 'decorations.0.label'],
        'too many decorations' => [['preset' => 'standard', 'decorations' => array_fill(0, SettingsConstants::SETTING_FLOOR_PLAN_MAX_DECORATIONS_DEFAULT + 1, planDecoration())], 'decorations'],
        'zone unknown name' => [['preset' => 'unisex_zoned', 'zones' => [['zone' => 'kids', 'x' => 0, 'y' => 0, 'width' => 50, 'height' => 100]]], 'zones.0.zone'],
        'zone above bounds' => [['preset' => 'unisex_zoned', 'zones' => [['zone' => 'men', 'x' => 0, 'y' => 0, 'width' => 150, 'height' => 100]]], 'zones.0.width'],
    ]);
});

describe('Who may touch a floor plan (NS-15)', function (): void {
    it('lets an owner edit a branch of their brand and refuses a stranger owner with 404', function (): void {
        $owner = ClientModel::factory()->create();
        $branch = BranchModel::factory()->create(['brand_id' => BrandModel::factory()->create(['owner_id' => $owner->id])->id]);
        $stranger = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $stranger->id]);

        $this->authenticateDashboardActor($owner);
        $this->patchJson(planUrl($branch), ['preset' => 'compact'])->assertOk();

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->authenticateDashboardActor($stranger);
        $this->getJson(planUrl($branch))->assertNotFound();
        $this->patchJson(planUrl($branch), ['preset' => 'standard'])->assertNotFound();

        expect($branch->fresh()->floor_plan_preset->value)->toBe('compact');
    });

    it('rejects anonymous callers and barber sessions', function (): void {
        $branch = BranchModel::factory()->create();

        $this->getJson(planUrl($branch))->assertUnauthorized();
        $this->patchJson(planUrl($branch), ['preset' => 'compact'])->assertUnauthorized();

        $this->authenticateDashboardActor(BarberModel::factory()->create());
        $this->getJson(planUrl($branch))->assertForbidden();
        $this->patchJson(planUrl($branch), ['preset' => 'compact'])->assertForbidden();
        expect($branch->fresh()->floor_plan_preset->value)->toBe(PLAN_DEFAULT_PRESET);
    });

    it('keeps an extra branch read-only after a multi_branch downgrade', function (): void {
        $owner = ClientModel::factory()->create();
        $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);
        $original = BranchModel::factory()->create(['brand_id' => $brand->id]);
        $extra = BranchModel::factory()->create(['brand_id' => $brand->id]);
        app(BrandFeatures::class)->set($brand, [BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH => false]);
        $this->authenticateDashboardActor($owner);

        $this->patchJson(planUrl($original), ['preset' => 'compact'])->assertOk();
        $this->patchJson(planUrl($extra), ['preset' => 'compact'])->assertForbidden();
        $this->getJson(planUrl($extra))->assertOk();
        expect($extra->fresh()->floor_plan_preset->value)->toBe(PLAN_DEFAULT_PRESET);
    });

    it('lets the platform admin save any branch', function (): void {
        $branch = BranchModel::factory()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(planUrl($branch), ['preset' => 'compact', 'decorations' => [planDecoration()]])->assertOk();

        expect($branch->fresh()->floor_plan_decorations)->toHaveCount(1);
    });
});

/** The editor saves each moved chair through PUT /chairs/{id}. */
describe('Save a chair position (NS-15)', function (): void {
    function planChairPayload(ChairModel $chair, array $layout): array
    {
        return [
            'branch_id' => $chair->branch_id,
            'label' => $chair->label,
            'floor_zone' => 'shared',
            'status' => $chair->status->value,
            'layout_settings' => $layout,
        ];
    }

    it('persists position, size, rotation and shape', function (): void {
        $branch = BranchModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
        $this->authenticateDashboardActor($branch);

        $this->putJson("/api/v1/dashboard/chairs/{$chair->id}", planChairPayload($chair, ['position_x' => 120, 'position_y' => 80, 'width' => 60, 'height' => 60, 'rotation' => 45, 'shape' => 'round']))
            ->assertOk()
            ->assertJsonPath('data.layout_settings.position_x', 120)
            ->assertJsonPath('data.layout_settings.rotation', 45);

        expect($chair->fresh()->layout_settings)->toMatchArray(['position_x' => 120, 'position_y' => 80, 'rotation' => 45]);
    });

    it('rejects an unknown key, a zero size and a missing coordinate, and another branch\'s chair is 404', function (): void {
        $branch = BranchModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
        $foreign = ChairModel::factory()->create();
        $this->authenticateDashboardActor($branch);
        $valid = ['position_x' => 10, 'position_y' => 10, 'width' => 60, 'height' => 60];

        $this->putJson("/api/v1/dashboard/chairs/{$chair->id}", planChairPayload($chair, [...$valid, 'color' => 'red']))->assertUnprocessable()->assertJsonValidationErrors('layout_settings');
        $this->putJson("/api/v1/dashboard/chairs/{$chair->id}", planChairPayload($chair, [...$valid, 'width' => 0]))->assertUnprocessable()->assertJsonValidationErrors('layout_settings.width');
        $this->putJson("/api/v1/dashboard/chairs/{$chair->id}", planChairPayload($chair, ['position_y' => 10, 'width' => 60, 'height' => 60]))->assertUnprocessable()->assertJsonValidationErrors('layout_settings.position_x');
        $this->putJson("/api/v1/dashboard/chairs/{$foreign->id}", planChairPayload($foreign, $valid))->assertNotFound();
    });
});
