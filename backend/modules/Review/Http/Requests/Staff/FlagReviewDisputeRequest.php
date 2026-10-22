<?php

declare(strict_types=1);

namespace Modules\Review\Http\Requests\Staff;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Review\CQRS\Command\Staff\FlagReviewDisputeCommand;

final class FlagReviewDisputeRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return ['reason' => ['required', 'string', 'min:10', 'max:1000']];
    }

    /** @param 'branch'|'barber' $subjectType */
    public function toCommand(string $reviewId, string $subjectType, string $subjectId): FlagReviewDisputeCommand
    {
        return new FlagReviewDisputeCommand($reviewId, $subjectType, $subjectId, $this->string('reason')->toString());
    }
}
