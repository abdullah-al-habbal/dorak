<?php

declare(strict_types=1);

namespace Modules\Payment\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Payment\CQRS\Command\SavePaymentGatewayCommand;
use Modules\Payment\Enums\PaymentGatewayDriver;

final class SavePaymentGatewayRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $gateway = $this->route('gateway');

        return [
            'code' => ['required', 'string', 'max:64', 'regex:/^[a-z0-9_]+$/', Rule::unique('payment_gateways', 'code')->ignore($gateway)],
            'name.en' => ['required', 'string', 'max:255'],
            'name.ar' => ['required', 'string', 'max:255'],
            'driver' => ['required', Rule::enum(PaymentGatewayDriver::class)],
            'is_active' => ['required', 'boolean'],
            'is_default' => ['sometimes', 'boolean'],
            'gateway_settings' => ['sometimes', 'nullable', 'array', ValidationLimitConstants::RULE_LIST_MAX],
            'sort_order' => ['sometimes', 'integer', 'between:0,100000'],
        ];
    }

    public function toCommand(): SavePaymentGatewayCommand
    {
        $data = $this->validated();

        return new SavePaymentGatewayCommand(
            code: $data['code'],
            name: $data['name'],
            driver: PaymentGatewayDriver::from($data['driver']),
            isActive: (bool) $data['is_active'],
            isDefault: (bool) ($data['is_default'] ?? false),
            gatewaySettings: $data['gateway_settings'] ?? null,
            sortOrder: (int) ($data['sort_order'] ?? 0),
        );
    }
}
