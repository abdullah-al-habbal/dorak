<?php

declare(strict_types=1);

namespace Modules\Subscription\Http\Requests\Admin;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Subscription\CQRS\Command\AssignSubscriptionCommand;

final class AssignSubscriptionRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'brand_id' => ['required', 'uuid', 'exists:brands,id'],
            'plan_id' => ['required', 'uuid', 'exists:subscription_plans,id,deleted_at,NULL'],
        ];
    }

    public function toCommand(): AssignSubscriptionCommand
    {
        return new AssignSubscriptionCommand(
            brandId: $this->string('brand_id')->toString(),
            planId: $this->string('plan_id')->toString(),
        );
    }
}
