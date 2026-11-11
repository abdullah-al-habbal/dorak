<?php

declare(strict_types=1);

namespace Modules\Marketing\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Marketing\Http\Requests\Admin\SaveTestimonialRequest;
use Modules\Marketing\Http\Resources\Admin\AdminTestimonialResource;
use Modules\Marketing\Models\TestimonialModel;

final class StoreTestimonialAction extends BaseApiAction
{
    public function __invoke(SaveTestimonialRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('create', TestimonialModel::class);

        $testimonial = TestimonialModel::query()->create($request->validated());

        return $this->created(data: new AdminTestimonialResource($testimonial->refresh()), message: __('marketing::marketing.testimonial_saved'));
    }
}
