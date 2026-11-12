<?php

declare(strict_types=1);

namespace Modules\Review\Eloquent\Resolvers\Shared;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Modules\Barber\Models\BarberModel;
use Modules\Review\CQRS\Query\Shared\GetBarberReviewsQuery;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Models\ReviewModel;

final class GetBarberReviewsEloquentResolver
{
    public function resolve(GetBarberReviewsQuery $payload): LengthAwarePaginator
    {
        $this->ensureVisible($payload->barberId);

        return ReviewModel::query()
            ->where('subject_id', $payload->barberId)
            ->where('subject_type', ReviewSubjectTypeEnum::Barber)
            ->where('status', ReviewStatus::Published)
            ->with('author')
            ->orderByDesc('created_at')
            ->paginate($payload->perPage);
    }

    /** A hidden barber's reviews stay readable only by that barber (the stylist app's own reviews screen). */
    private function ensureVisible(string $barberId): void
    {
        $self = Auth::guard('barber')->user();

        if ($self instanceof BarberModel && (string) $self->getKey() === $barberId) {
            return;
        }

        BarberModel::discoverable()->findOrFail($barberId);
    }
}
