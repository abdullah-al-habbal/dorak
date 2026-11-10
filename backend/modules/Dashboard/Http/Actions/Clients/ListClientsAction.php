<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Clients;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Ban\Constants\BanConstants;
use Modules\Client\Http\Resources\Admin\AdminClientResource;
use Modules\Client\Models\ClientModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\ListClientsRequest;

/** NS-07: finds clients by name, email or phone, optionally only the banned or one account status. */
final class ListClientsAction extends BaseApiAction
{
    public function __invoke(ListClientsRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize(BanConstants::MANAGE_CLIENTS_ABILITY);
        $search = $request->search();
        $banned = $request->banned();

        $clients = ClientModel::query()
            ->withCount('bookings')
            ->withExists(['bans as is_banned' => fn ($bans) => $bans->active()])
            ->when($request->status() !== null, fn ($query) => $query->where('status', $request->status()))
            ->when($banned !== null, fn ($query) => $banned
                ? $query->whereHas('bans', fn ($bans) => $bans->active())
                : $query->whereDoesntHave('bans', fn ($bans) => $bans->active()))
            ->when($search !== '', fn ($query) => $query->where(function ($inner) use ($search): void {
                $like = '%'.addcslashes($search, '%_\\').'%';
                $inner->where('name->en', 'like', $like)
                    ->orWhere('name->ar', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('phone', 'like', $like);
            }))
            ->orderByDesc('created_at')
            ->paginate($request->perPage());

        return $this->paginated($clients, AdminClientResource::class);
    }
}
