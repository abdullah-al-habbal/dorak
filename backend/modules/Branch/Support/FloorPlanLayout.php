<?php

declare(strict_types=1);

namespace Modules\Branch\Support;

use Illuminate\Validation\Rules\Enum;
use Modules\Branch\Constants\BranchFloorPlanConstants;
use Modules\Branch\Enums\FloorDecorationType;
use Modules\Branch\Enums\FloorPlanCanvasUnit;
use Modules\Branch\Models\BranchModel;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

/**
 * Canvas size and static decoration components of a branch floor plan
 * (entity model §floor plan). Persisted on the branch next to the preset
 * and zones, and shared by the branch-account and dashboard contracts.
 */
final class FloorPlanLayout
{
    /** @return array<string, array<int, mixed>> */
    public static function rules(): array
    {
        return [
            'canvas' => ['sometimes', 'array'],
            'canvas.width' => ['required_with:canvas', 'numeric', 'gt:0', 'max:'.app(SettingsService::class)->int(SettingKey::FloorPlanMaxCanvasSize)],
            'canvas.height' => ['required_with:canvas', 'numeric', 'gt:0', 'max:'.app(SettingsService::class)->int(SettingKey::FloorPlanMaxCanvasSize)],
            'canvas.unit' => ['required_with:canvas', new Enum(FloorPlanCanvasUnit::class)],
            'decorations' => ['sometimes', 'array', 'max:'.app(SettingsService::class)->int(SettingKey::FloorPlanMaxDecorations)],
            'decorations.*.type' => ['required', new Enum(FloorDecorationType::class)],
            'decorations.*.x' => ['required', 'numeric', 'between:0,100'],
            'decorations.*.y' => ['required', 'numeric', 'between:0,100'],
            'decorations.*.width' => ['required', 'numeric', 'gt:0', 'max:100'],
            'decorations.*.height' => ['required', 'numeric', 'gt:0', 'max:100'],
            'decorations.*.label' => ['nullable', 'string', 'max:'.app(SettingsService::class)->int(SettingKey::FloorPlanMaxLabelLength)],
        ];
    }

    /**
     * @return array{preset: string|null, zones: array<int, mixed>, canvas: array<string, mixed>, decorations: array<int, mixed>}
     */
    public static function payload(BranchModel $branch): array
    {
        return [
            'preset' => $branch->floor_plan_preset?->value,
            'zones' => $branch->floor_plan_zones ?? [],
            'canvas' => $branch->floor_plan_canvas ?? BranchFloorPlanConstants::BRANCH_FLOOR_PLAN_DEFAULT_CANVAS,
            'decorations' => $branch->floor_plan_decorations ?? [],
        ];
    }
}
