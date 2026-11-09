<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Password;

use Modules\Dashboard\CQRS\Command\ForgotDashboardPasswordCommand;
use Modules\Dashboard\Repositories\DashboardPasswordResetAccountResolver;
use Modules\Dashboard\Services\DashboardPasswordResetLinkSender;
use Throwable;

use function Illuminate\Support\defer;

/**
 * Looks the account up and mails the link only after the response is sent, so
 * a known email answers exactly like an unknown one, in content and in time.
 */
final class ForgotDashboardPasswordHandler
{
    public function __construct(
        private readonly DashboardPasswordResetAccountResolver $accounts,
        private readonly DashboardPasswordResetLinkSender $links,
    ) {}

    public function handle(ForgotDashboardPasswordCommand $command): void
    {
        defer(function () use ($command): void {
            try {
                $account = $this->accounts->find($command->actorType, $command->email);

                if ($account !== null) {
                    $this->links->send($command->actorType, $account, $command->requestLocale);
                }
            } catch (Throwable $exception) {
                report($exception);
            }
        });
    }
}
