<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Stylists;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\DestroyStylistCommand;
use Modules\Dashboard\CQRS\Query\ShowStylistQuery;
use Modules\Dashboard\Handlers\Stylists\DestroyStylistHandler;
use Modules\Dashboard\Handlers\Stylists\ShowStylistHandler;
use Modules\Dashboard\Support\DashboardActor;

final class DestroyStylistAction extends BaseApiAction
{
    public function __construct(
        private readonly BrandFeatures $brandFeatures,
        private readonly ShowStylistHandler $showHandler,
        private readonly DestroyStylistHandler $destroyHandler,
    ) {}

    public function __invoke(Request $request, string $stylist): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $model = $this->showHandler->handle(new ShowStylistQuery(
            $stylist,
            $actor->scopedBranchIds(),
        ));
        $this->brandFeatures->ensureBranchManageable($model->managed_by_branch_id);
        $this->destroyHandler->handle($model, new DestroyStylistCommand($stylist));

        return $this->deleted();
    }
}
