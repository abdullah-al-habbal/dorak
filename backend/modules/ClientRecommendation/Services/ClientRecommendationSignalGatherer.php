<?php

declare(strict_types=1);

namespace Modules\ClientRecommendation\Services;

use Illuminate\Support\Carbon;
use Modules\Booking\Enums\BookingStatus;
use Modules\Client\Models\ClientModel;
use Modules\ClientFaceProfile\Models\ClientFaceAnalysisResultModel;
use Modules\ClientInteraction\Enums\InteractionTypeEnum;
use Modules\ClientInteraction\Models\ClientFavoriteModel;
use Modules\ClientInteraction\Models\ClientInteractionLogModel;

final class ClientRecommendationSignalGatherer
{
    /** @return list<string> */
    public function forClient(ClientModel $client): array
    {
        return [
            ...$this->favoriteSignals($client),
            ...$this->historySignals($client),
            ...$this->faceSignals($client),
            ...$this->interactionSignals($client),
        ];
    }

    public function latestSignalAt(ClientModel $client): ?Carbon
    {
        return collect([
            ClientFavoriteModel::where('client_id', $client->id)->max('created_at'),
            $client->bookings()->where('booking_status', BookingStatus::Completed->value)->max('updated_at'),
            ClientFaceAnalysisResultModel::where('client_id', $client->id)->max('computed_at'),
            ClientInteractionLogModel::where('client_id', $client->id)->max('created_at'),
        ])
            ->filter()
            ->map(fn (string $value): Carbon => Carbon::parse($value))
            ->sortDesc()
            ->first();
    }

    /** @return list<string> */
    private function favoriteSignals(ClientModel $client): array
    {
        return ClientFavoriteModel::where('client_id', $client->id)
            ->get()
            ->map(fn (ClientFavoriteModel $favorite): string => "favorite:{$favorite->favorited_type->value}:{$favorite->favorited_id}")
            ->all();
    }

    /** @return list<string> */
    private function historySignals(ClientModel $client): array
    {
        return $client->bookings()
            ->where('booking_status', BookingStatus::Completed->value)
            ->with('barber', 'services.catalogItem')
            ->get()
            ->map(function ($booking): string {
                $barberName = $booking->barber?->name ?? 'unknown';
                $serviceNames = $booking->services->map(
                    fn ($service) => $service->catalogItem?->name ?? $service->name ?? 'unknown service'
                )->implode(', ');

                return "visited barber:{$barberName}, services:{$serviceNames}";
            })
            ->all();
    }

    /** @return list<string> */
    private function faceSignals(ClientModel $client): array
    {
        $latest = ClientFaceAnalysisResultModel::where('client_id', $client->id)->latest('computed_at')->first();

        return $latest === null ? [] : ["face shape: {$latest->detected_face_shape->value}"];
    }

    /** @return list<string> */
    private function interactionSignals(ClientModel $client): array
    {
        return ClientInteractionLogModel::where('client_id', $client->id)
            ->where('interaction_type', InteractionTypeEnum::View->value)
            ->whereNotNull('interactable_type')
            ->get()
            ->map(fn (ClientInteractionLogModel $log): string => "viewed {$log->interactable_type->value}:{$log->interactable_id}")
            ->all();
    }
}
