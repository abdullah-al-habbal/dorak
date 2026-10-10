<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests;

final class UpdateBranchRequest extends BranchRequest
{
    public function rules(): array
    {
        return [...parent::rules(), 'password' => ['sometimes', 'string', 'min:12', 'max:255']];
    }
}
