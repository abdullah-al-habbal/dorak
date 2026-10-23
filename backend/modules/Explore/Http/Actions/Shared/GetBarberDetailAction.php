<?php

declare(strict_types=1);

namespace Modules\Explore\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\ClientInteraction\Enums\InteractableTypeEnum;
use Modules\ClientInteraction\Services\ClientInteractionRecorder;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Explore\Handlers\Shared\GetBarberDetailHandler;
use Modules\Explore\Http\Requests\Shared\GetBarberDetailRequest;

final class GetBarberDetailAction extends BaseApiAction
{
    public function __construct(
        private readonly ClientInteractionRecorder $interactions,
        private readonly GetBarberDetailHandler $handler,
    ) {}

    public function __invoke(GetBarberDetailRequest $request, string $barber): JsonResponse
    {
        $data = $this->handler->handle($request->toQuery($barber));

        $this->interactions->view($request, InteractableTypeEnum::Barber, $barber);

        return $this->ok(data: $data);
    }
}
