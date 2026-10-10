<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Branch\Http\Resources\Shared\ChairResource;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Core\Http\Actions\BaseApiAction;

final class ListBranchChairsAction extends BaseApiAction
{
    public function __invoke(Request $request): JsonResponse
    {
        $branch = $request->user('branch_api');
        if (! $branch instanceof BranchModel) {
            abort(401);
        }
        Gate::forUser($branch)->authorize('manage', $branch);
        $chairs = ChairModel::query()->where('branch_id', $branch->id)->with('barber')->paginate($request->integer('per_page', 15));

        return $this->paginated(paginator: $chairs, resourceClass: ChairResource::class);
    }
}
