<?php

declare(strict_types=1);

namespace Modules\Review\Http\Requests\Client;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Review\CQRS\Command\Client\FlagReviewDisputeCommand;

final class FlagReviewDisputeRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return ['reason' => ['required', 'string', 'min:10', 'max:1000']];
    }

    public function toCommand(string $reviewId): FlagReviewDisputeCommand
    {
        $clientId = $this->user('client')?->getKey();

        if (! is_string($clientId)) {
            throw new \LogicException('Authenticated client identifier must be a string.');
        }

        return new FlagReviewDisputeCommand($reviewId, $clientId, $this->string('reason')->toString());
    }
}
