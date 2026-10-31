<?php

declare(strict_types=1);

namespace Modules\Review\Http\Requests\Admin;

use Illuminate\Validation\Rules\Enum;
use Modules\Core\Constants\PaginationConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Review\Enums\ReviewStatus;

final class ListAdminReviewsRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', new Enum(ReviewStatus::class)],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:'.PaginationConstants::PAGINATION_MAX_PER_PAGE],
        ];
    }

    /** Moderation work is the disputed queue unless another status is asked for. */
    public function status(): ReviewStatus
    {
        return $this->enum('status', ReviewStatus::class) ?? ReviewStatus::Disputed;
    }

    public function perPage(): int
    {
        return $this->integer('per_page', PaginationConstants::PAGINATION_DEFAULT_PER_PAGE);
    }
}
