<?php

declare(strict_types=1);

namespace Modules\Marketing\Http\Requests\Admin;

use Modules\Core\Http\Requests\BaseApiFormRequest;

/** Publishes or unpublishes one marketing or legal page. */
final class SetMarketingPagePublishedRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'published' => ['required', 'boolean'],
        ];
    }

    public function wantsPublished(): bool
    {
        return $this->boolean('published');
    }
}
