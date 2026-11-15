<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\People;

use Illuminate\Http\JsonResponse;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\LookupBarbersRequest;
use Modules\Dashboard\Http\Resources\Shared\BarberLookupResource;

/**
 * NS-16: the barbers a branch can invite, found by name. Email and phone are never matched here (that would confirm who has an account); an exact
 * contact is invited through `InviteBranchAffiliationByContactAction`. Only discoverable
 * (enabled and not banned) barbers are returned, ten at most, so this is a picker and not a directory.
 */
final class LookupBarbersAction extends BaseApiAction
{
    public const int LIMIT = 10;

    public function __invoke(LookupBarbersRequest $request): JsonResponse
    {
        $search = $request->search();
        $like = '%'.addcslashes($search, '%_\\').'%';

        $barbers = BarberModel::query()
            ->discoverable()
            ->where(fn ($inner) => $inner
                ->where('name->en', 'like', $like)
                ->orWhere('name->ar', 'like', $like))
            ->orderBy('name->en')
            ->limit(self::LIMIT)
            ->get();

        return $this->success(BarberLookupResource::collection($barbers));
    }
}
