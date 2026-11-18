<?php

declare(strict_types=1);

namespace Modules\Feedback\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Modules\Core\Providers\BaseModuleServiceProvider;
use Modules\Feedback\Constants\FeedbackConstants;
use Modules\Feedback\Models\FeedbackReportModel;
use Modules\Feedback\Policies\FeedbackReportPolicy;

final class FeedbackServiceProvider extends BaseModuleServiceProvider
{
    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleDir = dirname(__DIR__);
        $this->moduleNamespace = __NAMESPACE__;
        $this->moduleName = 'feedback';
    }

    protected function afterBoot(): void
    {
        Gate::policy(FeedbackReportModel::class, FeedbackReportPolicy::class);

        RateLimiter::for(FeedbackConstants::FEEDBACK_SUBMIT_LIMITER, fn (Request $request): Limit => Limit::perMinute(FeedbackConstants::FEEDBACK_SUBMIT_PER_MINUTE)->by('feedback-minute:'.$request->ip()));
        RateLimiter::for(FeedbackConstants::FEEDBACK_DAILY_LIMITER, fn (Request $request): Limit => Limit::perDay(FeedbackConstants::FEEDBACK_SUBMIT_PER_DAY)->by('feedback-day:'.$request->ip()));
    }
}
