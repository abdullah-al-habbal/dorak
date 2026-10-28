<?php

declare(strict_types=1);

namespace Modules\Review\Http\Requests\Admin;

use Illuminate\Validation\Rules\Enum;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Review\Enums\ReviewStatus;

final class ListAdminReviewsRequest extends BaseApiFormRequest
{
    private const int DEFAULT_PER_PAGE = 15;

    private const int MAX_PER_PAGE = 100;

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', new Enum(ReviewStatus::class)],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:'.self::MAX_PER_PAGE],
        ];
    }

    /** Moderation work is the disputed queue unless another status is asked for. */
    public function status(): ReviewStatus
    {
        return $this->enum('status', ReviewStatus::class) ?? ReviewStatus::Disputed;
    }

    public function perPage(): int
    {
        return $this->integer('per_page', self::DEFAULT_PER_PAGE);
    }
}
