<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Clients;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Ban\Constants\BanConstants;
use Modules\Booking\Http\Resources\Client\BookingResource;
use Modules\Booking\Models\BookingModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\ListClientRelationRequest;

/** NS-07 (D4): a client's bookings, newest first. */
final class ListClientBookingsAction extends BaseApiAction
{
    public function __invoke(ListClientRelationRequest $request, string $client): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize(BanConstants::MANAGE_CLIENTS_ABILITY);
        ClientModel::query()->findOrFail($client);

        $bookings = BookingModel::query()
            ->where('client_id', $client)
            ->with(['chair', 'barber', 'services'])
            ->orderByDesc('starts_at')
            ->paginate($request->perPage());

        return $this->paginated($bookings, BookingResource::class);
    }
}
