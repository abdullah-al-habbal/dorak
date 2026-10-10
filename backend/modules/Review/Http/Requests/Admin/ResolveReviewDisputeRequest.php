<?php

declare(strict_types=1);

namespace Modules\Review\Http\Requests\Admin;

use Illuminate\Validation\Rules\Enum;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Review\CQRS\Command\Admin\ResolveReviewDisputeCommand;
use Modules\Review\Enums\ReviewStatus;

final class ResolveReviewDisputeRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return ['status' => ['required', new Enum(ReviewStatus::class), 'in:published,hidden']];
    }

    public function toCommand(string $reviewId): ResolveReviewDisputeCommand
    {
        return new ResolveReviewDisputeCommand($reviewId, $this->user('admin')->getKey(), $this->enum('status', ReviewStatus::class));
    }
}
