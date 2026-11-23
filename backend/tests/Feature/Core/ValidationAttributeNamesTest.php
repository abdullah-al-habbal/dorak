<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Validator;
use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Preference\Enums\PreferenceableTypeEnum;
use Modules\Preference\Models\PreferenceModel;

/*
 * BaseApiFormRequest::attributes() names translatable fields readably for every API surface. The error keys stay
 * `name.en` and friends, so clients that map errors onto fields (the dashboard, the mobile apps) keep working.
 */

beforeEach(function (): void {
    config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);
});

describe('Readable validation attribute names', function (): void {
    it('names a missing English name on a dashboard request and keeps the error keys', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->postJson('/api/v1/dashboard/admin/catalog-categories', ['name' => ['en' => '', 'ar' => '']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name.en' => 'The English name field is required.',
                'name.ar' => 'The Arabic name field is required.',
            ]);
    });

    it('names translatable fields on a mobile-facing request too', function (): void {
        $this->actingAs(BranchModel::factory()->create(), 'branch_api')
            ->patchJson('/api/v1/branch/profile', ['name' => ['en' => str_repeat('a', 300)], 'address' => ['ar' => ['not text']]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name.en' => 'The English name field must not be greater than 100 characters.',
                'address.ar' => 'The Arabic address field must be a string.',
            ]);
    });

    it('leaves fields outside the map as they were', function (): void {
        $this->actingAs(BranchModel::factory()->create(), 'branch_api')
            ->patchJson('/api/v1/branch/profile', ['latitude' => 200])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['latitude' => 'The latitude field must be between -90 and 90.']);
    });

    it('answers a dashboard request in Arabic, rule text and field names, when the page is Arabic', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->withHeaders(['Accept-Language' => 'ar'])
            ->postJson('/api/v1/dashboard/admin/catalog-categories', ['name' => ['en' => '', 'ar' => '']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name.en' => 'الحقل الاسم بالإنجليزية مطلوب.',
                'name.ar' => 'الحقل الاسم بالعربية مطلوب.',
            ]);
    });

    it('keeps the English text when the page is English', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->withHeaders(['Accept-Language' => 'en'])
            ->postJson('/api/v1/dashboard/admin/catalog-categories', ['name' => ['en' => '', 'ar' => '']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name.en' => 'The English name field is required.']);
    });

    it('uses the stored Arabic preference of an admin when the request carries no Accept-Language', function (): void {
        $admin = AdminModel::factory()->create();
        PreferenceModel::factory()->create(['preferenceable_type' => PreferenceableTypeEnum::Admin->value, 'preferenceable_id' => $admin->id, 'preferred_language' => 'ar']);
        $this->authenticateDashboardActor($admin);

        // The framework's synthetic requests carry a default `en-us` header; the empty value makes it really absent.
        $this->withServerVariables(['HTTP_ACCEPT_LANGUAGE' => ''])
            ->postJson('/api/v1/dashboard/admin/catalog-categories', ['name' => ['en' => '', 'ar' => '']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name.en' => 'الحقل الاسم بالإنجليزية مطلوب.']);
    });

    it('uses the stored Arabic preference of an owner on the operations routes without Accept-Language', function (): void {
        $owner = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $owner->id]);
        PreferenceModel::factory()->create(['preferenceable_type' => PreferenceableTypeEnum::Client->value, 'preferenceable_id' => $owner->id, 'preferred_language' => 'ar']);
        $this->authenticateDashboardActor($owner);

        $this->withServerVariables(['HTTP_ACCEPT_LANGUAGE' => ''])
            ->postJson('/api/v1/dashboard/branches', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name.en' => 'الحقل الاسم بالإنجليزية مطلوب.']);
    });
});

describe('Arabic validation files', function (): void {
    /** @return list<string> */
    function validationLineKeys(array $lines, string $prefix = ''): array
    {
        $keys = [];

        foreach ($lines as $key => $value) {
            $path = $prefix.$key;
            array_push($keys, ...(is_array($value) ? validationLineKeys($value, $path.'.') : [$path]));
        }

        return $keys;
    }

    it('translates every rule the framework ships in English', function (): void {
        $english = require base_path('vendor/laravel/framework/src/Illuminate/Translation/lang/en/validation.php');
        $arabic = require base_path('lang/ar/validation.php');

        $missing = array_diff(validationLineKeys($english), validationLineKeys($arabic), ['custom.attribute-name.rule-name']);

        expect($missing)->toBe([]);
    });

    it('names a missing group in the language of the page', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->withHeaders(['Accept-Language' => 'ar'])
            ->postJson('/api/v1/dashboard/admin/catalog-tags', ['name' => ['en' => 'Eco', 'ar' => 'بيئة'], 'group_name' => ['en' => 'Values']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['group_name.ar' => 'الحقل المجموعة بالعربية مطلوب عند وجود المجموعة.']);
    });

    it('gives every common request field an Arabic name, so no Latin field name reaches an Arabic error', function (string $field): void {
        app()->setLocale('ar');

        $message = Validator::make([$field => null], [$field => 'required'])->errors()->first($field);

        expect($message)->not->toBe('')->and(preg_match('/[A-Za-z]/', $message))->toBe(0);
    })->with([
        'group_name',
        'search',
        'q',
        'code',
        'is_active',
        'universe',
        'sort_order',
        'latitude',
        'longitude',
        'radius',
        'price_range',
        'from',
        'to',
        'date',
        'date_from',
        'date_to',
        'starts_at',
        'ends_at',
        'price_amount_minor',
        'duration_minutes',
        'default_duration_minutes',
        'currency_code',
        'amount',
        'commission_percent',
        'rating',
        'rating_min',
        'body',
        'message',
        'note',
        'admin_note',
        'client_notes',
        'barber_notes',
        'cover_letter',
        'photo',
        'avatar',
        'file',
        'label',
        'slug',
        'sku',
        'bio',
        'requirements',
        'subtitle',
        'home_address',
        'contact_email',
        'customer_name',
        'customer_email',
        'customer_phone',
        'weekdays',
    ]);

    it('has the same translatable field names in both languages', function (): void {
        $english = require base_path('modules/Core/Lang/en/validation.php');
        $arabic = require base_path('modules/Core/Lang/ar/validation.php');

        expect(array_keys($arabic['attributes']))->toBe(array_keys($english['attributes']));
    });
});
