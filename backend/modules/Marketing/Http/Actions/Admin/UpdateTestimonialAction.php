<?php

declare(strict_types=1);

namespace Modules\Marketing\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Marketing\Http\Requests\Admin\SaveTestimonialRequest;
use Modules\Marketing\Http\Resources\Admin\AdminTestimonialResource;
use Modules\Marketing\Models\TestimonialModel;

final class UpdateTestimonialAction extends BaseApiAction
{
    public function __invoke(SaveTestimonialRequest $request, string $testimonial): JsonResponse
    {
        $model = TestimonialModel::query()->findOrFail($testimonial);
        Gate::forUser($request->user('admin_api'))->authorize('update', $model);

        $model->update($request->validated());

        return $this->updated(data: new AdminTestimonialResource($model->refresh()), message: __('marketing::marketing.testimonial_saved'));
    }
}
