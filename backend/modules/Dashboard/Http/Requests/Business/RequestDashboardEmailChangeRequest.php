<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\CQRS\Command\RequestDashboardEmailChangeCommand;

final class RequestDashboardEmailChangeRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return ['email' => ['required', 'email', 'max:255']];
    }

    public function toCommand(): RequestDashboardEmailChangeCommand
    {
        return new RequestDashboardEmailChangeCommand((string) $this->validated('email'));
    }
}
