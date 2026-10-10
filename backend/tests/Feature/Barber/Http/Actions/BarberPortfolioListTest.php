<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Barber\Models\BarberPortfolioPhotoModel;

beforeEach(function (): void {
    $this->barber = BarberModel::factory()->create();
    $this->actingAs($this->barber, 'barber');
});

it('lists only the authenticated barber portfolio media in sort order', function (): void {
    $firstPhoto = BarberPortfolioPhotoModel::factory()->create([
        'barber_id' => $this->barber->id,
        'path' => 'portfolio/'.$this->barber->id.'/first.jpg',
        'sort_order' => 1,
    ]);
    $secondPhoto = BarberPortfolioPhotoModel::factory()->create([
        'barber_id' => $this->barber->id,
        'path' => 'portfolio/'.$this->barber->id.'/second.jpg',
        'sort_order' => 2,
    ]);
    BarberPortfolioPhotoModel::factory()->create([
        'barber_id' => BarberModel::factory(),
    ]);

    $this->getJson('/api/v1/barber/portfolio')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $firstPhoto->id)
        ->assertJsonPath('data.0.sort_order', 1)
        ->assertJsonPath('data.1.id', $secondPhoto->id)
        ->assertJsonPath('data.1.sort_order', 2)
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'url', 'sort_order'],
            ],
        ]);
});

it('requires barber authentication to list portfolio media', function (): void {
    $this->app->get('auth')->forgetGuards();

    $this->getJson('/api/v1/barber/portfolio')->assertUnauthorized();
});
