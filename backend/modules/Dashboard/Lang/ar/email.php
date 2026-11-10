<?php

declare(strict_types=1);

return [
    'email_change_subject' => 'تأكيد عنوان بريدك الإلكتروني في دوراك',
    'email_change_body' => '<p>رمز تأكيد تغيير بريدك الإلكتروني: <strong>:code</strong></p><p>تنتهي صلاحية هذا الرمز خلال 10 دقائق.</p>',
    'password_reset_subject' => 'إعادة تعيين كلمة مرور دوراك',
    'password_reset_body' => '<p>تلقّينا طلبًا لإعادة تعيين كلمة مرور لوحة تحكم دوراك.</p><p><a href=":url">تعيين كلمة مرور جديدة</a></p><p>تنتهي صلاحية هذا الرابط خلال :minutes دقيقة ويعمل مرة واحدة. إذا لم تطلبه فتجاهل هذه الرسالة، وستبقى كلمة مرورك كما هي.</p>',
    'owner_brand_submitted_subject' => 'استلمنا طلب تسجيل نشاطك في دورك',
    'owner_brand_submitted_body' => '<p>شكرًا لتسجيل <strong>:name</strong> في دورك. تم تأكيد بريدك الإلكتروني ونشاطك الآن بانتظار المراجعة.</p><p>يمكنك خلال الانتظار إكمال ملف علامتك التجارية وتجهيز فرعك الأول. <a href=":url">افتح لوحة التحكم</a>.</p>',
    'owner_brand_approved_subject' => 'تمت الموافقة على نشاطك في دورك',
    'owner_brand_approved_body' => '<p>خبر سار: تمت الموافقة على <strong>:name</strong>. يمكنك الآن إضافة المصففين وفتح فرعك للعملاء.</p><p><a href=":url">افتح لوحة التحكم</a></p>',
    'owner_brand_rejected_subject' => 'نشاطك في دورك يحتاج إلى تعديلات',
    'owner_brand_rejected_body' => '<p>لم نتمكن من الموافقة على <strong>:name</strong> بعد.</p><p>السبب: :reason</p><p>يرجى تصحيح ذلك وإعادة الإرسال. <a href=":url">افتح لوحة التحكم</a></p>',
    'owner_brand_suspended_subject' => 'تم تعليق نشاطك في دوراك',
    'owner_brand_suspended_body' => '<p>تم تعليق <strong>:name</strong> وإخفاؤه عن العملاء. تبقى الحجوزات القائمة ما لم نخبرك بغير ذلك.</p><p>السبب: :reason</p><p><a href=":url">افتح لوحة التحكم</a></p>',
    'owner_brand_reactivated_subject' => 'عاد نشاطك في دوراك',
    'owner_brand_reactivated_body' => '<p>عاد <strong>:name</strong> نشطًا وظاهرًا للعملاء.</p><p><a href=":url">افتح لوحة التحكم</a></p>',
];
