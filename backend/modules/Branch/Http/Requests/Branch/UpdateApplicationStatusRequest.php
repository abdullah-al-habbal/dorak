<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Requests\Branch;

use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\JobPosting\Enums\ApplicationStatus;

final class UpdateApplicationStatusRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return ['status' => ['required', Rule::enum(ApplicationStatus::class)]];
    }

    public function nextStatus(): ApplicationStatus
    {
        return ApplicationStatus::from($this->string('status')->toString());
    }
}
