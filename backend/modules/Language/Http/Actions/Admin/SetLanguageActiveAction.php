<?php

declare(strict_types=1);

namespace Modules\Language\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Language\Http\Requests\Admin\SetLanguageActiveRequest;
use Modules\Language\Http\Resources\Admin\AdminLanguageResource;
use Modules\Language\Models\LanguageModel;

/** Switches a language on or off. The default language is the fallback for every text, so it can't be switched off. */
final class SetLanguageActiveAction extends BaseApiAction
{
    public function __invoke(SetLanguageActiveRequest $request, string $language): JsonResponse
    {
        $model = LanguageModel::query()->findOrFail($language);
        Gate::forUser($request->user('admin_api'))->authorize('update', $model);

        if ($model->is_default && ! $request->boolean('is_active')) {
            return $this->businessError(ErrorCodeEnum::CONFLICT, __('language::messages.default_cannot_switch_off'));
        }

        $model->update(['is_active' => $request->boolean('is_active')]);

        return $this->updated(data: new AdminLanguageResource($model->refresh()), message: __('language::messages.language_saved'));
    }
}
