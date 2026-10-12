<?php

declare(strict_types=1);

namespace Modules\ClientRecommendation\Console\Commands;

use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Laravel\Ai\Embeddings;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\ClientInteraction\Models\ClientFavoriteModel;
use Modules\ClientRecommendation\Enums\EdgeTypeEnum;
use Modules\ClientRecommendation\Models\ClientPreferenceVectorModel;
use Modules\ClientRecommendation\Models\EntityEmbeddingModel;
use Modules\ClientRecommendation\Models\RecommendationEdgeModel;
use Modules\ClientRecommendation\ValuesObjects\RecommendationFactorWeightsValueObject;
use Symfony\Component\Console\Input\InputOption;

#[Signature('recommend:recompute-vectors {--client-id=} {--force}')]
final class RecomputeClientVectorsCommand extends Command
{
    public function __construct()
    {
        parent::__construct();
        $this->setDescription(trans('clientrecommendation::messages.cli_description', [], 'en'));
        $definition = $this->getDefinition();
        $options = array_map(static fn (InputOption $option): InputOption => match ($option->getName()) {
            'client-id' => new InputOption('client-id', null, InputOption::VALUE_OPTIONAL, trans('clientrecommendation::messages.cli_client_id_option', [], 'en')),
            'force' => new InputOption('force', null, InputOption::VALUE_NONE, trans('clientrecommendation::messages.cli_force_option', [], 'en')),
            default => $option,
        }, $definition->getOptions());
        $definition->setOptions($options);
    }

    public function handle(): int
    {
        $clientId = $this->option('client-id');
        $clientId !== null
            ? $this->info($this->cli('cli_recomputing_client', ['client_id' => $clientId]))
            : $this->info($this->cli('cli_recomputing_all_clients'));

        ClientModel::query()
            ->when($clientId, fn ($q, $id) => $q->where('id', $id))
            ->chunk(100, function ($clients): void {
                foreach ($clients as $client) {
                    $this->processClient($client);
                }
            });

        $this->recomputeEntityEmbeddings($clientId);

        $this->info($this->cli('cli_done'));

        return self::SUCCESS;
    }

    private function recomputeEntityEmbeddings(?string $singleEntityId): void
    {
        $entityTypes = [
            BranchModel::class => [
                'type' => 'branch',
                'query' => BranchModel::query()->when($singleEntityId, fn ($q, $id) => $q->where('id', $id)),
                'label' => 'Branch',
            ],
            BarberModel::class => [
                'type' => 'barber',
                'query' => BarberModel::query()->when($singleEntityId, fn ($q, $id) => $q->where('id', $id)),
                'label' => 'Barber',
            ],
        ];

        foreach ($entityTypes as $modelClass => $config) {
            $config['query']
                ->chunk(100, function ($entities) use ($config): void {
                    foreach ($entities as $entity) {
                        $this->processEntity($entity, $config);
                    }
                });
        }
    }

    private function processEntity($entity, array $config): void
    {
        $signals = $this->gatherEntitySignals($entity, $config['type']);

        if (empty($signals)) {
            return;
        }

        $text = implode("\n", $signals);

        try {
            $response = Embeddings::for([$text])
                ->dimensions(1536)
                ->generate();

            $embedding = $response->embeddings[0] ?? null;

            if ($embedding === null) {
                $this->warn($this->cli('cli_embedding_missing', ['entity_type' => $config['type'], 'entity_id' => $entity->id]));

                return;
            }

            EntityEmbeddingModel::updateOrCreate(
                [
                    'entity_type' => $config['type'],
                    'entity_id' => $entity->id,
                ],
                [
                    'embedding' => $embedding,
                    'metadata' => [
                        'name' => $entity->name ?? $entity->id,
                        'signal_count' => count($signals),
                    ],
                    'computed_at' => now(),
                ]
            );

            $this->info($this->cli('cli_embedding_computed', ['entity_type' => $config['type'], 'entity_id' => $entity->id]));
        } catch (\Throwable $e) {
            $this->error($this->cli('cli_embedding_failed', ['entity_type' => $config['type'], 'entity_id' => $entity->id, 'reason' => $e->getMessage()]));
        }
    }

