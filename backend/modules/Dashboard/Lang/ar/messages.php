<?php

declare(strict_types=1);

return [
    'chair_stylist_unavailable' => 'الكرسي أو الحلاق المحدد لم يعد متاحًا لهذا الوقت.',
    'invalid_booking_status' => 'حالة الحجز غير صالحة.',
    'assign_branch_chair' => 'يجب على مدير الفرع تعيين كرسي للفرع.',
    'booking_slot_conflict' => 'يتعارض وقت الحجز مع حجز موجود.',
    'current_password_incorrect' => 'كلمة المرور الحالية غير صحيحة.',
    'email_already_in_use' => 'عنوان البريد الإلكتروني مستخدم بالفعل.',
    'invalid_confirmation_code' => 'رمز التأكيد غير صالح أو منتهي الصلاحية.',
    'barber_other_branch' => 'الحلاق يتبع فرعًا آخر.',
    'chair_has_active_bookings' => 'للكرسي حجوزات نشطة، لذلك لا يمكن تغييره أو حذفه.',
    'stylist_not_assigned_to_chair' => 'يجب تعيين الحلاق إلى الكرسي المحدد.',
    'services_unavailable_for_branch' => 'يجب أن تكون جميع الخدمات متاحة للفرع المحدد.',
    'admin_operation_only' => 'عملية لوحة التحكم هذه متاحة لمسؤولي المنصة فقط.',
    'barber_operation_unavailable' => 'عملية لوحة التحكم هذه غير متاحة للحلاقين.',
    'refresh_ttl_invalid' => 'يجب ألا تقل قيمة DASHBOARD_REFRESH_TTL_SECONDS عن 3600 ثانية.',
    'session_secret_invalid' => 'يجب ألا يقل طول DASHBOARD_SESSION_SECRET عن 32 حرفًا.',
    'claim_ttl_invalid' => 'يجب ألا تقل قيمة DASHBOARD_CLAIM_TTL_SECONDS عن 60 ثانية.',
    'claim_encoding_failed' => 'تعذر ترميز بيانات جلسة لوحة التحكم.',
    'actor_type_unsupported' => 'نوع مستخدم لوحة التحكم غير مدعوم: :actor_type',
    'guard_unsupported' => 'حارس لوحة التحكم غير مدعوم.',
    'booking_time_overlap' => 'يتداخل الوقت المحدد مع حجز نشط.',
    'chair_has_active_or_future_bookings' => 'للكرسي حجوزات نشطة أو مستقبلية.',
    'branch_last_active' => 'يجب أن يحتفظ النشاط بفرع نشط واحد على الأقل.',
    'branch_has_upcoming_bookings' => 'لا يمكن حذف فرع لديه حجوزات قادمة.',
];
