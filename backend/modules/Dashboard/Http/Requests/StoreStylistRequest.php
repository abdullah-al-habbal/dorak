<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests;

final class StoreStylistRequest extends StylistRequest
{
    public function rules(): array
    {
        return [...parent::rules(), 'password' => ['required', 'string', 'min:12', 'max:255']];
    }
}
