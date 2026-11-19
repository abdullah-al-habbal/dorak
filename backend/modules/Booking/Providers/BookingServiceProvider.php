<?php

declare(strict_types=1);

namespace Modules\Booking\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Modules\Booking\Constants\BookingConstants;
use Modules\Booking\Models\BookingIdempotencyKeyModel;
use Modules\Booking\Models\BookingModel;
use Modules\Booking\Policies\BookingPolicy;
use Modules\Core\Providers\BaseModuleServiceProvider;

final class BookingServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'booking';
    }

    protected function afterBoot(): void
    {
        Gate::policy(BookingModel::class, BookingPolicy::class);
        $this->scheduleIdempotencyKeyPruning();

        RateLimiter::for(BookingConstants::BOOKING_WRITE_LIMITER, fn (Request $request): Limit => Limit::perMinute(BookingConstants::BOOKING_WRITE_PER_MINUTE)->by('booking-write:'.$this->clientKey($request)));
        RateLimiter::for(BookingConstants::BOOKING_READ_LIMITER, fn (Request $request): Limit => Limit::perMinute(BookingConstants::BOOKING_READ_PER_MINUTE)->by('booking-read:'.$this->clientKey($request)));
        RateLimiter::for(BookingConstants::BOOKING_SLOTS_LIMITER, fn (Request $request): Limit => Limit::perMinute(BookingConstants::BOOKING_SLOTS_PER_MINUTE)->by('booking-slots:'.$request->ip()));
    }

    private function scheduleIdempotencyKeyPruning(): void
    {
        $this->app->afterResolving(Schedule::class, function (Schedule $schedule): void {
            $schedule->command('model:prune', ['--model' => [BookingIdempotencyKeyModel::class]])
                ->dailyAt('03:30')
                ->withoutOverlapping();
        });
    }

    /** The signed-in client, else the IP, so one account cannot hide behind many addresses. */
    private function clientKey(Request $request): string
    {
        return (string) ($request->user('client')?->getAuthIdentifier() ?? $request->ip());
    }
}
