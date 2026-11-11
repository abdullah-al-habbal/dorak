<?php

declare(strict_types=1);

namespace Modules\Language\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Language\Http\Resources\Admin\AdminLanguageResource;
use Modules\Language\Models\LanguageModel;

/** The languages the platform has translations for. A new one needs translations in code, so the admin only switches these on and off. */
final class ListAdminLanguagesAction extends BaseApiAction
{
    public function __invoke(): JsonResponse
    {
        return $this->ok(data: AdminLanguageResource::collection(LanguageModel::query()->orderByDesc('is_default')->orderBy('code')->get()));
    }
}
