<?php

declare(strict_types=1);

namespace Modules\Review\Http\Requests\Client;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Review\CQRS\Command\Client\SubmitReviewCommand;
use Modules\Review\Enums\ReviewAuthorTypeEnum;

final class SubmitReviewRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'body' => ['nullable', 'string', 'max:1000'],
            'barber_rating' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:5'],
        ];
    }

    public function toCommand(string $bookingId): SubmitReviewCommand
    {
        return new SubmitReviewCommand(
            bookingId: $bookingId,
            authorId: (string) $this->user()->id,
            authorType: ReviewAuthorTypeEnum::from($this->user()->getMorphClass()),
            rating: (int) $this->validated('rating'),
            body: $this->validated('body'),
            barberRating: $this->validated('barber_rating') === null ? null : (int) $this->validated('barber_rating'),
        );
    }
}
