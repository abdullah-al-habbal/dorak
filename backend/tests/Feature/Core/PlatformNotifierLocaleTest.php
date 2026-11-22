<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\DeviceTokenUserTypeEnum;
use Modules\Core\Enums\Locale;
use Modules\Core\Enums\PlatformEventEnum;
use Modules\Core\Models\NotificationModel;
use Modules\Core\Services\PlatformNotifier;
use Modules\Preference\Enums\PreferenceableTypeEnum;
use Modules\Preference\Models\PreferenceModel;

function prefer(PreferenceableTypeEnum $type, string $id, ?string $language): void
{
    PreferenceModel::factory()->create([
        'preferenceable_type' => $type->value,
        'preferenceable_id' => $id,
        'preferred_language' => $language,
    ]);
}

function storedRow(string $id): NotificationModel
{
    return NotificationModel::query()->where('notifiable_id', $id)->sole();
}

it('writes a platform notification in the language the recipient chose, not the request language', function (): void {
    $arabic = AdminModel::factory()->create();
    $english = AdminModel::factory()->create();
    prefer(PreferenceableTypeEnum::Admin, (string) $arabic->id, 'ar');
    prefer(PreferenceableTypeEnum::Admin, (string) $english->id, 'en');
    app()->setLocale('en');

    app(PlatformNotifier::class)->toAdmins(PlatformEventEnum::BrandSubmitted, 'brand-1');

    expect(storedRow((string) $arabic->id)->title)->toBe(PlatformEventEnum::BrandSubmitted->title('ar'))
        ->and(storedRow((string) $arabic->id)->title)->not->toBe(PlatformEventEnum::BrandSubmitted->title('en'))
        ->and(storedRow((string) $arabic->id)->body)->toBe(PlatformEventEnum::BrandSubmitted->body('ar'))
        ->and(storedRow((string) $english->id)->title)->toBe(PlatformEventEnum::BrandSubmitted->title('en'));
});

it('falls back to the default language when the recipient has no preference row or no supported value', function (): void {
    $barber = BarberModel::factory()->create();
    $client = ClientModel::factory()->create();
    prefer(PreferenceableTypeEnum::Client, (string) $client->id, null);
    app()->setLocale('ar');

    $notifier = app(PlatformNotifier::class);
    $notifier->toAccount(DeviceTokenUserTypeEnum::Barber, (string) $barber->id, PlatformEventEnum::BarberApproved, (string) $barber->id);
    $notifier->toAccount(DeviceTokenUserTypeEnum::Client, (string) $client->id, PlatformEventEnum::BrandApproved, 'brand-1');

    expect(storedRow((string) $barber->id)->title)->toBe(PlatformEventEnum::BarberApproved->title('en'))
        ->and(storedRow((string) $client->id)->title)->toBe(PlatformEventEnum::BrandApproved->title('en'));
});

it('keeps the event key and subject in the row so clients can still render their own text', function (): void {
    $barber = BarberModel::factory()->create();
    prefer(PreferenceableTypeEnum::Barber, (string) $barber->id, 'ar');

    app(PlatformNotifier::class)->toAccount(DeviceTokenUserTypeEnum::Barber, (string) $barber->id, PlatformEventEnum::BarberRejected, 'barber-9');

    expect(storedRow((string) $barber->id)->data)->toMatchArray(['event' => 'barber_rejected', 'subject_id' => 'barber-9']);
});

it('has a non-empty english and arabic title and body for every platform event', function (): void {
    foreach (PlatformEventEnum::cases() as $event) {
        foreach ([Locale::En, Locale::Ar] as $locale) {
            expect($event->title($locale->value))->not->toContain('platform_events')->not->toBe('')
                ->and($event->body($locale->value))->not->toContain('platform_events')->not->toBe('');
        }

        expect($event->title('ar'))->not->toBe($event->title('en'))
            ->and($event->body('ar'))->not->toBe($event->body('en'));
    }
});
