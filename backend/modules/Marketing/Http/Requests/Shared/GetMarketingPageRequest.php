<?php

declare(strict_types=1);

namespace Modules\Marketing\Http\Requests\Shared;

use Illuminate\Validation\Rules\Enum;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Marketing\Enums\UniverseVisibilityEnum;

final class GetMarketingPageRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'universe' => ['sometimes', 'string', new Enum(UniverseVisibilityEnum::class)],
        ];
    }

    public function getLocale(): string
    {
        return $this->getPreferredLanguage(['en', 'ar']) ?? (string) app()->getLocale();
    }

    public function getUniverse(): UniverseVisibilityEnum
    {
        return UniverseVisibilityEnum::tryFrom((string) $this->input('universe')) ?? UniverseVisibilityEnum::All;
    }
}
