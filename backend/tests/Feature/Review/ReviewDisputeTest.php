<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Client\Models\ClientModel;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Models\ReviewModel;

it('lets a review author dispute a published review', function () {
    $client = ClientModel::factory()->create();
    $review = ReviewModel::factory()->create([
        'author_id' => $client->id,
        'author_type' => 'client',
        'status' => ReviewStatus::Published,
    ]);
    $this->actingAs($client, 'client');

    $response = $this->postJson("/api/v1/client/reviews/{$review->id}/dispute", [
        'reason' => 'This review was submitted against the wrong appointment.',
    ]);

    $response->assertOk()->assertJsonPath('data.status', ReviewStatus::Disputed->value);
    $this->assertDatabaseHas('reviews', [
        'id' => $review->id,
        'status' => ReviewStatus::Disputed->value,
        'dispute_reason' => 'This review was submitted against the wrong appointment.',
    ]);
});

it('lets an admin resolve a dispute outside its client response window', function () {
    $review = ReviewModel::factory()->create([
        'status' => ReviewStatus::Disputed,
        'disputed_at' => now()->subHours(49),
    ]);
    $admin = AdminModel::factory()->create();
    $this->actingAs($admin, 'admin');

    $response = $this->patchJson("/api/v1/admin/reviews/{$review->id}/resolve", [
        'status' => ReviewStatus::Hidden->value,
    ]);

    $response->assertOk()->assertJsonPath('data.status', ReviewStatus::Hidden->value);
    $this->assertDatabaseHas('reviews', [
        'id' => $review->id,
        'status' => ReviewStatus::Hidden->value,
        'resolved_by' => $admin->id,
    ]);
});
