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

        $providerId = $socialUser->getId();
        $email = $socialUser->getEmail();
        $name = $socialUser->getName();
        $avatar = $socialUser->getAvatar();

        $socialAccount = $this->resolver->findSocialAccount($command->provider, $providerId);

        if ($socialAccount !== null) {
            $client = $socialAccount->client;
            $isNew = false;
        } else {
            if (! $this->providerVerifiedEmail($socialUser, $email)) {
                return SocialLoginResult::emailNotVerified();
            }

            $client = $this->resolver->findClientByEmail($email);

            if ($client === null) {
                $client = $this->resolver->createClient($name ?: Str::before($email, '@'), $email);
            }

            $this->resolver->createSocialAccount($client, $command->provider, $providerId, $avatar);
            $isNew = true;
        }

        if (! $client instanceof ClientModel) {
            return SocialLoginResult::invalidToken();
        }

        if ($client->isBanned()) {
            throw new AccountBannedException;
        }

        if ($client->getAttribute('status') === ClientStatusEnum::Disabled
            || ($client->getAttribute('status') === ClientStatusEnum::Pending && $client->getAttribute('email_verified_at') !== null)) {
            throw new AccountNotActiveException;
        }

        $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

        return SocialLoginResult::success(
            token: $token,
            clientData: ClientProfileResource::make($client->refresh())->resolve(),
            isNew: $isNew,
        );
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