    private function gatherEntitySignals($entity, string $type): array
    {
        $signals = [];

        if ($type === 'branch') {
            if ($entity->name) {
                $signals[] = "branch name: {$entity->name}";
            }

            $services = $entity->offeredServices()->with('catalogItem')->get();
            foreach ($services as $service) {
                $catalogItem = $service->catalogItem;
                if ($catalogItem) {
                    $signals[] = "offers service: {$catalogItem->name}";
                    if ($catalogItem->description) {
                        $signals[] = "service description: {$catalogItem->description}";
                    }
                }
            }

            if ($entity->brand) {
                $signals[] = "brand: {$entity->brand->name}";
            }
        }

        if ($type === 'barber') {
            if ($entity->name) {
                $signals[] = "barber name: {$entity->name}";
            }

            if ($entity->bio) {
                $signals[] = "barber bio: {$entity->bio}";
            }

            $services = $entity->services()->with('catalogItem')->get();
            foreach ($services as $service) {
                $catalogItem = $service->catalogItem;
                if ($catalogItem) {
                    $signals[] = "offers service: {$catalogItem->name}";
                }
            }
        }

        return $signals;
    }

    private function processClient(ClientModel $client): void
    {
        $signals = $this->gatherSignals($client);

        if (empty($signals)) {
            return;
        }

        $text = implode("\n", $signals);

        try {
            $response = Embeddings::for([$text])
                ->dimensions(1536)
                ->generate();

            $embedding = $response->embeddings[0] ?? null;

            if ($embedding === null) {
                $this->warn($this->cli('cli_client_embedding_missing', ['client_id' => $client->id]));

                return;
            }

            ClientPreferenceVectorModel::updateOrCreate(
                ['client_id' => $client->id],
                [
                    'embedding' => $embedding,
                    'metadata' => [
                        'signal_count' => count($signals),
                        'weights' => RecommendationFactorWeightsValueObject::defaults()->toArray(),
                    ],
                    'computed_at' => now(),
                ]
            );

            $this->rebuildEdges($client);

            $this->info($this->cli('cli_client_vector_computed', ['client_id' => $client->id]));
        } catch (\Throwable $e) {
            $this->error($this->cli('cli_client_vector_failed', ['client_id' => $client->id, 'reason' => $e->getMessage()]));
        }
    }

    private function gatherSignals(ClientModel $client): array
    {
        $signals = [];

        $favorites = ClientFavoriteModel::where('client_id', $client->id)->get();
        foreach ($favorites as $favorite) {
            $signals[] = "favorite:{$favorite->favorable_type->value}:{$favorite->favorable_id}";
        }

        $bookings = $client->bookings()
            ->where('status', BookingStatus::Completed->value)
            ->with('barber', 'services.catalogItem')
            ->get();

        foreach ($bookings as $booking) {
            $barberName = $booking->barber?->name ?? 'unknown';
            $serviceNames = $booking->services->map(
                fn ($s) => $s->catalogItem?->name ?? $s->name ?? 'unknown service'
            )->implode(', ');

            $signals[] = "visited barber:{$barberName}, services:{$serviceNames}";
        }

        return $signals;
    }

    private function rebuildEdges(ClientModel $client): void
    {
        $favorites = ClientFavoriteModel::where('client_id', $client->id)->get();
        foreach ($favorites as $favorite) {
            RecommendationEdgeModel::updateOrCreate(
                [
                    'source_type' => 'client',
                    'source_id' => $client->id,
                    'target_type' => $favorite->favorable_type->value,
                    'target_id' => $favorite->favorable_id,
                    'edge_type' => EdgeTypeEnum::Favorite->value,
                ],
                ['weight' => 1.0]
            );
        }
    }

    private function cli(string $key, array $replace = []): string
    {
        return trans('clientrecommendation::messages.'.$key, $replace, 'en');
    }
}
