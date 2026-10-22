<?php

declare(strict_types=1);

namespace Modules\Core\Http\Requests\Shared;

use Illuminate\Database\Eloquent\Model;
use Modules\Core\Http\Requests\BaseApiFormRequest;

abstract class NotifiableActorRequest extends BaseApiFormRequest
{
    protected function notifiableType(): string
    {
        $actor = $this->user();

        return $actor instanceof Model ? $actor->getMorphClass() : '';
    }

    protected function notifiableId(): string
    {
        $identifier = $this->user()?->getAuthIdentifier();

        return is_scalar($identifier) ? (string) $identifier : '';
    }
}
