<?php

declare(strict_types=1);

namespace Modules\Review\Http\Requests\Staff;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Review\CQRS\Command\Staff\ReviewClientCommand;
use Modules\Review\Enums\ReviewAuthorTypeEnum;

final class ReviewClientRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'body' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @param  list<string>|null  $branchScope
     */
    public function toCommand(string $bookingId, ReviewAuthorTypeEnum $authorSide, ?string $barberId, ?array $branchScope): ReviewClientCommand
    {
        $comment = $this->validated('body');

        return new ReviewClientCommand(
            bookingId: $bookingId,
            authorSide: $authorSide,
            barberId: $barberId,
            branchScope: $branchScope,
            rating: (int) $this->validated('rating'),
            body: is_string($comment) ? $comment : null,
        );
    }
}
