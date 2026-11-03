<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Carbon\CarbonInterface;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ShowEarningsRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'from' => ['sometimes', 'date'],
            'to' => ['sometimes', 'date', 'after_or_equal:from'],
        ];
    }

    public function from(): ?CarbonInterface
    {
        return $this->has('from') ? $this->date('from')?->startOfDay() : null;
    }

    public function to(): ?CarbonInterface
    {
        return $this->has('to') ? $this->date('to')?->endOfDay() : null;
    }
}
