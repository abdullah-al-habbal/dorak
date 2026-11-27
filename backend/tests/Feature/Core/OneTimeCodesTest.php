<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Sleep;
use Modules\Core\Constants\OneTimeCodeConstants;
use Modules\Core\Services\OneTimeCodes;

/** BG-28: the shared one-time code service. The parallel cases are in tests/Concurrency. */
describe('OneTimeCodes', function (): void {
    it('accepts a right code once and returns what it is bound to', function (): void {
        $codes = app(OneTimeCodes::class);
        $codes->issue('k', '123456', now()->addMinutes(5), ['phone' => '+963900000000']);

        expect($codes->check('k', '123456', 3))->toBeTrue()
            ->and($codes->redeem('k', '123456', 3))->toBe(['phone' => '+963900000000'])
            ->and($codes->redeem('k', '123456', 3))->toBeNull();
    });

    it('burns the code at the attempt limit and keeps its expiry until then', function (): void {
        $codes = app(OneTimeCodes::class);
        $codes->issue('k', '123456', now()->addMinutes(5));

        $codes->redeem('k', '000000', 2);
        $this->travel(6)->minutes();
        expect($codes->redeem('k', '123456', 2))->toBeNull();

        $codes->issue('k', '123456', now()->addMinutes(5));
        $codes->redeem('k', '000000', 2);
        $codes->redeem('k', '000000', 2);
        expect($codes->redeem('k', '123456', 2))->toBeNull();
    });

    it('treats a value stored before BG-28 as no code', function (): void {
        Cache::put('k', '123456', 600);

        expect(app(OneTimeCodes::class)->redeem('k', '123456', 3))->toBeNull();
    });

    it('spends a hash on a guess that has no pending code, like on a real one', function (): void {
        Hash::spy();

        app(OneTimeCodes::class)->redeem('nobody', '123456', 3);

        Hash::shouldHaveReceived('make')->once();
    });

    it('refuses while another request holds the code', function (): void {
        $codes = app(OneTimeCodes::class);
        $codes->issue('k', '123456', now()->addMinutes(5));
        $held = Cache::lock('k'.OneTimeCodeConstants::LOCK_SUFFIX, OneTimeCodeConstants::LOCK_TTL_SECONDS);
        expect($held->get())->toBeTrue();
        // The wait for the lock is timed with the framework clock, so each retry moves it on.
        Sleep::fake(syncWithCarbon: true);

        expect($codes->redeem('k', '123456', 3))->toBeNull();

        $held->release();
        expect($codes->redeem('k', '123456', 3))->toBe([]);
    });
});
