<?php

declare(strict_types=1);

namespace Modules\Review\Http\Requests\Shared;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Review\CQRS\Query\Shared\GetBarberReviewsQuery;

final class GetBarberReviewsRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function toQuery(): GetBarberReviewsQuery
    {
        return new GetBarberReviewsQuery(
            barberId: (string) $this->route('barber'),
            perPage: (int) ($this->validated('per_page') ?? 20),
        );
    }
}
