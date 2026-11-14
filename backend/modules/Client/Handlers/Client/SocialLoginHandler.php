<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Illuminate\Support\Str;
use Laravel\Socialite\AbstractUser as SocialUser;
use Laravel\Socialite\Facades\Socialite;
use Modules\Activation\Exceptions\AccountNotActiveException;
use Modules\Ban\Exceptions\AccountBannedException;
use Modules\Client\CQRS\Command\Client\SocialLoginCommand;
use Modules\Client\Eloquent\Resolvers\Client\SocialLoginEloquentResolver;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Client\Http\Resources\Client\ClientProfileResource;
use Modules\Client\Models\ClientModel;
use Modules\Client\ValuesObjects\SocialLoginResult;
use Throwable;

final class SocialLoginHandler
{
    public function __construct(
        private readonly SocialLoginEloquentResolver $resolver,
    ) {}

    public function handle(SocialLoginCommand $command): SocialLoginResult
    {
        try {
            $socialUser = Socialite::driver($command->provider->value)->stateless()->userFromToken($command->accessToken);
        } catch (Throwable) {
            return SocialLoginResult::invalidToken();
        }

        $socialAccount = $this->resolver->findSocialAccount($command->provider, $socialUser->getId());
        $isNew = $socialAccount === null;

        if ($isNew) {
            if (! $this->providerVerifiedEmail($socialUser, $socialUser->getEmail())) {
                return SocialLoginResult::emailNotVerified();
            }

            $client = $this->linkOrCreateClient($command, $socialUser);
        } else {
            $client = $socialAccount->client;
        }

        if (! $client instanceof ClientModel) {
            return SocialLoginResult::invalidToken();
        }

        $this->ensureClientMayLogin($client);

        $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

        return SocialLoginResult::success(
            token: $token,
            clientData: ClientProfileResource::make($client->refresh())->resolve(),
            isNew: $isNew,
        );
    }

    private function linkOrCreateClient(SocialLoginCommand $command, SocialUser $socialUser): ClientModel
    {
        $email = $socialUser->getEmail();
        $client = $this->resolver->findClientByEmail($email)
            ?? $this->resolver->createClient($socialUser->getName() ?: Str::before($email, '@'), $email);

        $this->resolver->createSocialAccount($client, $command->provider, $socialUser->getId(), $socialUser->getAvatar());

        return $client;
    }

    private function ensureClientMayLogin(ClientModel $client): void
    {
        if ($client->isBanned()) {
            throw new AccountBannedException;
        }

        if ($client->getAttribute('status') === ClientStatusEnum::Disabled
            || ($client->getAttribute('status') === ClientStatusEnum::Pending && $client->getAttribute('email_verified_at') !== null)) {
            throw new AccountNotActiveException;
        }
    }

    /**
     * An email may only link to or create an account when the provider vouches for it
     * (`email_verified` for OIDC, `verified_email` for Google's v2 userinfo).
     * A missing flag counts as unverified.
     */
    private function providerVerifiedEmail(SocialUser $socialUser, ?string $email): bool
    {
        if ($email === null || $email === '') {
            return false;
        }

        $raw = $socialUser->getRaw() ?? [];

        foreach (['email_verified', 'verified_email'] as $flag) {
            if (array_key_exists($flag, $raw)) {
                return filter_var($raw[$flag], FILTER_VALIDATE_BOOLEAN);
            }
        }

        return false;
    }
}
