<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Profile;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\Profile\RequestDashboardEmailChangeHandler;
use Modules\Dashboard\Http\Requests\Business\RequestDashboardEmailChangeRequest;
use Modules\Dashboard\Mail\SendDashboardEmailChangeCode;
use Modules\Dashboard\Support\DashboardActor;

final class RequestEmailChangeAction extends BaseApiAction
{
    public function __construct(private readonly RequestDashboardEmailChangeHandler $handler) {}

    public function __invoke(RequestDashboardEmailChangeRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $result = $this->handler->handle($actor, $request->toCommand());
        if ($result === null) {
            return $this->unprocessable(__('dashboard::messages.email_already_in_use'), ['email' => [__('dashboard::messages.email_already_in_use')]]);
        }

        Mail::to($result['change']->email)->send(new SendDashboardEmailChangeCode($result['code']));

        return $this->success(data: ['pending_email' => $result['change']->email, 'expires_at' => $result['change']->expires_at->toIso8601String()]);
    }
}
