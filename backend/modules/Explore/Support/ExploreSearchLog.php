<?php

declare(strict_types=1);

namespace Modules\Explore\Support;

use Illuminate\Foundation\Http\FormRequest;
use Modules\ClientInteraction\Services\ClientInteractionRecorder;
use Modules\Explore\Constants\ExploreSearchConstants;

/**
 * Logs an explore request as a `search` interaction when the client typed a
 * query or applied a filter beyond the location (INT-1, Task 47).
 */
final class ExploreSearchLog
{
    public static function record(ClientInteractionRecorder $interactions, FormRequest $request, int $resultCount): void
    {
        $validated = $request->validated();
        $filters = array_intersect_key($validated, array_flip(ExploreSearchConstants::EXPLORE_SEARCH_LOG_KEYS));
        $query = isset($filters['q']) && is_string($filters['q']) && trim($filters['q']) !== '' ? trim($filters['q']) : null;
        unset($filters['q']);
        $filters = array_filter($filters, fn (mixed $value): bool => $value !== null && $value !== []);

        if ($query === null && $filters === []) {
            return;
        }

        $universe = $validated['universe'] ?? null;

        $interactions->search($request, $query, $filters, is_string($universe) ? $universe : null, $resultCount);
    }
}
