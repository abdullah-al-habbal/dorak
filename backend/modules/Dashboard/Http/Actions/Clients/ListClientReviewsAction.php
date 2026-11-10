<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Clients;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Ban\Constants\BanConstants;
use Modules\Client\Models\ClientModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Http\Requests\Business\ListClientRelationRequest;
use Modules\Review\Enums\ReviewAuthorTypeEnum;
use Modules\Review\Http\Resources\Admin\AdminReviewResource;
use Modules\Review\Models\ReviewModel;

/** NS-07 (D4): the reviews a client wrote, newest first. */
final class ListClientReviewsAction extends BaseApiAction
{
    public function __invoke(ListClientRelationRequest $request, string $client): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize(BanConstants::MANAGE_CLIENTS_ABILITY);
        ClientModel::query()->findOrFail($client);

        $reviews = ReviewModel::query()
            ->where('author_type', ReviewAuthorTypeEnum::Client)
            ->where('author_id', $client)
            ->with('subject')
            ->orderByDesc('created_at')
            ->paginate($request->perPage());

        return $this->paginated($reviews, AdminReviewResource::class);
    }
}
