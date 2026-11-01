<?php

declare(strict_types=1);

namespace Modules\Review\Http\Requests\Staff;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Review\CQRS\Command\Staff\FlagReviewDisputeCommand;
use Modules\Review\Enums\ReviewSubjectTypeEnum;

final class FlagReviewDisputeRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return ['reason' => ['required', 'string', 'min:10', 'max:1000']];
    }

    public function toCommand(string $reviewId, ReviewSubjectTypeEnum $subjectType, string $subjectId): FlagReviewDisputeCommand
    {
        return new FlagReviewDisputeCommand($reviewId, $subjectType, $subjectId, $this->string('reason')->toString());
    }
}
