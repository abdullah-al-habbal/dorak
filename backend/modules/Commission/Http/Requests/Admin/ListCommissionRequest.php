<?php

declare(strict_types=1);

namespace Modules\Commission\Http\Requests\Admin;

use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ListCommissionRequest extends BaseApiFormRequest
{
    private const int DEFAULT_PER_PAGE = 15;

    private const int MAX_PER_PAGE = 100;

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:'.self::MAX_PER_PAGE],
            'brand_id' => ['sometimes', 'uuid'],
            'settled' => ['sometimes', 'boolean'],
        ];
    }

    public function perPage(): int
    {
        return $this->integer('per_page', self::DEFAULT_PER_PAGE);
    }
}
