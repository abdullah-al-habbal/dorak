<?php

declare(strict_types=1);

use Modules\Marketing\Constants\MarketingPageConstants;
use Modules\Marketing\Enums\SectionTypeEnum;
use Modules\Marketing\Enums\UniverseVisibilityEnum;

// Placeholder legal and informational text for the pages seeded as drafts in seed_pages.php. The owner replaces it
// with approved wording from the dashboard before publishing.
return [
    [
        'page_slug' => MarketingPageConstants::MARKETING_PAGE_PRIVACY_SLUG, 'section_type' => SectionTypeEnum::LegalText->value,
        'title' => null, 'subtitle' => null,
        'body' => [
            'en' => [
                'heading' => 'Privacy Policy',
                'paragraphs' => [
                    'Dorak helps salons, barbershops and barbers manage bookings, and helps clients find and book them. This policy explains what personal data we handle and why.',
                    'We collect the details you give us (name, email, phone number, photos you upload), your bookings and reviews, your device push token, and, only when you allow it, your approximate or precise location to show nearby branches.',
                    'Face photos you upload for style recommendations are used only to produce those recommendations, are kept for a limited period, and are deleted when you delete them or your account.',
                    'We do not sell your personal data. We share it only with the branches and barbers involved in your bookings and with service providers that run Dorak for us (hosting, messaging and notifications).',
                    'You can ask to see, correct or delete your data at any time. See the Delete your account page, or contact support.',
                ],
            ],
            'ar' => [
                'heading' => 'سياسة الخصوصية',
                'paragraphs' => [
                    'تساعد دورك الصالونات ومحلات الحلاقة والحلاقين على إدارة الحجوزات، وتساعد العملاء على إيجاد الخدمة وحجزها. توضح هذه السياسة البيانات الشخصية التي نتعامل معها ولماذا.',
                    'نجمع البيانات التي تقدمها لنا (الاسم والبريد الإلكتروني ورقم الهاتف والصور التي ترفعها)، وحجوزاتك وتقييماتك، ورمز الإشعارات لجهازك، وموقعك التقريبي أو الدقيق فقط عند السماح بذلك لعرض الفروع القريبة.',
                    'تُستخدم صور الوجه التي ترفعها لاقتراحات التسريحات فقط، وتُحفظ لمدة محدودة، وتُحذف عند حذفها أو عند حذف حسابك.',
                    'لا نبيع بياناتك الشخصية. نشاركها فقط مع الفروع والحلاقين المعنيين بحجوزاتك ومع مزودي الخدمات الذين يشغّلون دورك لنا (الاستضافة والرسائل والإشعارات).',
                    'يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها في أي وقت. راجع صفحة حذف الحساب أو تواصل مع الدعم.',
                ],
            ],
        ],
        'media_url' => null, 'sort_order' => 0, 'universe_visibility' => UniverseVisibilityEnum::All->value,
    ],
    [
        'page_slug' => MarketingPageConstants::MARKETING_PAGE_TERMS_SLUG, 'section_type' => SectionTypeEnum::LegalText->value,
        'title' => null, 'subtitle' => null,
        'body' => [
            'en' => [
                'heading' => 'Terms of Service',
                'paragraphs' => [
                    'By creating an account or using Dorak you agree to these terms.',
                    'Clients book services offered by branches and barbers. Dorak provides the booking platform; the service itself is provided by the branch or barber, who is responsible for it.',
                    'You must give accurate information, keep your password private, and not misuse the platform, including fake bookings, abusive reviews or attempts to access other accounts.',
                    'Branches and barbers must keep their profile, prices and working hours accurate and honour confirmed bookings.',
                    'We may suspend or close accounts that break these terms. You can stop using Dorak and delete your account at any time.',
                ],
            ],
            'ar' => [
                'heading' => 'شروط الخدمة',
                'paragraphs' => [
                    'بإنشاء حساب أو استخدام دورك فإنك توافق على هذه الشروط.',
                    'يحجز العملاء خدمات تقدمها الفروع والحلاقون. توفر دورك منصة الحجز، أما الخدمة نفسها فيقدمها الفرع أو الحلاق وهو المسؤول عنها.',
                    'يجب تقديم معلومات صحيحة والحفاظ على سرية كلمة المرور وعدم إساءة استخدام المنصة، بما في ذلك الحجوزات الوهمية والتقييمات المسيئة ومحاولات الوصول إلى حسابات الآخرين.',
                    'على الفروع والحلاقين إبقاء ملفاتهم وأسعارهم وساعات عملهم دقيقة والالتزام بالحجوزات المؤكدة.',
                    'يجوز لنا تعليق أو إغلاق الحسابات المخالفة لهذه الشروط. يمكنك التوقف عن استخدام دورك وحذف حسابك في أي وقت.',
                ],
            ],
        ],
        'media_url' => null, 'sort_order' => 0, 'universe_visibility' => UniverseVisibilityEnum::All->value,
    ],
    [
        'page_slug' => MarketingPageConstants::MARKETING_PAGE_ABOUT_SLUG, 'section_type' => SectionTypeEnum::LegalText->value,
        'title' => null, 'subtitle' => null,
        'body' => [
            'en' => [
                'heading' => 'About Dorak',
                'paragraphs' => [
                    'Dorak is an operations platform for salons, barbershops and independent barbers, and a booking app for their clients.',
                    'Brand owners manage their brands and branches, branches run bookings and chairs, barbers manage their schedule and portfolio, and clients discover, book and review.',
                    'We are building Dorak to make everyday salon work simpler and fairer for everyone involved.',
                ],
            ],
            'ar' => [
                'heading' => 'عن دورك',
                'paragraphs' => [
                    'دورك منصة تشغيل لصالونات التجميل ومحلات الحلاقة والحلاقين المستقلين، وتطبيق حجز لعملائهم.',
                    'يدير أصحاب العلامات التجارية علاماتهم وفروعهم، وتدير الفروع الحجوزات والكراسي، ويدير الحلاقون جداولهم وأعمالهم، ويكتشف العملاء ويحجزون ويقيّمون.',
                    'نبني دورك لتبسيط عمل الصالونات اليومي وجعله أكثر عدلاً لجميع الأطراف.',
                ],
            ],
        ],
        'media_url' => null, 'sort_order' => 0, 'universe_visibility' => UniverseVisibilityEnum::All->value,
    ],
    [
        'page_slug' => MarketingPageConstants::MARKETING_PAGE_CONTACT_SLUG, 'section_type' => SectionTypeEnum::LegalText->value,
        'title' => null, 'subtitle' => null,
        'body' => [
            'en' => [
                'heading' => 'Contact and Support',
                'paragraphs' => [
                    'Need help with a booking, your account or the app? Contact our support team and include the email or phone number on your account.',
                    'You can also send a suggestion or report a problem from the Send feedback screen inside the Dorak apps. It tells us which app and screen you were on, which helps us fix things faster.',
                ],
            ],
            'ar' => [
                'heading' => 'التواصل والدعم',
                'paragraphs' => [
                    'هل تحتاج مساعدة بخصوص حجز أو حسابك أو التطبيق؟ تواصل مع فريق الدعم وأرفق البريد الإلكتروني أو رقم الهاتف المسجل في حسابك.',
                    'يمكنك أيضاً إرسال اقتراح أو الإبلاغ عن مشكلة من شاشة إرسال الملاحظات داخل تطبيقات دورك. تخبرنا أي تطبيق وأي شاشة كنت فيها، مما يساعدنا على الإصلاح بسرعة.',
                ],
            ],
        ],
        'media_url' => null, 'sort_order' => 0, 'universe_visibility' => UniverseVisibilityEnum::All->value,
    ],
    [
        'page_slug' => MarketingPageConstants::MARKETING_PAGE_DELETE_ACCOUNT_SLUG, 'section_type' => SectionTypeEnum::LegalText->value,
        'title' => null, 'subtitle' => null,
        'body' => [
            'en' => [
                'heading' => 'Delete your account',
                'paragraphs' => [
                    'Clients and stylists can delete their account inside the app: open Profile, then Delete account, and confirm. The account cannot be deleted while it has pending, confirmed or in-progress bookings; finish or cancel them first.',
                    'When an account is deleted we remove your name, email, phone number and profile photo, sign you out everywhere, and delete your uploaded photos. Bookings and reviews that other people rely on are kept without your personal details.',
                    'Brand owners and branch accounts: contact support from the registered email and we will process the request after any open bookings and payouts are settled.',
                    'If you cannot use the app, contact support from the email or phone number on the account and we will delete it for you.',
                ],
            ],
            'ar' => [
                'heading' => 'حذف حسابك',
                'paragraphs' => [
                    'يمكن للعملاء والحلاقين حذف حساباتهم من داخل التطبيق: افتح الملف الشخصي ثم حذف الحساب وأكّد. لا يمكن حذف الحساب أثناء وجود حجوزات معلقة أو مؤكدة أو قيد التنفيذ؛ أنهِها أو ألغِها أولاً.',
                    'عند حذف الحساب نزيل اسمك وبريدك الإلكتروني ورقم هاتفك وصورتك الشخصية، ونسجّل خروجك من كل الأجهزة، ونحذف الصور التي رفعتها. تُحفظ الحجوزات والتقييمات التي يعتمد عليها الآخرون بدون بياناتك الشخصية.',
                    'أصحاب العلامات التجارية وحسابات الفروع: تواصلوا مع الدعم من البريد المسجل وسننفذ الطلب بعد تسوية الحجوزات والمدفوعات المفتوحة.',
                    'إذا لم تتمكن من استخدام التطبيق، تواصل مع الدعم من البريد أو الهاتف المسجل في الحساب وسنحذفه لك.',
                ],
            ],
        ],
        'media_url' => null, 'sort_order' => 0, 'universe_visibility' => UniverseVisibilityEnum::All->value,
    ],
];
