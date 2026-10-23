<?php

declare(strict_types=1);

namespace Modules\ClientInteraction\Services;

use Illuminate\Http\Request;
use Modules\Client\Models\ClientModel;
use Modules\ClientInteraction\Enums\InteractableTypeEnum;
use Modules\ClientInteraction\Enums\InteractionTypeEnum;
use Modules\ClientInteraction\Jobs\RecordClientInteractionJob;

/**
 * The single entry point for interaction logging (INT-1/INT-2, Task 47).
 * Only signed-in clients are logged; the row is written by a queued job so
 * discovery latency is unaffected. `context` always carries the screen name
 * (`X-Client-Screen` header, else the route name) and the active universe.
 */
final class ClientInteractionRecorder
{
    public function view(Request $request, InteractableTypeEnum $type, string $id): void
    {
        $this->record($request, InteractionTypeEnum::View, $type, $id, []);
    }

    /** @param array<string, mixed> $filters */
    public function search(Request $request, ?string $query, array $filters, ?string $universe, int $resultCount): void
    {
        $this->record($request, InteractionTypeEnum::Search, null, null, [
            'query' => $query,
            'filters' => $filters,
            'universe' => $universe,
            'result_count' => $resultCount,
        ]);
    }

    public function favorite(Request $request, InteractableTypeEnum $type, string $id): void
    {
        $this->record($request, InteractionTypeEnum::Favorite, $type, $id, []);
    }

    /** @param array<string, mixed> $context */
    private function record(Request $request, InteractionTypeEnum $interaction, ?InteractableTypeEnum $type, ?string $id, array $context): void
    {
        $client = $request->user('client');
        if (! $client instanceof ClientModel) {
            return;
        }

        $screen = $request->header('X-Client-Screen');

        RecordClientInteractionJob::dispatch(
            (string) $client->getKey(),
            $interaction->value,
            $type?->value,
            $id,
            [
                'screen' => is_string($screen) && $screen !== '' ? mb_substr($screen, 0, 64) : $request->route()?->getName(),
                'universe' => $context['universe'] ?? $client->getAttribute('preferred_universe')?->value,
                ...$context,
            ],
        )->afterCommit();
    }
}
