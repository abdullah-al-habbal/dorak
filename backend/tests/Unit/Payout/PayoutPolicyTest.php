<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Payout\Models\PayoutModel;
use Modules\Payout\Policies\PayoutPolicy;

// Decision D: creating, approving, paying and cancelling a payout are separate abilities; today every admin holds all of them.
it('grants every payout ability to an admin and none to anyone else', function (string $ability, bool $needsModel): void {
    $policy = new PayoutPolicy;
    $admin = new AdminModel;
    $barber = new BarberModel;
    $payout = new PayoutModel;

    $call = fn (mixed $actor): bool => $needsModel ? $policy->{$ability}($actor, $payout) : $policy->{$ability}($actor);

    expect($call($admin))->toBeTrue()
        ->and($call($barber))->toBeFalse();
})->with([
    'create' => ['create', false],
    'approve' => ['approve', true],
    'markPaid' => ['markPaid', true],
    'cancel' => ['cancel', true],
]);

it('keeps approval, payment and cancellation as their own policy methods', function (): void {
    foreach (['create', 'approve', 'markPaid', 'cancel'] as $ability) {
        expect(method_exists(PayoutPolicy::class, $ability))->toBeTrue();
    }
    expect(method_exists(PayoutPolicy::class, 'update'))->toBeFalse();
});
