<?php

declare(strict_types=1);

use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Core\Constants\ValidationLimitConstants;

function overLimit(int $limit): string
{
    return str_repeat('a', $limit + 1);
}

function jobPostingPayload(array $overrides = []): array
{
    return array_replace_recursive([
        'title' => ['en' => 'Barber', 'ar' => 'حلاق'],
        'description' => ['en' => 'Cuts hair', 'ar' => 'يقص الشعر'],
    ], $overrides);
}

describe('password fields are capped without a forced minimum', function (): void {
    it('rejects an over-long password with 422', function (string $uri, array $payload): void {
        $this->postJson($uri, [...$payload, 'password' => overLimit(ValidationLimitConstants::VALIDATION_PASSWORD_MAX)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');
    })->with([
        'client login' => ['/api/v1/client/login', ['email' => 'a@example.com']],
        'barber login' => ['/api/v1/barber/login', ['email' => 'a@example.com']],
        'branch login' => ['/api/v1/branch/login', ['email' => 'a@example.com']],
        'dashboard login' => ['/api/v1/dashboard/login', ['email' => 'a@example.com', 'actor_type' => 'admin']],
    ]);

    it('does not reject a short legacy password on validation', function (string $uri): void {
        $this->postJson($uri, ['email' => 'a@example.com', 'password' => 'x'])
            ->assertJsonMissingValidationErrors('password');
    })->with([
        'client login' => '/api/v1/client/login',
        'barber login' => '/api/v1/barber/login',
        'branch login' => '/api/v1/branch/login',
    ]);
});

describe('job posting bounds', function (): void {
    beforeEach(function (): void {
        $this->actingAs(BranchModel::factory()->create(), 'branch_api');
    });

    it('rejects values beyond the length limits with 422', function (array $overrides, string $error): void {
        $this->postJson('/api/v1/branch/job-postings', jobPostingPayload($overrides))
            ->assertUnprocessable()
            ->assertJsonValidationErrors($error);
    })->with([
        'title.en too long' => [['title' => ['en' => overLimit(ValidationLimitConstants::VALIDATION_TITLE_MAX)]], 'title.en'],
        'title.ar too long' => [['title' => ['ar' => overLimit(ValidationLimitConstants::VALIDATION_TITLE_MAX)]], 'title.ar'],
        'description.en too long' => [['description' => ['en' => overLimit(ValidationLimitConstants::VALIDATION_DESCRIPTION_MAX)]], 'description.en'],
        'location too long' => [['location' => overLimit(ValidationLimitConstants::VALIDATION_SHORT_TEXT_MAX)], 'location'],
        'requirements.en too long' => [['requirements' => ['en' => overLimit(ValidationLimitConstants::VALIDATION_DESCRIPTION_MAX)]], 'requirements.en'],
        'unknown locale key' => [['title' => ['fr' => 'Coiffeur']], 'title'],
    ]);

    it('accepts values exactly at the limits', function (): void {
        $this->postJson('/api/v1/branch/job-postings', jobPostingPayload([
            'title' => ['en' => str_repeat('a', ValidationLimitConstants::VALIDATION_TITLE_MAX)],
            'location' => str_repeat('a', ValidationLimitConstants::VALIDATION_SHORT_TEXT_MAX),
        ]))->assertJsonMissingValidationErrors(['title.en', 'location']);
    });
});

describe('chair layout bounds', function (): void {
    it('rejects out-of-range layout values with 422', function (array $layout, string $error): void {
        $branch = BranchModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
        $this->actingAs($branch, 'branch_api');

        $this->patchJson("/api/v1/chairs/{$chair->id}", ['layout_settings' => $layout])
            ->assertUnprocessable()
            ->assertJsonValidationErrors($error);
    })->with([
        'x above max' => [['position_x' => ValidationLimitConstants::VALIDATION_LAYOUT_POSITION_MAX + 1], 'layout_settings.position_x'],
        'y below zero' => [['position_y' => -1], 'layout_settings.position_y'],
        'width below min' => [['width' => 0], 'layout_settings.width'],
        'height above max' => [['height' => ValidationLimitConstants::VALIDATION_LAYOUT_POSITION_MAX + 1], 'layout_settings.height'],
        'rotation above 360' => [['rotation' => 361], 'layout_settings.rotation'],
        'rotation below -360' => [['rotation' => -361], 'layout_settings.rotation'],
        'unknown key' => [['evil' => 'x'], 'layout_settings'],
    ]);
});

describe('list bounds', function (): void {
    it('rejects over-sized and empty service id lists on the slots endpoint', function (array $serviceIds): void {
        $branch = BranchModel::factory()->create();

        $this->getJson("/api/v1/branches/{$branch->id}/slots?".http_build_query([
            'date' => now()->addDay()->toDateString(),
            'service_ids' => $serviceIds,
            'barber_id' => fake()->uuid(),
        ]))->assertUnprocessable()->assertJsonValidationErrors('service_ids');
    })->with([
        'empty' => [[]],
        'too many' => [fn () => array_map(fn () => fake()->uuid(), range(1, ValidationLimitConstants::VALIDATION_LIST_MAX + 1))],
    ]);

    it('rejects over-sized tag lists and an out-of-range radius on explore search', function (array $query, string $error): void {
        $this->getJson('/api/v1/explore/search?'.http_build_query(['latitude' => 24.7, 'longitude' => 46.6, 'radius' => 5, ...$query]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors($error);
    })->with([
        'too many tags' => [['tag_ids' => array_map(fn () => '00000000-0000-4000-8000-000000000000', range(1, 51))], 'tag_ids'],
        'radius too large' => [['radius' => ValidationLimitConstants::VALIDATION_RADIUS_KM_MAX + 1], 'radius'],
        'negative radius' => [['radius' => -1], 'radius'],
        'face shape too long' => [['face_shape_compatible' => overLimit(ValidationLimitConstants::VALIDATION_SHORT_TEXT_MAX)], 'face_shape_compatible'],
    ]);
});
