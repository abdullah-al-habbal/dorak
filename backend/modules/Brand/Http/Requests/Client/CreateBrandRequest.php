<?php

declare(strict_types=1);

namespace Modules\Brand\Http\Requests\Client;

use Modules\Brand\CQRS\Command\Client\CreateBrandCommand;
use Modules\Brand\Support\BrandPayloadRules;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class CreateBrandRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return BrandPayloadRules::rules();
    }

    /** @param string|null $ownerId defaults to the authenticated client */
    public function toCommand(?string $ownerId = null): CreateBrandCommand
    {
        return CreateBrandCommand::fromPayload(
            $ownerId ?? (string) $this->user()->getAuthIdentifier(),
            $this->validated(),
        );
    }
}
