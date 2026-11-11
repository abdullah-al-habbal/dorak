<?php

declare(strict_types=1);

namespace Modules\Marketing\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Marketing\Http\Requests\Admin\UpdateSectionRequest;
use Modules\Marketing\Http\Resources\Admin\AdminSectionResource;
use Modules\Marketing\Models\SectionModel;

final class UpdateSectionAction extends BaseApiAction
{
    public function __invoke(UpdateSectionRequest $request, string $section): JsonResponse
    {
        $model = SectionModel::query()->findOrFail($section);
        Gate::forUser($request->user('admin_api'))->authorize('update', $model);

        $model->update($request->validated());

        return $this->updated(data: new AdminSectionResource($model->refresh()), message: __('marketing::marketing.section_saved'));
    }
}
