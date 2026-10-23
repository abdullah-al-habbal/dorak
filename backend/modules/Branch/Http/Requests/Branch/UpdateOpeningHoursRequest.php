<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Requests\Branch;

use Modules\Branch\Support\OpeningHoursRules;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class UpdateOpeningHoursRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return OpeningHoursRules::week('hours');
    }
}
