<?php

declare(strict_types=1);

namespace Modules\Marketing\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Marketing\Http\Resources\Admin\AdminMarketingPageResource;
use Modules\Marketing\Http\Resources\Admin\AdminTestimonialResource;
use Modules\Marketing\Models\MarketingPageModel;
use Modules\Marketing\Models\TestimonialModel;

/** Every page with its ordered sections, and the testimonials (they belong to a section but are edited as a list). */
final class ListMarketingPagesAction extends BaseApiAction
{
    public function __invoke(Request $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('viewAny', MarketingPageModel::class);

        $pages = MarketingPageModel::query()->with('sections')->orderBy('slug')->get();
        $testimonials = TestimonialModel::query()->orderBy('sort_order')->orderBy('author_name')->get();

        return $this->ok(data: [
            'pages' => AdminMarketingPageResource::collection($pages),
            'testimonials' => AdminTestimonialResource::collection($testimonials),
        ]);
    }
}
