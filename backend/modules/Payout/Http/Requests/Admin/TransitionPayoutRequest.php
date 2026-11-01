<?php

declare(strict_types=1);

namespace Modules\Payout\Http\Requests\Admin;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Payout\CQRS\Command\TransitionPayoutCommand;
use Modules\Payout\Enums\PayoutStatus;

final class TransitionPayoutRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'external_reference' => ['sometimes', 'nullable', 'string', 'max:255'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }

    public function toCommand(PayoutStatus $next): TransitionPayoutCommand
    {
        $data = $this->validated();

        return new TransitionPayoutCommand(
            next: $next,
            adminId: (string) $this->user('admin_api')->getKey(),
            externalReference: $data['external_reference'] ?? null,
            notes: $data['notes'] ?? null,
        );
    }
}
