<?php

declare(strict_types=1);

namespace Modules\Explore\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\ClientInteraction\Enums\InteractableTypeEnum;
use Modules\ClientInteraction\Services\ClientInteractionRecorder;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Explore\Handlers\Shared\GetBranchDetailHandler;
use Modules\Explore\Http\Requests\Shared\GetBranchDetailRequest;

final class GetBranchDetailAction extends BaseApiAction
{
    public function __construct(
        private readonly ClientInteractionRecorder $interactions,
        private readonly GetBranchDetailHandler $handler,
    ) {}

    public function __invoke(GetBranchDetailRequest $request, string $branch): JsonResponse
    {
        $data = $this->handler->handle($request->toQuery($branch));

        $this->interactions->view($request, InteractableTypeEnum::Branch, $branch);

        return $this->ok(data: $data);
    }
}
