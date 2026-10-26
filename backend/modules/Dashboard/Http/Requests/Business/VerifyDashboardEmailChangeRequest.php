<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\CQRS\Command\VerifyDashboardEmailChangeCommand;

final class VerifyDashboardEmailChangeRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return ['code' => ['required', 'string', 'size:6']];
    }

    public function toCommand(): VerifyDashboardEmailChangeCommand
    {
        return new VerifyDashboardEmailChangeCommand((string) $this->validated('code'));
    }
}
