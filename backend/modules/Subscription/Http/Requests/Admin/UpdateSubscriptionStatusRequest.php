<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Subscription\Enums\SubscriptionStatus;

final class UpdateSubscriptionStatusRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return ['status' => ['required', Rule::enum(SubscriptionStatus::class)]];
    }

    public function status(): SubscriptionStatus
    {
        return SubscriptionStatus::from($this->string('status')->toString());
    }
}
