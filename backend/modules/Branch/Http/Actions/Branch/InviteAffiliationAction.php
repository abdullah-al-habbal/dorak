<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Modules\BarberAffiliation\Eloquent\Resolvers\Barber\BarberAlreadyAffiliatedException;
use Modules\BarberAffiliation\Handlers\Branch\InviteAffiliationHandler;
use Modules\BarberAffiliation\Http\Resources\Barber\BarberAffiliationResource;
use Modules\BarberAffiliation\Jobs\AffiliationInvitedNotification;
use Modules\Branch\Http\Requests\Branch\InviteAffiliationRequest;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;

final class InviteAffiliationAction extends BaseApiAction
{
    public function __construct(
        private readonly InviteAffiliationHandler $handler,
    ) {}

    public function __invoke(InviteAffiliationRequest $request): JsonResponse
    {
        $branch = $request->user('branch_api');

        try {
            $affiliation = $this->handler->handle($request->toCommand($branch->id));
        } catch (BarberAlreadyAffiliatedException) {
            return $this->businessError(
                ErrorCodeEnum::CONFLICT,
                message: __('barberaffiliation::messages.already_affiliated'),
            );
        }

        AffiliationInvitedNotification::dispatch((string) $affiliation->id, app()->getLocale())->afterCommit();

        return $this->created(
            data: new BarberAffiliationResource($affiliation),
            message: __('barberaffiliation::messages.created'),
        );
    }
}
