<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Branch\Support\OpeningHoursRules;
use Modules\Core\Http\Requests\BaseApiFormRequest;

/** Weekly schedule only, so the editor does not have to resend the whole branch. */
final class UpdateBranchOpeningHoursRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return OpeningHoursRules::week('hours');
    }
}
