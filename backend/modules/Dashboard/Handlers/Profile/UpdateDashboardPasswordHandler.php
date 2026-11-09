<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Profile;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\CQRS\Command\UpdateDashboardPasswordCommand;
use Modules\Dashboard\Eloquent\Resolvers\Profile\UpdateDashboardPasswordEloquentResolver;
use Modules\Dashboard\Services\DashboardCredentialRevoker;
use Modules\Dashboard\Services\DashboardMobileResetCodeCleaner;

final class UpdateDashboardPasswordHandler
{
    public function __construct(
        private readonly UpdateDashboardPasswordEloquentResolver $resolver,
        private readonly DashboardCredentialRevoker $credentials,
        private readonly DashboardMobileResetCodeCleaner $mobileCodes,
    ) {}

    public function handle(AdminModel|BranchModel|BarberModel|ClientModel $model, UpdateDashboardPasswordCommand $command): bool
    {
        if (! Hash::check($command->currentPassword, (string) $model->getAuthPassword())) {
            return false;
        }

        DB::transaction(function () use ($model, $command): void {
            $this->resolver->resolve($model, $command->password);
            $this->credentials->revokeOthers($command->actorType, $model, $command->keepAccessTokenId, $command->keepRefreshToken);
            $this->mobileCodes->clear($command->actorType, (string) $model->getKey());
        });

        return true;
    }
}
