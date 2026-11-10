<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Owner;

use Modules\Brand\Support\BrandPayloadRules;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Core\Support\PhoneNumberNormalizer;
use Modules\Dashboard\Constants\DashboardPasswordResetConstants;
use Modules\Dashboard\Constants\OwnerRegistrationConstants;
use Modules\Dashboard\CQRS\Command\RegisterOwnerCommand;

/**
 * Public. No rule here may reveal whether the email already has an account, so the
 * email is checked for shape only; the handler decides what to do with a known one.
 */
final class RegisterOwnerRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'owner.name' => ['required', 'string', ValidationLimitConstants::RULE_SHORT_TEXT_MAX],
            'owner.email' => ['required', 'string', 'email', ValidationLimitConstants::RULE_SHORT_TEXT_MAX],
            'owner.password' => ['required', 'string', DashboardPasswordResetConstants::DASHBOARD_PASSWORD_RULE_MIN, ValidationLimitConstants::RULE_PASSWORD_MAX, 'confirmed'],
            'owner.phone' => ['nullable', 'string', 'max:20'],
            'brand' => ['required', 'array'],
            ...BrandPayloadRules::rules('brand'),
            OwnerRegistrationConstants::HONEYPOT_FIELD => ['nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $owner = $this->input('owner');

        if (! is_array($owner)) {
            return;
        }

        if (isset($owner['email']) && is_string($owner['email'])) {
            $owner['email'] = mb_strtolower(trim($owner['email']));
        }
        if (isset($owner['phone']) && is_string($owner['phone']) && $owner['phone'] !== '') {
            $owner['phone'] = PhoneNumberNormalizer::normalize($owner['phone']);
        }

        $this->merge(['owner' => $owner]);
    }

    public function toCommand(): RegisterOwnerCommand
    {
        return new RegisterOwnerCommand(
            name: (string) $this->validated('owner.name'),
            email: (string) $this->validated('owner.email'),
            password: (string) $this->validated('owner.password'),
            phone: $this->validated('owner.phone'),
            brand: (array) $this->validated('brand'),
            locale: app()->getLocale(),
            honeypotTripped: filled($this->input(OwnerRegistrationConstants::HONEYPOT_FIELD)),
        );
    }
}
