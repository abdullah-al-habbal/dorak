<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Requests\Branch;

use Illuminate\Validation\Rule;
use Modules\BarberAffiliation\CQRS\Command\Branch\InviteAffiliationCommand;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class InviteAffiliationRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'barber_id' => ['required', 'string', Rule::exists('barbers', 'id')],
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    public function toCommand(string $branchId): InviteAffiliationCommand
    {
        return new InviteAffiliationCommand(
            branchId: $branchId,
            barberId: (string) $this->validated('barber_id'),
            commissionRate: $this->validated('commission_rate') !== null ? (float) $this->validated('commission_rate') : null,
        );
    }
}
