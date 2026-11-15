<?php

declare(strict_types=1);

namespace Modules\Dashboard\Support;

use Modules\Dashboard\Http\Actions\Barbers\DestroyBarberServiceOverrideAction;
use Modules\Dashboard\Http\Actions\Barbers\UpsertBarberServiceOverrideAction;
use Modules\Dashboard\Http\Actions\Branches\FlagBranchReviewDisputeAction;
use Modules\Dashboard\Http\Actions\Brands\StoreBrandAction;
use Modules\Dashboard\Http\Actions\Brands\UpdateBrandAction;
use Modules\Dashboard\Http\Actions\Business\CancelBookingAction;
use Modules\Dashboard\Http\Actions\Notifications\MarkAllDashboardNotificationsReadAction;
use Modules\Dashboard\Http\Actions\Notifications\MarkDashboardNotificationReadAction;
use Modules\Dashboard\Http\Actions\Owner\ResubmitBrandAction;
use Modules\Dashboard\Http\Actions\People\DestroyBranchJobPostingAction;
use Modules\Dashboard\Http\Actions\People\InviteBranchAffiliationAction;
use Modules\Dashboard\Http\Actions\People\MarkBranchApplicationsSeenAction;
use Modules\Dashboard\Http\Actions\People\RespondBranchAffiliationAction;
use Modules\Dashboard\Http\Actions\People\StoreBranchJobPostingAction;
use Modules\Dashboard\Http\Actions\People\TerminateBranchAffiliationAction;
use Modules\Dashboard\Http\Actions\People\UpdateBranchApplicationStatusAction;
use Modules\Dashboard\Http\Actions\People\UpdateBranchJobPostingAction;
use Modules\Dashboard\Http\Actions\Profile\RequestEmailChangeAction;
use Modules\Dashboard\Http\Actions\Profile\UpdateNotificationPreferencesAction;
use Modules\Dashboard\Http\Actions\Profile\UpdatePasswordAction;
use Modules\Dashboard\Http\Actions\Profile\UpdateProfileAction;
use Modules\Dashboard\Http\Actions\Profile\VerifyEmailChangeAction;
use Modules\Dashboard\Http\Actions\ServiceCategories\StoreServiceCategoryAction;
use Modules\Dashboard\Http\Actions\Shared\LogoutAction;
use Modules\Preference\Http\Actions\Dashboard\UpdateSettingsAction;

/**
 * Reviewed list of the tenant-reachable dashboard write actions that do not call `DashboardWriteGuard`
 * (F-01). `DashboardWriteGuardArchitectureTest` fails when a non-GET dashboard action is on neither list
 * nor calls the guard, and when an entry here goes stale. Platform-admin routes (guard bypassed by design)
 * and unauthenticated routes are recognised from their middleware and need no entry.
 */
final class DashboardWriteExemptions
{
    /** Self-account and session writes: always allowed, whatever the brand or branch state (decision A, point 3). */
    public const array SELF_ACCOUNT = [
        MarkAllDashboardNotificationsReadAction::class,
        MarkDashboardNotificationReadAction::class,
        RequestEmailChangeAction::class,
        UpdateNotificationPreferencesAction::class,
        UpdatePasswordAction::class,
        UpdateProfileAction::class,
        VerifyEmailChangeAction::class,
        LogoutAction::class,
        UpdateSettingsAction::class,
    ];

    /**
     * Writes that stay allowed while a brand or branch is Suspended on purpose (decision A, point 2): cancelling an
     * existing booking. (A status change to anything but cancelled goes through the guard in `UpdateBookingStatusAction`.)
     */
    public const array ALLOWED_WHEN_SUSPENDED = [
        CancelBookingAction::class,
    ];

    /**
     * Operational writes still waiting to adopt the guard. Value: the slice that converts the action; the
     * slice removes the entry in the same commit that adds the guard call.
     */
    public const array PENDING = [
        DestroyBarberServiceOverrideAction::class => 'S5',
        UpsertBarberServiceOverrideAction::class => 'S5',
        FlagBranchReviewDisputeAction::class => 'S5',
        StoreBrandAction::class => 'S5',
        UpdateBrandAction::class => 'S5',
        ResubmitBrandAction::class => 'S5',
        DestroyBranchJobPostingAction::class => 'S5',
        InviteBranchAffiliationAction::class => 'S5',
        MarkBranchApplicationsSeenAction::class => 'S5',
        RespondBranchAffiliationAction::class => 'S5',
        StoreBranchJobPostingAction::class => 'S5',
        TerminateBranchAffiliationAction::class => 'S5',
        UpdateBranchApplicationStatusAction::class => 'S5',
        UpdateBranchJobPostingAction::class => 'S5',
        StoreServiceCategoryAction::class => 'S8',
    ];

    private function __construct() {}
}
