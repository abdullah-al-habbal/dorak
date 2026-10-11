<?php

declare(strict_types=1);

namespace Modules\Review\Http\Requests\Admin;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\Rules\Enum;
use Modules\Admin\Models\AdminModel;
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
        $admin = $this->user('admin_api');
        $status = $this->enum('status', ReviewStatus::class);

        if (! $admin instanceof AdminModel) {
            throw new AuthenticationException;
        }

        if (! $status instanceof ReviewStatus) {
            throw new \LogicException('The validated review status must be a ReviewStatus enum.');
        }

        $adminId = $admin->getKey();

        if (! is_string($adminId)) {
            throw new \LogicException('The authenticated admin ID must be a UUID string.');
        }

        return new ResolveReviewDisputeCommand($reviewId, $adminId, $status);
    }
}
