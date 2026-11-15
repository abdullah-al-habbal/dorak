<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\Constants\DashboardBrandConstants;

/** F-10: invites a barber named by exact email or phone. The server resolves the contact; the answer never says whether anyone matched. */
final class InviteBarberByContactRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'contact' => ['required', 'string', 'min:'.LookupBarbersRequest::MIN_SEARCH_LENGTH, 'max:'.DashboardBrandConstants::DASHBOARD_BRAND_SEARCH_MAX_LENGTH],
            'commission_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    public function contact(): string
    {
        return trim((string) $this->validated('contact'));
    }

    public function commissionPercent(): ?float
    {
        return $this->validated('commission_percent') !== null ? (float) $this->validated('commission_percent') : null;
    }
}
