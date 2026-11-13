<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\JobPosting\Models\JobPostingModel;
use Modules\JobPosting\Services\ApplicationSeenMarker;

/** Marks the branch's own posting's new applications as seen; listing them is read-only. Idempotent: a repeat returns `updated: 0`. */
final class MarkApplicationsSeenAction extends BaseApiAction
{
    public function __construct(private readonly ApplicationSeenMarker $marker) {}

    public function __invoke(Request $request, string $jobPosting): JsonResponse
    {
        $branch = $request->user('branch_api');

        $posting = JobPostingModel::where('branch_id', $branch->id)->findOrFail($jobPosting);

        return $this->updated(data: ['updated' => $this->marker->markSeen((string) $posting->getKey(), StatusChangeActorTypeEnum::Branch, (string) $branch->getKey())]);
    }
}
