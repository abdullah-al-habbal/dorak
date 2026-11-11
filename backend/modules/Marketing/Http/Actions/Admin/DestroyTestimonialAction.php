<?php

declare(strict_types=1);

namespace Modules\Marketing\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Marketing\Models\TestimonialModel;

final class DestroyTestimonialAction extends BaseApiAction
{
    public function __invoke(Request $request, string $testimonial): JsonResponse
    {
        $model = TestimonialModel::query()->findOrFail($testimonial);
        Gate::forUser($request->user('admin_api'))->authorize('delete', $model);

        $model->delete();

        return $this->deleted(message: __('marketing::marketing.testimonial_deleted'));
    }
}
