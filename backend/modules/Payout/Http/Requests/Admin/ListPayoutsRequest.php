<?php

declare(strict_types=1);

namespace Modules\Payout\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Modules\Core\Constants\PaginationConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Payout\Enums\PayoutStatus;

final class ListPayoutsRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::enum(PayoutStatus::class)],
            'brand_id' => ['sometimes', 'uuid'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:'.PaginationConstants::PAGINATION_MAX_PER_PAGE],
        ];
    }

    public function perPage(): int
    {
        return $this->integer('per_page', PaginationConstants::PAGINATION_DEFAULT_PER_PAGE);
    }
}
