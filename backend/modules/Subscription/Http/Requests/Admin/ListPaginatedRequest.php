<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Requests\Admin;

use Modules\Core\Constants\PaginationConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ListPaginatedRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:'.PaginationConstants::PAGINATION_MAX_PER_PAGE],
            'brand_id' => ['sometimes', 'uuid'],
        ];
    }

    public function perPage(): int
    {
        return $this->integer('per_page', PaginationConstants::PAGINATION_DEFAULT_PER_PAGE);
    }
}
