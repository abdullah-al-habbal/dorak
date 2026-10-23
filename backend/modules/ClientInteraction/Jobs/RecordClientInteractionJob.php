<?php

declare(strict_types=1);

namespace Modules\ClientInteraction\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Attributes\Tries;
use Modules\Client\Models\ClientModel;
use Modules\ClientInteraction\Models\ClientInteractionLogModel;

/**
 * Writes one interaction log row off the request path (INT-1, Task 47).
 */
#[Tries(3)]
class RecordClientInteractionJob implements ShouldQueue
{
    use Dispatchable, Queueable;

    /** @param array<string, mixed> $context */
    public function __construct(
        public readonly string $clientId,
        public readonly string $interactionType,
        public readonly ?string $interactableType,
        public readonly ?string $interactableId,
        public readonly array $context,
    ) {}

    public function handle(): void
    {
        if (! ClientModel::query()->whereKey($this->clientId)->exists()) {
            return;
        }

        ClientInteractionLogModel::query()->create([
            'client_id' => $this->clientId,
            'interaction_type' => $this->interactionType,
            'interactable_type' => $this->interactableType,
            'interactable_id' => $this->interactableId,
            'context' => $this->context,
        ]);
    }
}
