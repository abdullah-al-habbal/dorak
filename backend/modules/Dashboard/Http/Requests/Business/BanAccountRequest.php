<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Modules\Ban\Constants\BanConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class BanAccountRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:'.BanConstants::REASON_MIN_LENGTH, 'max:'.BanConstants::REASON_MAX_LENGTH],
            // Empty means a permanent ban.
            'expires_at' => ['nullable', 'date', 'after:now'],
        ];
    }

    public function reason(): string
    {
        return trim($this->string('reason')->toString());
    }

    public function expiresAt(): ?CarbonInterface
    {
        $value = $this->input('expires_at');

        return is_string($value) && $value !== '' ? Carbon::parse($value) : null;
    }
}
