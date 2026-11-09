<?php

declare(strict_types=1);

namespace Modules\Dashboard\Services;

use Illuminate\Auth\Passwords\PasswordBroker;
use Illuminate\Contracts\Auth\PasswordBrokerFactory;
use Illuminate\Support\Facades\Mail;
use LogicException;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\Constants\DashboardPasswordResetConstants;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Mail\SendDashboardPasswordResetLink;
use Modules\Dashboard\Repositories\DashboardPreferredLocaleResolver;

/**
 * Issues a dashboard password-reset link for any account type and mails it in
 * the account's preferred language. The broker stores only a hash of the token;
 * the plain token exists only inside the link. Reusable by flows that invite an
 * account to set its first password (NS-04).
 */
final class DashboardPasswordResetLinkSender
{
    public function __construct(
        private readonly PasswordBrokerFactory $brokers,
        private readonly DashboardPreferredLocaleResolver $locales,
    ) {}

    /** Returns false, without mailing, while the broker's per-account throttle holds the previous link. */
    public function send(DashboardActorTypeEnum $actorType, AdminModel|BranchModel|BarberModel|ClientModel $account, string $fallbackLocale): bool
    {
        $broker = $this->broker($actorType);

        if ($broker->getRepository()->recentlyCreatedToken($account)) {
            return false;
        }

        $email = $account->getEmailForPasswordReset();
        $locale = $this->locales->resolve($actorType, (string) $account->getKey(), $fallbackLocale);
        $mail = new SendDashboardPasswordResetLink(
            url: $this->url($actorType, $broker->createToken($account), $email),
            expiresInMinutes: $this->expiresInMinutes($actorType),
        );

        Mail::to($email)->locale($locale)->send($mail);

        return true;
    }

    private function broker(DashboardActorTypeEnum $actorType): PasswordBroker
    {
        $broker = $this->brokers->broker($actorType->passwordBroker()->value);

        return $broker instanceof PasswordBroker ? $broker : throw new LogicException('Unsupported password broker.');
    }

    private function url(DashboardActorTypeEnum $actorType, string $token, string $email): string
    {
        $base = (string) config(DashboardPasswordResetConstants::DASHBOARD_PASSWORD_RESET_FRONTEND_URL_CONFIG);
        $path = sprintf(DashboardPasswordResetConstants::DASHBOARD_PASSWORD_RESET_PATH, $actorType->portalSegment());

        return $base.$path.'?'.http_build_query(['token' => $token, 'email' => $email]);
    }

    private function expiresInMinutes(DashboardActorTypeEnum $actorType): int
    {
        return (int) config('auth.passwords.'.$actorType->passwordBroker()->value.'.expire');
    }
}
