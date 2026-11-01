<?php

declare(strict_types=1);

use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Dashboard\Mail\SendDashboardEmailChangeCode;
use Modules\Dashboard\Models\DashboardEmailChangeModel;
use Modules\Dashboard\Models\DashboardNotificationPreferenceModel;
use Tests\TestCase;

describe('Dashboard profile API', function (): void {
    beforeEach(function (): void {
        $this->withoutMiddleware(ThrottleRequests::class);

        config([
            'dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters',
        ]);
    });

    it('updates its authenticated actor profile without exposing another actor', function (): void {
        $admin = AdminModel::factory()->create([
            'email' => 'profile@example.test',
            'password' => Hash::make('password'),
        ]);
        $token = dashboardProfileToken($this, $admin);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson('/api/v1/dashboard/profile', ['display_name' => 'Updated Profile'])
            ->assertOk()
            ->assertJsonPath('data.display_name', 'Updated Profile')
            ->assertJsonPath('data.email', $admin->email);

        expect($admin->fresh()->getTranslation('name', app()->getLocale()))->toBe('Updated Profile');
    });

    it('changes password only when current password matches', function (): void {
        $admin = AdminModel::factory()->create([
            'email' => 'security@example.test',
            'password' => Hash::make('password'),
        ]);
        $token = dashboardProfileToken($this, $admin);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/v1/dashboard/profile/password', [
                'current_password' => 'wrong-password',
                'password' => 'new-secure-password',
                'password_confirmation' => 'new-secure-password',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('current_password');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/v1/dashboard/profile/password', [
                'current_password' => 'password',
                'password' => 'new-secure-password',
                'password_confirmation' => 'new-secure-password',
            ])
            ->assertOk()
            ->assertJsonPath('data.password_updated', true);

        expect(Hash::check('new-secure-password', (string) $admin->fresh()->getAuthPassword()))->toBeTrue();
    });

    it('returns defaults then persists notification preferences per actor', function (): void {
        $admin = AdminModel::factory()->create();
        $token = dashboardProfileToken($this, $admin);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/dashboard/profile/notifications')
            ->assertOk()
            ->assertJsonPath('data.email_enabled', true)
            ->assertJsonPath('data.push_enabled', true);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->patchJson('/api/v1/dashboard/profile/notifications', [
                'email_enabled' => false,
                'push_enabled' => true,
                'booking_enabled' => false,
                'system_enabled' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.email_enabled', false)
            ->assertJsonPath('data.booking_enabled', false);

        $this->assertDatabaseHas('dashboard_notification_preferences', [
            'actor_type' => 'admin',
            'actor_id' => $admin->id,
            'email_enabled' => false,
            'booking_enabled' => false,
        ]);
        expect(DashboardNotificationPreferenceModel::query()->count())->toBe(1);
    });

    it('keeps the current email active until the new email is verified', function (): void {
        Mail::fake();
        $admin = AdminModel::factory()->create(['email' => 'current@example.test', 'password' => Hash::make('password')]);
        $token = dashboardProfileToken($this, $admin);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/dashboard/profile/email/change', ['email' => 'new@example.test'])
            ->assertOk()
            ->assertJsonPath('data.pending_email', 'new@example.test');

        expect($admin->fresh()->email)->toBe('current@example.test');
        Mail::assertSent(SendDashboardEmailChangeCode::class, fn (SendDashboardEmailChangeCode $mail): bool => $mail->hasTo('new@example.test'));

        DashboardEmailChangeModel::query()->where('actor_id', $admin->id)->update(['code_hash' => Hash::make('123456')]);
        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/dashboard/profile/email/verify', ['code' => '123456'])
            ->assertOk()
            ->assertJsonPath('data.email', 'new@example.test');

        expect($admin->fresh()->email)->toBe('new@example.test');
        $this->assertDatabaseMissing('dashboard_email_changes', ['actor_id' => $admin->id]);
    });

    it('applies a verified email change to the authenticated manager and barber models', function (): void {
        Mail::fake();
        $manager = BranchModel::factory()->create([
            'email' => 'manager-current@example.test',
            'password' => Hash::make('password'),
        ]);
        $barber = BarberModel::factory()->create([
            'email' => 'barber-current@example.test',
            'password' => Hash::make('password'),
            'has_login' => true,
            'status' => BarberStatusEnum::Enabled,
        ]);

        foreach ([
            [$manager, 'branch', 'manager-new@example.test'],
            [$barber, 'barber', 'barber-new@example.test'],
        ] as [$model, $actorType, $newEmail]) {
            app('auth')->forgetGuards();
            $token = dashboardProfileToken($this, $model, $actorType);

            app('auth')->forgetGuards();
            $this->withHeader('Authorization', 'Bearer '.$token)
                ->postJson('/api/v1/dashboard/profile/email/change', ['email' => $newEmail])
                ->assertOk()
                ->assertJsonPath('data.pending_email', $newEmail);

            expect(DashboardEmailChangeModel::query()->pluck('actor_id')->all())->toContain($model->id);
            $change = DashboardEmailChangeModel::query()->where('actor_id', $model->id)->firstOrFail();
            expect($change->actor_type->value)->toBe($actorType);
            $change->forceFill(['code_hash' => Hash::make('123456')])->save();

            app('auth')->forgetGuards();
            $this->withHeader('Authorization', 'Bearer '.$token)
                ->postJson('/api/v1/dashboard/profile/email/verify', ['code' => '123456'])
                ->assertOk()
                ->assertJsonPath('data.email', $newEmail);

            expect($model->fresh()->email)->toBe($newEmail);
            $this->assertDatabaseMissing('dashboard_email_changes', [
                'actor_type' => $actorType,
                'actor_id' => $model->id,
            ]);
        }
    });
});

function dashboardProfileToken(TestCase $test, AdminModel|BranchModel|BarberModel $model, string $actorType = 'admin'): string
{
    return (string) $test->postJson('/api/v1/dashboard/login', [
        'actor_type' => $actorType,
        'email' => $model->email,
        'password' => 'password',
    ])->assertOk()->json('data.token');
}
