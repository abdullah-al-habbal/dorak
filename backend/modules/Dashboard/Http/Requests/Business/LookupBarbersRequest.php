<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\Constants\DashboardBrandConstants;

/** NS-16: finds a barber to invite. A short fragment would list the whole platform, so it needs a few characters. */
final class LookupBarbersRequest extends BaseApiFormRequest
{
    public const int MIN_SEARCH_LENGTH = 3;

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'search' => ['required', 'string', 'min:'.self::MIN_SEARCH_LENGTH, 'max:'.DashboardBrandConstants::DASHBOARD_BRAND_SEARCH_MAX_LENGTH],
        ];
    }

    public function search(): string
    {
        return trim((string) $this->validated('search'));
    }
}
