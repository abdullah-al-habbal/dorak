<?php

declare(strict_types=1);

namespace Modules\Feedback\Services;

use Illuminate\Http\Request;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Feedback\Enums\FeedbackUserTypeEnum;

/**
 * Reads who is signed in from the bearer token, if there is one. The route is open to guests, so no auth
 * middleware runs; the sender can never choose their own identity from the request body.
 */
final class FeedbackAuthorResolver
{
    /** @return array{user_type: FeedbackUserTypeEnum, user_id: string}|null */
    public function resolve(Request $request): ?array
    {
        $candidates = [
            ['guard' => 'client', 'model' => ClientModel::class, 'type' => FeedbackUserTypeEnum::Client],
            ['guard' => 'barber', 'model' => BarberModel::class, 'type' => FeedbackUserTypeEnum::Barber],
            ['guard' => 'branch_api', 'model' => BranchModel::class, 'type' => FeedbackUserTypeEnum::Branch],
        ];

        foreach ($candidates as $candidate) {
            $user = $request->user($candidate['guard']);
            if ($user instanceof $candidate['model']) {
                return ['user_type' => $candidate['type'], 'user_id' => (string) $user->getKey()];
            }
        }

        return null;
    }
}
