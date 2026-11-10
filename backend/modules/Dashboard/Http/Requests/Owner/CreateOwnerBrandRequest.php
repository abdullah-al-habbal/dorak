<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Owner;

use Modules\Brand\Support\BrandPayloadRules;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\CQRS\Command\CreateOwnerBrandCommand;

final class CreateOwnerBrandRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', ValidationLimitConstants::RULE_SHORT_TEXT_MAX],
            'password' => ['required', 'string', ValidationLimitConstants::RULE_PASSWORD_MAX],
            'brand' => ['required', 'array'],
            ...BrandPayloadRules::rules('brand'),
        ];
    }

    public function toCommand(): CreateOwnerBrandCommand
    {
        return new CreateOwnerBrandCommand(
            email: mb_strtolower(trim((string) $this->validated('email'))),
            password: (string) $this->validated('password'),
            brand: (array) $this->validated('brand'),
        );
    }
}
