<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Requests\Barber;

use Modules\Core\Http\Requests\BaseApiFormRequest;

final class VerifyEmailRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'size:6'],
        ];
    }

    public function code(): string
    {
        return (string) $this->validated('code');
    }
}
