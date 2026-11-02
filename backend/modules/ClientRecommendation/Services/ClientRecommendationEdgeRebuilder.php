<?php

declare(strict_types=1);

namespace Modules\ClientRecommendation\Services;

use Illuminate\Support\Facades\DB;
use Modules\Booking\Enums\BookingStatus;
use Modules\Client\Models\ClientModel;
use Modules\ClientFaceProfile\Models\ClientFaceAnalysisResultModel;
use Modules\ClientInteraction\Enums\InteractionTypeEnum;
use Modules\ClientInteraction\Models\ClientFavoriteModel;
use Modules\ClientInteraction\Models\ClientInteractionLogModel;
use Modules\ClientRecommendation\Constants\RecommendationConstants;
use Modules\ClientRecommendation\Enums\EdgeTypeEnum;
use Modules\ClientRecommendation\Models\RecommendationEdgeModel;

final class ClientRecommendationEdgeRebuilder
{
    public function rebuild(ClientModel $client): void
    {
        DB::transaction(function () use ($client): void {
            $this->rebuildFavoriteEdges($client);
            $this->rebuildHistoryEdges($client);
            $this->rebuildVisitedEdges($client);
            $this->rebuildFaceMatchedEdges($client);
        });
    }

    private function rebuildFavoriteEdges(ClientModel $client): void
    {
        foreach (ClientFavoriteModel::where('client_id', $client->id)->get() as $favorite) {
            $this->upsert($client->id, $favorite->favorable_type->value, $favorite->favorable_id, EdgeTypeEnum::Favorite, 1.0);
        }
    }

    private function rebuildHistoryEdges(ClientModel $client): void
    {
        $bookings = $client->bookings()
            ->where('status', BookingStatus::Completed->value)
            ->with('chair')
            ->get();

        foreach ($bookings as $booking) {
            $barberId = $booking->barber_id ?? $booking->chair?->barber_id;
            if ($barberId !== null) {
                $this->upsert($client->id, 'barber', $barberId, EdgeTypeEnum::History, 0.7);
            }

            if ($booking->chair?->branch_id !== null) {
                $this->upsert($client->id, 'branch', $booking->chair->branch_id, EdgeTypeEnum::History, 0.7);
            }
        }
    }

    private function rebuildVisitedEdges(ClientModel $client): void
    {
        $logs = ClientInteractionLogModel::where('client_id', $client->id)
            ->where('interaction_type', InteractionTypeEnum::View->value)
            ->whereNotNull('interactable_type')
            ->get();

        foreach ($logs as $log) {
            $this->upsert($client->id, $log->interactable_type->value, $log->interactable_id, EdgeTypeEnum::Visited, 0.3);
        }
    }

    private function rebuildFaceMatchedEdges(ClientModel $client): void
    {
        $latest = ClientFaceAnalysisResultModel::where('client_id', $client->id)->latest('computed_at')->first();

        if ($latest === null || $latest->recommended_catalog_item_ids === null) {
            return;
        }

        foreach ($latest->recommended_catalog_item_ids->ids() as $catalogItemId) {
            $this->upsert($client->id, 'catalog_item', $catalogItemId, EdgeTypeEnum::FaceMatched, 0.5);
        }
    }

    private function upsert(string $clientId, string $targetType, string $targetId, EdgeTypeEnum $edgeType, float $weight): void
    {
        RecommendationEdgeModel::updateOrCreate(
            [
                'source_type' => 'client',
                'source_id' => $clientId,
                'target_type' => $targetType,
                'target_id' => $targetId,
                'edge_type' => $edgeType->value,
            ],
            [
                'weight_ratio' => $weight,
                'computed_at' => now(),
                'vector_version' => RecommendationConstants::RECOMMENDATION_VECTOR_VERSION,
            ]
        );
    }
}
