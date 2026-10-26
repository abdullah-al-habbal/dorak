<?php

declare(strict_types=1);

use Modules\Branch\Models\BranchModel;

describe('Floor plan canvas and decorations', function (): void {
    it('persists canvas and decorations from the branch account and serves them publicly', function (): void {
        $branch = BranchModel::factory()->create();
        $this->actingAs($branch, 'branch_api');

        $this->patchJson('/api/v1/branch/floor-plan', [
            'preset' => 'standard',
            'canvas' => ['width' => 30, 'height' => 12, 'unit' => 'm'],
            'decorations' => [
                ['type' => 'waiting_area', 'x' => 5, 'y' => 5, 'width' => 20, 'height' => 15, 'label' => 'Lounge'],
            ],
        ])->assertOk()
            ->assertJsonPath('data.canvas.width', 30)
            ->assertJsonPath('data.decorations.0.type', 'waiting_area');

        $this->getJson("/api/v1/branches/{$branch->id}/floor-plan?".http_build_query([
            'starts_at' => now()->addDay()->toIso8601ZuluString(),
            'duration' => 30,
        ]))->assertOk()
            ->assertJsonPath('data.floor_plan.canvas.unit', 'm')
            ->assertJsonPath('data.floor_plan.decorations.0.label', 'Lounge');
    });

    it('defaults the canvas when none was saved', function (): void {
        $branch = BranchModel::factory()->create();

        $this->getJson("/api/v1/branches/{$branch->id}/floor-plan?".http_build_query([
            'starts_at' => now()->addDay()->toIso8601ZuluString(),
            'duration' => 30,
        ]))->assertOk()
            ->assertJsonPath('data.floor_plan.canvas.unit', 'm')
            ->assertJsonPath('data.floor_plan.decorations', []);
    });

    it('rejects an invalid canvas', function (): void {
        $this->actingAs(BranchModel::factory()->create(), 'branch_api');

        $this->patchJson('/api/v1/branch/floor-plan', [
            'preset' => 'standard',
            'canvas' => ['width' => 0, 'height' => 12, 'unit' => 'parsec'],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['canvas.width', 'canvas.unit']);
    });

    it('rejects an unknown decoration type', function (): void {
        $this->actingAs(BranchModel::factory()->create(), 'branch_api');

        $this->patchJson('/api/v1/branch/floor-plan', [
            'preset' => 'standard',
            'decorations' => [['type' => 'jacuzzi', 'x' => 1, 'y' => 1, 'width' => 5, 'height' => 5]],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['decorations.0.type']);
    });
});
