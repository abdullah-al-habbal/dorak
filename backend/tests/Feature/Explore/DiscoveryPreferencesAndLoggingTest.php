<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\ClientInteraction\Enums\InteractionTypeEnum;
use Modules\ClientInteraction\Models\ClientDiscoveryPreferenceModel;
use Modules\ClientInteraction\Models\ClientInteractionLogModel;

function preferringClient(array $preferences = []): ClientModel
{
    $client = ClientModel::factory()->create();
    if ($preferences !== []) {
        ClientDiscoveryPreferenceModel::query()->create(['client_id' => $client->id, ...$preferences]);
    }

    return $client;
}

function nearbyBranch(?BrandModel $brand = null): BranchModel
{
    return BranchModel::factory()->create([
        'latitude' => 33.5,
        'longitude' => 36.3,
        'brand_id' => ($brand ?? BrandModel::factory()->create())->id,
    ]);
}

describe('discovery preferences', function (): void {
    it('hides branches of hidden brands for that client only', function (): void {
        $hiddenBrand = BrandModel::factory()->create();
        $hidden = nearbyBranch($hiddenBrand);
        $visible = nearbyBranch();
        $client = preferringClient(['hidden_brand_ids' => [$hiddenBrand->id]]);

        $mine = $this->actingAs($client, 'client')->getJson('/api/v1/explore/branches?latitude=33.5&longitude=36.3&radius=10')->json('data.*.id');
        $this->app['auth']->forgetGuards();
        $theirs = $this->getJson('/api/v1/explore/branches?latitude=33.5&longitude=36.3&radius=10')->json('data.*.id');

        expect($mine)->toBe([$visible->id])
            ->and($theirs)->toEqualCanonicalizing([$visible->id, $hidden->id]);
    });

    it('applies hidden brands to the unified search too', function (): void {
        $hiddenBrand = BrandModel::factory()->create();
        nearbyBranch($hiddenBrand);
        $client = preferringClient(['hidden_brand_ids' => [$hiddenBrand->id]]);

        $this->actingAs($client, 'client')
            ->getJson('/api/v1/explore/search?latitude=33.5&longitude=36.3&radius=10')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    });

    it('uses the saved default radius when radius is omitted', function (): void {
        $near = nearbyBranch();
        BranchModel::factory()->create(['latitude' => 34.5, 'longitude' => 36.3]);
        $client = preferringClient(['default_radius' => 5]);

        $this->actingAs($client, 'client')
            ->getJson('/api/v1/explore/branches?latitude=33.5&longitude=36.3')
            ->assertOk()
            ->assertJsonPath('data.*.id', [$near->id]);
    });

    it('hides currently unavailable branches when the client turned show_unavailable off', function (): void {
        $withoutChairs = nearbyBranch();
        $client = preferringClient(['show_unavailable' => false]);

        $hiding = $this->actingAs($client, 'client')->getJson('/api/v1/explore/branches?latitude=33.5&longitude=36.3&radius=10')->json('data.*.id');
        $explicit = $this->actingAs($client, 'client')->getJson('/api/v1/explore/branches?latitude=33.5&longitude=36.3&radius=10&available_now=0')->json('data.*.id');

        expect($hiding)->not->toContain($withoutChairs->id)
            ->and($explicit)->toContain($withoutChairs->id);
    });

    it('still requires a radius from guests and clients without a default', function (): void {
        $this->getJson('/api/v1/explore/branches?latitude=33.5&longitude=36.3')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['radius']);

        $this->actingAs(preferringClient(), 'client')
            ->getJson('/api/v1/explore/barbers?latitude=33.5&longitude=36.3')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['radius']);
    });
});

describe('interaction logging', function (): void {
    it('logs one view when a client opens a branch or barber detail', function (): void {
        $branch = nearbyBranch();
        $barber = BarberModel::factory()->freelancer()->create();
        $client = preferringClient();

        $this->actingAs($client, 'client')->getJson("/api/v1/explore/branches/{$branch->id}", ['X-Client-Screen' => 'branch_detail'])->assertOk();
        $this->actingAs($client, 'client')->getJson("/api/v1/explore/barbers/{$barber->id}")->assertOk();

        $views = ClientInteractionLogModel::query()->where('client_id', $client->id)->where('interaction_type', InteractionTypeEnum::View)->get();
        expect($views)->toHaveCount(2)
            ->and($views->firstWhere('interactable_id', $branch->id)?->context['screen'])->toBe('branch_detail')
            ->and($views->firstWhere('interactable_id', $barber->id)?->interactable_type?->value)->toBe('barber');
    });

    it('logs a search with its query, filters and universe', function (): void {
        nearbyBranch();
        $client = preferringClient();

        $this->actingAs($client, 'client')
            ->getJson('/api/v1/explore/search?latitude=33.5&longitude=36.3&radius=10&q=royal&universe=women&rating_min=3')
            ->assertOk();

        $log = ClientInteractionLogModel::query()->sole();
        expect($log->interaction_type)->toBe(InteractionTypeEnum::Search)
            ->and($log->interactable_id)->toBeNull()
            ->and($log->context['query'])->toBe('royal')
            ->and($log->context['universe'])->toBe('women')
            ->and($log->context['filters'])->toMatchArray(['rating_min' => '3'])
            ->and($log->context)->toHaveKey('result_count');
    });

    it('does not log a plain map browse', function (): void {
        $this->actingAs(preferringClient(), 'client')
            ->getJson('/api/v1/explore/branches?latitude=33.5&longitude=36.3&radius=10')
            ->assertOk();

        expect(ClientInteractionLogModel::query()->count())->toBe(0);
    });

    it('logs one favorite when a client adds a favorite', function (): void {
        $branch = nearbyBranch();
        $client = preferringClient();

        $this->actingAs($client, 'client')
            ->postJson('/api/v1/client/favorites', ['favorable_id' => $branch->id, 'favorable_type' => 'branch'])
            ->assertCreated();

        $log = ClientInteractionLogModel::query()->sole();
        expect($log->interaction_type)->toBe(InteractionTypeEnum::Favorite)
            ->and($log->interactable_id)->toBe($branch->id);
    });

    it('writes nothing for guests', function (): void {
        $branch = nearbyBranch();

        $this->getJson("/api/v1/explore/branches/{$branch->id}")->assertOk();
        $this->getJson('/api/v1/explore/branches?latitude=33.5&longitude=36.3&radius=10&q=royal')->assertOk();

        expect(ClientInteractionLogModel::query()->count())->toBe(0);
    });
});
