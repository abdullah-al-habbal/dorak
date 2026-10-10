<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\CQRS\Command\UpdateDashboardProfileCommand;

final class UpdateDashboardProfileRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return ['display_name' => ['required', 'string', 'min:1', 'max:255']];
    }

    public function toCommand(): UpdateDashboardProfileCommand
    {
        return new UpdateDashboardProfileCommand((string) $this->validated('display_name'));
    }
}
