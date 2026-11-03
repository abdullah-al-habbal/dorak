<?php

declare(strict_types=1);

namespace Modules\JobPosting\Http\Requests\Barber;

use Illuminate\Validation\Rule;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\JobPosting\CQRS\Query\Barber\ListApplicationsQuery;
use Modules\JobPosting\Enums\ApplicationStatus;

final class ListApplicationsRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'barber_id' => ['nullable', 'string', ValidationLimitConstants::RULE_ID_MAX],
            'status' => ['nullable', Rule::enum(ApplicationStatus::class)],
        ];
    }

    public function toQuery(): ListApplicationsQuery
    {
        return new ListApplicationsQuery(
            perPage: (int) ($this->validated('per_page') ?? 20),
            barberId: (string) $this->user()->id,
            status: $this->validated('status'),
        );
    }
}
