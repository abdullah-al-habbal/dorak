<?php

declare(strict_types=1);

namespace Modules\ClientRecommendation\Console\Commands;

use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Laravel\Ai\Embeddings;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\ClientRecommendation\Constants\RecommendationConstants;
use Modules\ClientRecommendation\Models\ClientPreferenceVectorModel;
use Modules\ClientRecommendation\Models\EntityEmbeddingModel;
use Modules\ClientRecommendation\Models\RecommendationEdgeModel;
use Modules\ClientRecommendation\Services\ClientRecommendationEdgeRebuilder;
use Modules\ClientRecommendation\Services\ClientRecommendationSignalGatherer;
use Modules\ClientRecommendation\ValuesObjects\RecommendationFactorWeightsValueObject;
use Symfony\Component\Console\Input\InputOption;
use Throwable;

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

    public function handle(ClientRecommendationSignalGatherer $gatherer, ClientRecommendationEdgeRebuilder $rebuilder): int
    {
        $clientId = $this->option('client-id');
        $force = (bool) $this->option('force');
        $clientId !== null
            ? $this->info($this->cli('cli_recomputing_client', ['client_id' => $clientId]))
            : $this->info($this->cli('cli_recomputing_all_clients'));

        ClientModel::query()
            ->when($clientId, fn ($q, $id) => $q->where('id', $id))
            ->chunk(RecommendationConstants::RECOMMENDATION_RECOMPUTE_CHUNK_SIZE, function ($clients) use ($force, $gatherer, $rebuilder): void {
                foreach ($clients as $client) {
                    if (! $force && $this->isFresh($client, $gatherer)) {
                        continue;
                    }

                    $this->processClient($client, $gatherer, $rebuilder);
                }
            });

        if ($clientId === null) {
            $this->recomputeEntityEmbeddings();
        }

        $this->cleanupStaleData();

        $this->info($this->cli('cli_done'));

        return self::SUCCESS;
    }

    private function isFresh(ClientModel $client, ClientRecommendationSignalGatherer $gatherer): bool
    {
        $vector = ClientPreferenceVectorModel::where('client_id', $client->id)->first();
        if ($vector === null || $vector->computed_at === null) {
            return false;
        }

        $latestSignalAt = $gatherer->latestSignalAt($client);

        return $latestSignalAt !== null && $vector->computed_at->gte($latestSignalAt);
    }

    private function cleanupStaleData(): void
    {
        RecommendationEdgeModel::whereNotNull('expires_at')->where('expires_at', '<', now())->delete();

        ClientPreferenceVectorModel::whereNotIn('client_id', ClientModel::withTrashed()->pluck('id'))->delete();
    }

    private function recomputeEntityEmbeddings(): void
    {
        $entityTypes = [
            BranchModel::class => ['type' => 'branch', 'query' => BranchModel::query()],
            BarberModel::class => ['type' => 'barber', 'query' => BarberModel::query()],
        ];

        foreach ($entityTypes as $config) {
            $config['query']->chunk(RecommendationConstants::RECOMMENDATION_RECOMPUTE_CHUNK_SIZE, function ($entities) use ($config): void {
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
                ->dimensions(RecommendationConstants::RECOMMENDATION_EMBEDDING_DIMENSIONS)
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
                    'embedding_metadata' => [
                        'name' => $entity->name ?? $entity->id,
                        'signal_count' => count($signals),
                    ],
                    'computed_at' => now(),
                ]
            );

            $this->info($this->cli('cli_embedding_computed', ['entity_type' => $config['type'], 'entity_id' => $entity->id]));
        } catch (Throwable $e) {
            $this->error($this->cli('cli_embedding_failed', ['entity_type' => $config['type'], 'entity_id' => $entity->id, 'reason' => $e->getMessage()]));
        }
    }

    private function gatherEntitySignals($entity, string $type): array
    {
        return match ($type) {
            'branch' => $this->branchSignals($entity),
            'barber' => $this->barberSignals($entity),
            default => [],
        };
    }

    /** @return list<string> */
    private function branchSignals($branch): array
    {
        $signals = [];

        if ($branch->name) {
            $signals[] = "branch name: {$branch->name}";
        }

        if ($branch->brand) {
            $signals[] = "brand: {$branch->brand->name}";

            foreach ($branch->brand->services()->with('catalogItem')->get() as $service) {
                $catalogItem = $service->catalogItem;
                if ($catalogItem) {
                    $signals[] = "offers service: {$catalogItem->name}";
                    if ($catalogItem->description) {
                        $signals[] = "service description: {$catalogItem->description}";
                    }
                }
            }
        }

        return $signals;
    }

    /** @return list<string> */
    private function barberSignals($barber): array
    {
        $signals = [];

        if ($barber->name) {
            $signals[] = "barber name: {$barber->name}";
        }

        if ($barber->bio) {
            $signals[] = "barber bio: {$barber->bio}";
        }

        foreach ($barber->services()->with('catalogItem')->get() as $service) {
            if ($service->catalogItem) {
                $signals[] = "offers service: {$service->catalogItem->name}";
            }
        }

        return $signals;
    }

    private function processClient(ClientModel $client, ClientRecommendationSignalGatherer $gatherer, ClientRecommendationEdgeRebuilder $rebuilder): void
    {
        $signals = $gatherer->forClient($client);

        if (empty($signals)) {
            return;
        }

        $text = implode("\n", $signals);

        try {
            $response = Embeddings::for([$text])
                ->dimensions(RecommendationConstants::RECOMMENDATION_EMBEDDING_DIMENSIONS)
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
                    'embedding_metadata' => [
                        'signal_count' => count($signals),
                        'weights' => RecommendationFactorWeightsValueObject::defaults()->toArray(),
                    ],
                    'computed_at' => now(),
                ]
            );

            $rebuilder->rebuild($client);

            $this->info($this->cli('cli_client_vector_computed', ['client_id' => $client->id]));
        } catch (Throwable $e) {
            $this->error($this->cli('cli_client_vector_failed', ['client_id' => $client->id, 'reason' => $e->getMessage()]));
        }
    }

    private function cli(string $key, array $replace = []): string
    {
        return trans('clientrecommendation::messages.'.$key, $replace, 'en');
    }
}
