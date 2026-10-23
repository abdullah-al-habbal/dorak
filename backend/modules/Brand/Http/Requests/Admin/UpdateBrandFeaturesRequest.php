<?php

declare(strict_types=1);

namespace Modules\Brand\Http\Requests\Admin;

use Modules\Core\Http\Requests\BaseApiFormRequest;

final class UpdateBrandFeaturesRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'multi_branch' => ['sometimes', 'boolean'],
            'job_board' => ['sometimes', 'boolean'],
        ];
    }

    /** @return array<string, bool> */
    public function flags(): array
    {
        return array_map(fn (mixed $value): bool => (bool) $value, $this->validated());
    }
}
