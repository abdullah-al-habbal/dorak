<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

final class StoreBranchRequest extends BranchRequest
{
    public function rules(): array
    {
        return [...parent::rules(), 'password' => ['required', 'string', 'min:12', 'max:255']];
    }
}
