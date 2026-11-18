<?php

declare(strict_types=1);

use Modules\Marketing\Constants\MarketingPageConstants;

// The marketing pages are live from the first seed. The legal pages are seeded as drafts: their text is a placeholder
// until the owner approves the real wording and publishes each page from the dashboard.
return [
    [
        'slug' => 'home',
        'title' => ['en' => 'Home', 'ar' => 'الرئيسية'],
        'meta_description' => [
            'en' => 'Dorak — The premium salon and barbershop management platform.',
            'ar' => 'دورك — منصة إدارة صالونات ومحلات الحلاقة المتميزة.',
        ],
        'published_at' => '2026-01-01 00:00:00',
    ],
    [
        'slug' => 'features',
        'title' => ['en' => 'Features', 'ar' => 'المميزات'],
        'meta_description' => [
            'en' => 'Explore Dorak features: Branch-First, Standalone Barbers, Backend-Driven UI.',
            'ar' => 'استكشف مميزات دورك: إدارة الفروع، الحلاقين المستقلين، واجهة مدعومة من الخلفية.',
        ],
        'published_at' => '2026-01-01 00:00:00',
    ],
    [
        'slug' => 'pricing',
        'title' => ['en' => 'Pricing', 'ar' => 'الأسعار'],
        'meta_description' => [
            'en' => 'Dorak pricing — Start free with one branch. Upgrade for multi-branch and job board.',
            'ar' => 'أسعار دورك — ابدأ مجاناً بفرع واحد. قم بالترقية لفروع متعددة ولوحة الوظائف.',
        ],
        'published_at' => '2026-01-01 00:00:00',
    ],
    [
        'slug' => MarketingPageConstants::MARKETING_PAGE_PRIVACY_SLUG,
        'title' => ['en' => 'Privacy Policy', 'ar' => 'سياسة الخصوصية'],
        'meta_description' => [
            'en' => 'How Dorak collects, uses and protects your personal data.',
            'ar' => 'كيف تجمع دورك بياناتك الشخصية وتستخدمها وتحميها.',
        ],
        'published_at' => null,
    ],
    [
        'slug' => MarketingPageConstants::MARKETING_PAGE_TERMS_SLUG,
        'title' => ['en' => 'Terms of Service', 'ar' => 'شروط الخدمة'],
        'meta_description' => [
            'en' => 'The terms that apply when you use Dorak.',
            'ar' => 'الشروط التي تنطبق عند استخدامك دورك.',
        ],
        'published_at' => null,
    ],
    [
        'slug' => MarketingPageConstants::MARKETING_PAGE_ABOUT_SLUG,
        'title' => ['en' => 'About Dorak', 'ar' => 'عن دورك'],
        'meta_description' => [
            'en' => 'Dorak is a platform for salons, barbershops and barbers.',
            'ar' => 'دورك منصة لصالونات التجميل ومحلات الحلاقة والحلاقين.',
        ],
        'published_at' => null,
    ],
    [
        'slug' => MarketingPageConstants::MARKETING_PAGE_CONTACT_SLUG,
        'title' => ['en' => 'Contact and Support', 'ar' => 'التواصل والدعم'],
        'meta_description' => [
            'en' => 'How to reach Dorak support.',
            'ar' => 'كيف تتواصل مع دعم دورك.',
        ],
        'published_at' => null,
    ],
    [
        'slug' => MarketingPageConstants::MARKETING_PAGE_DELETE_ACCOUNT_SLUG,
        'title' => ['en' => 'Delete your account', 'ar' => 'حذف حسابك'],
        'meta_description' => [
            'en' => 'How to delete your Dorak account and what happens to your data.',
            'ar' => 'كيف تحذف حسابك في دورك وماذا يحدث لبياناتك.',
        ],
        'published_at' => null,
    ],
];
