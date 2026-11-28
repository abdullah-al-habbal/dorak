<?php

declare(strict_types=1);

use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Constants\StaffPasswordResetConstants;
use Modules\Core\Enums\TokenAbility;
use Modules\Core\Services\StaffPasswordResetCodes;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Models\DashboardRefreshTokenModel;
use Modules\Dashboard\Repositories\DashboardRefreshTokenResolver;
use Modules\Dashboard\Support\DashboardActor;

const SET_BRANCH_PASSWORD = 'a-password-set-for-the-branch';

/** A branch with an app sign-in, a dashboard session, a reset link and a pending app reset code. */
function setPasswordBranch(BrandModel $brand): array
{
    $branch = BranchModel::factory()->create(['brand_id' => $brand->id, 'password' => Hash::make('password')]);
    $appToken = $branch->createToken('branch-app', TokenAbility::forBranchApp());
    app(DashboardRefreshTokenResolver::class)->issue(new DashboardActor((string) $branch->id, DashboardActorTypeEnum::Branch, 'branch_manager', (string) $branch->id));
    $link = Password::broker('branches')->createToken($branch);
    app(StaffPasswordResetCodes::class)->issue(StaffPasswordResetConstants::STAFF_PASSWORD_RESET_SCOPE_BRANCH, (string) $branch->id, '123456');

    return [$branch, $appToken->accessToken->getKey(), $link];
}

function setPasswordSessions(BranchModel $branch): int
{
    return DashboardRefreshTokenModel::query()->where('actor_id', $branch->id)->whereNull('revoked_at')->count();
}

function setPasswordPayload(BranchModel $branch, array $extra): array
{
    return ['brand_id' => $branch->brand_id, 'name' => ['en' => 'Main', 'ar' => 'الرئيسي'], 'email' => $branch->email, ...$extra];
}

/** BG-63: a branch password set from the dashboard or the owner app ends that branch's sessions. */
describe('Branch password set through the branch update', function (): void {
    beforeEach(function (): void {
        $this->owner = ClientModel::factory()->create();
        $this->brand = BrandModel::factory()->create(['owner_id' => $this->owner->id]);
    });

    it('ends every session of that branch and of no other', function (string $caller): void {
        [$branch, $appTokenId, $link] = setPasswordBranch($this->brand);
        [$other, $otherTokenId] = setPasswordBranch($this->brand);
        $url = "/api/v1/dashboard/branches/{$branch->id}";

        if ($caller === 'owner app') {
            $url = "/api/v1/owner/branches/{$branch->id}";
            $this->withToken($this->owner->createToken('client-app', $this->owner->accessTokenAbilities())->plainTextToken);
        } else {
            $this->authenticateDashboardActor(match ($caller) {
                'admin' => AdminModel::factory()->create(),
                'owner' => $this->owner,
                'its own manager' => $branch,
            });
        }

        $this->putJson($url, setPasswordPayload($branch, ['password' => SET_BRANCH_PASSWORD]))->assertOk();

        expect(Hash::check(SET_BRANCH_PASSWORD, $branch->fresh()->password))->toBeTrue()
            ->and($branch->tokens()->count())->toBe(0)
            ->and($branch->tokens()->whereKey($appTokenId)->exists())->toBeFalse()
            ->and(setPasswordSessions($branch))->toBe(0)
            ->and(Password::broker('branches')->tokenExists($branch, $link))->toBeFalse()
            ->and(app(StaffPasswordResetCodes::class)->redeem(StaffPasswordResetConstants::STAFF_PASSWORD_RESET_SCOPE_BRANCH, (string) $branch->id, '123456'))->toBeFalse()
            ->and($other->tokens()->whereKey($otherTokenId)->exists())->toBeTrue()
            ->and(setPasswordSessions($other))->toBe(1);
    })->with(['admin', 'owner', 'owner app', 'its own manager']);

    it('keeps the sessions when the update sets no password', function (): void {
        [$branch, $appTokenId] = setPasswordBranch($this->brand);
        $this->authenticateDashboardActor($this->owner);

        $this->putJson("/api/v1/dashboard/branches/{$branch->id}", setPasswordPayload($branch, []))->assertOk();

        expect($branch->tokens()->whereKey($appTokenId)->exists())->toBeTrue()
            ->and(setPasswordSessions($branch))->toBe(1);
    });

    it('keeps the old password and the sessions when revocation fails', function (): void {
        [$branch, $appTokenId] = setPasswordBranch($this->brand);
        $this->authenticateDashboardActor($this->owner);
        DB::listen(function (QueryExecuted $query): void {
            if (str_starts_with($query->sql, 'update `dashboard_refresh_tokens`')) {
                throw new RuntimeException('revocation failed');
            }
        });

        $this->putJson("/api/v1/dashboard/branches/{$branch->id}", setPasswordPayload($branch, ['password' => SET_BRANCH_PASSWORD]))->assertServerError();

        expect(Hash::check('password', $branch->fresh()->password))->toBeTrue()
            ->and($branch->tokens()->whereKey($appTokenId)->exists())->toBeTrue()
            ->and(setPasswordSessions($branch))->toBe(1);
    });
});
