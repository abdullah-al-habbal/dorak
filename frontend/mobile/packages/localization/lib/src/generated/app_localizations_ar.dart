// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get splashTitle => 'Dorak';

  @override
  String get skip => 'تخطي';

  @override
  String get onboardingWelcomeTitle => 'تجربة العناية بك، من جديد.';

  @override
  String get onboardingWelcomeSubtitle =>
      'اكتشف نخبة المحترفين، واحجز بسهولة، وخصص رحلتك الأنيقة.';

  @override
  String get onboardingGetStarted => 'ابدأ الآن';

  @override
  String get skipOnboardingQuestion => 'تخطي مرحلة التعريف؟';

  @override
  String get skipForNow => 'تخطَّ الآن';

  @override
  String get dontShowAgain => 'لا تظهر مجددًا';

  @override
  String get cancel => 'إلغاء';

  @override
  String get discoveryTitle => 'اعثر على الأنسب لك.';

  @override
  String get discoverySubtitle =>
      'استكشف المتاجر القريبة وأفضل الحلاقين والخدمات المتميزة المصممة لاحتياجاتك.';

  @override
  String get next => 'التالي';

  @override
  String get discoveryCardShops => 'المتاجر';

  @override
  String get discoveryCardBarbers => 'الحلاقون';

  @override
  String get discoveryCardServices => 'الخدمات';

  @override
  String get previous => 'رجوع';

  @override
  String get localeArabic => 'العربية';

  @override
  String get localeEnglish => 'English';

  @override
  String get homeTitle => 'الرئيسية';

  @override
  String get bookingTitle => 'احجز متى يناسبك.';

  @override
  String get bookingSubtitle =>
      'اختر خدمتك ومحترفك والوقت المناسب — ثم احجز في بضع لمسات.';

  @override
  String get bookingServiceLabel => 'بريميوم فايد';

  @override
  String get bookingServiceMeta => '45 دقيقة • \$65';

  @override
  String get bookingProfessionalLabel => 'ماركوس تي.';

  @override
  String get bookingProfessionalRating => '4.9';

  @override
  String get bookingDateLabel => 'غدًا';

  @override
  String get bookingTimeLabel => '2:30 مساءً';

  @override
  String get aiTitle => 'اكتشف تسريحات صُممت من أجلك.';

  @override
  String get aiSubtitle =>
      'احصل على توصيات شخصية مبنية على تفضيلاتك، وإذا أردت، على ملامح وجهك.';

  @override
  String get aiMatchLabel => 'تطابق 98٪';

  @override
  String get aiRecommendedLabel => 'موصى به';

  @override
  String get aiStyleFade => 'بريميوم فايد';

  @override
  String get aiStyleCrop => 'قصّة تكستشر كروب';

  @override
  String get aiFaceShapeLabel => 'شكل الوجه: بيضاوي';

  @override
  String get aiPrivacyNote => 'تحليل الوجه اختياري بالكامل.';

  @override
  String get authWelcomeTitle => 'مرحباً بك في دوراك';

  @override
  String get authSubtitle =>
      'سجّل الدخول للوصول إلى تجربتك المخصصة، أو تابع كزائر للاستكشاف.';

  @override
  String get authLogIn => 'تسجيل الدخول';

  @override
  String get authCreateAccount => 'إنشاء حساب';

  @override
  String get authContinueAsGuest => 'المتابعة كزائر';

  @override
  String get authGuestHint => 'استكشف دوراك دون إنشاء حساب.';

  @override
  String get back => 'رجوع';

  @override
  String get loginTitle => 'مرحباً بعودتك';

  @override
  String get loginSubtitle => 'سجّل الدخول إلى حسابك';

  @override
  String get loginEmailLabel => 'البريد الإلكتروني';

  @override
  String get loginPasswordLabel => 'كلمة المرور';

  @override
  String get loginForgotPassword => 'نسيت كلمة المرور؟';

  @override
  String get loginButton => 'تسجيل الدخول';

  @override
  String get loginSignUpPrompt => 'ليس لديك حساب؟';

  @override
  String get loginCreateAccountLink => 'إنشاء حساب';

  @override
  String get loginErrorInvalidCredentials =>
      'البريد الإلكتروني أو كلمة المرور غير صحيحة';

  @override
  String get authAccountSuspended =>
      'هذا الحساب موقوف. تواصل مع الدعم للمساعدة.';

  @override
  String get authAccountNotActive =>
      'هذا الحساب غير مفعل. أكمل التحقق أو تواصل مع الدعم.';

  @override
  String get signUpTitle => 'أنشئ حسابك';

  @override
  String get signUpSubtitle =>
      'انضم إلى دوراك للحصول على عناية شخصية وحجز سهل.';

  @override
  String get signUpFullNameLabel => 'الاسم الكامل';

  @override
  String get signUpEmailLabel => 'البريد الإلكتروني';

  @override
  String get signUpPasswordLabel => 'كلمة المرور';

  @override
  String get signUpConfirmPasswordLabel => 'تأكيد كلمة المرور';

  @override
  String get signUpPasswordHint => 'على الأقل 8 أحرف';

  @override
  String get signUpButton => 'إنشاء حساب';

  @override
  String get signUpAlreadyHaveAccount => 'لديك حساب بالفعل؟';

  @override
  String get signUpLogInLink => 'تسجيل الدخول';

  @override
  String get verifyTitle => 'تحقق من حسابك';

  @override
  String verifySubtitle(String email) {
    return 'أدخل الرمز المكوّن من 6 أرقام الذي أرسلناه إلى $email';
  }

  @override
  String get verifyButton => 'تحقق واستمر';

  @override
  String get verifyDidNotReceive => 'لم تستلم الرمز؟';

  @override
  String get verifyResend => 'إعادة إرسال الرمز';

  @override
  String verifyResendDisabled(int seconds) {
    return 'إعادة إرسال الرمز ($secondsث)';
  }

  @override
  String get verifyErrorInvalid => 'رمز غير صحيح. يرجى المحاولة مرة أخرى.';

  @override
  String get verifySkip => 'التحقق لاحقاً';

  @override
  String get fieldRequired => 'هذا الحقل مطلوب';

  @override
  String get fieldInvalid => 'يرجى التحقق من هذا الحقل';

  @override
  String get fieldInvalidEmail => 'يرجى إدخال بريد إلكتروني صحيح';

  @override
  String get fieldPasswordTooShort =>
      'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل';

  @override
  String get fieldPasswordMismatch => 'كلمات المرور غير متطابقة';

  @override
  String get errorNetwork => 'لا يوجد اتصال. تحقق من شبكتك وحاول مرة أخرى.';

  @override
  String get errorGeneric => 'حدث خطأ ما. يرجى المحاولة مرة أخرى.';

  @override
  String get actionRetry => 'حاول مرة أخرى';

  @override
  String get errorTitleGeneric => 'حدث خطأ ما';

  @override
  String get errorTitleOffline => 'أنت غير متصل بالإنترنت';

  @override
  String get emptyTitleGeneric => 'لا يوجد شيء هنا بعد';

  @override
  String get emptyMessageGeneric => 'لا يوجد شيء لعرضه حالياً.';

  @override
  String get recoveryEmailTitle => 'نسيت كلمة المرور؟';

  @override
  String get recoveryEmailSubtitle =>
      'أدخل البريد الإلكتروني المرتبط بحسابك وسنرسل لك رمز إعادة تعيين من 6 أرقام.';

  @override
  String get recoveryEmailLabel => 'البريد الإلكتروني';

  @override
  String get recoverySendCodeButton => 'إرسال الرمز';

  @override
  String get recoveryReturnToLogIn => 'العودة إلى تسجيل الدخول';

  @override
  String get recoveryOtpTitle => 'أدخل رمز إعادة التعيين';

  @override
  String recoveryOtpSubtitle(String email) {
    return 'إذا كان $email مسجلاً، فقد أرسلنا إليه رمزاً من 6 أرقام. تنتهي صلاحيته بعد 10 دقائق.';
  }

  @override
  String get recoveryOtpContinueButton => 'متابعة';

  @override
  String get recoveryOtpIncomplete => 'أدخل الأرقام الستة كاملة';

  @override
  String get recoveryResend => 'إعادة إرسال الرمز';

  @override
  String recoveryResendDisabled(int seconds) {
    return 'إعادة إرسال الرمز ($seconds ث)';
  }

  @override
  String get recoveryDidNotReceive => 'لم تستلم الرمز؟';

  @override
  String get recoveryNewPasswordTitle => 'إنشاء كلمة مرور جديدة';

  @override
  String get recoveryNewPasswordSubtitle => 'اختر كلمة مرور جديدة لحسابك.';

  @override
  String get recoveryNewPasswordLabel => 'كلمة المرور الجديدة';

  @override
  String get recoveryConfirmPasswordLabel => 'تأكيد كلمة المرور الجديدة';

  @override
  String get recoveryResetButton => 'إعادة تعيين كلمة المرور';

  @override
  String get recoveryCodeRejected => 'هذا الرمز غير صالح أو انتهت صلاحيته.';

  @override
  String get recoveryReenterCode => 'إعادة إدخال الرمز';

  @override
  String get passwordResetSuccessTitle => 'تم تحديث كلمة المرور';

  @override
  String get passwordResetSuccessMessage =>
      'تم تغيير كلمة المرور. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.';

  @override
  String get onboardingConfigUnavailable => 'لم نتمكن من تحميل أحدث صورة.';

  @override
  String get bookingsTitle => 'لا توجد حجوزات بعد';

  @override
  String get bookingsSubtitle => 'ستظهر حجوزاتك القادمة والسابقة هنا.';

  @override
  String get bookingsActionLabel => 'اكتشف';

  @override
  String get favoritesTitle => 'لا توجد مفضلات بعد';

  @override
  String get favoritesSubtitle => 'اضغط على القلب في صالون أو حلاق لحفظه هنا.';

  @override
  String get favoritesActionLabel => 'اكتشف';

  @override
  String get profileTitle => 'الملف الشخصي';

  @override
  String get profileSubtitle => 'سيظهر حسابك وتفضيلاتك هنا.';

  @override
  String get profileActionLabel => 'اكتشف';

  @override
  String get locationRequiredTitle => 'مطلوب الموقع';

  @override
  String get locationRequiredMessage =>
      'أذِن بالوصول للموقع لاكتشاف الفروع القريبة.';

  @override
  String get enableLocationAction => 'تفعيل الموقع';

  @override
  String get availableNow => 'متاح الآن';

  @override
  String get price => 'السعر';

  @override
  String get rating => 'التقييم';

  @override
  String get distance => 'المسافة';

  @override
  String get viewDetails => 'عرض التفاصيل';

  @override
  String get bookNow => 'احجز الآن';

  @override
  String get discoverUniverseMen => 'رجال';

  @override
  String get discoverUniverseWomen => 'نساء';

  @override
  String get discoverRankedByDistance => 'مرتبة حسب المسافة';

  @override
  String discoverDistanceLabel(double km) {
    return '$km كم';
  }

  @override
  String get discoverStaleLabel => 'عرض النتائج المحفوظة';

  @override
  String discoverRankBadge(int rank) {
    return '#$rank';
  }

  @override
  String get discoverTabLabel => 'اكتشف';

  @override
  String get changePasswordTitle => 'تغيير كلمة المرور';

  @override
  String get changePasswordSubtitle =>
      'أدخل كلمة المرور الحالية، ثم اختر كلمة جديدة.';

  @override
  String get changePasswordCurrentLabel => 'كلمة المرور الحالية';

  @override
  String get changePasswordNewLabel => 'كلمة المرور الجديدة';

  @override
  String get changePasswordConfirmLabel => 'تأكيد كلمة المرور الجديدة';

  @override
  String get changePasswordSubmit => 'تحديث كلمة المرور';

  @override
  String get changePasswordSuccessTitle => 'تم تحديث كلمة المرور';

  @override
  String get changePasswordSuccessMessage => 'تم تغيير كلمة المرور الخاصة بك.';

  @override
  String get changePasswordDone => 'تم';

  @override
  String get bookingsTabLabel => 'حجوزات';

  @override
  String get bookingFilterUpcoming => 'القادمة';

  @override
  String get bookingFilterPast => 'السابقة';

  @override
  String get bookingStatusConfirmed => 'مؤكد';

  @override
  String get bookingStatusCanceled => 'ملغي';

  @override
  String get bookingStatusCompleted => 'مكتمل';

  @override
  String bookingWithBarber(String name) {
    return 'مع $name';
  }

  @override
  String bookingChairLabel(String label) {
    return 'كرسي $label';
  }

  @override
  String get bookingCancelAction => 'إلغاء الحجز';

  @override
  String get bookingCancelConfirmTitle => 'إلغاء هذا الحجز؟';

  @override
  String get bookingCancelConfirmMessage =>
      'سيتم تحرير موعدك. يمكنك الحجز مرة أخرى في أي وقت.';

  @override
  String get bookingCancelConfirm => 'نعم، إلغاء';

  @override
  String branchChairsCount(int count) {
    return '$count كراسي';
  }

  @override
  String get branchAvailableLabel => 'متاح';

  @override
  String get branchOccupiedLabel => 'مشغول';

  @override
  String get branchMaintenanceLabel => 'صيانة';

  @override
  String get branchBarbersTitle => 'الحلاقون';

  @override
  String get branchServicesTitle => 'الخدمات';

  @override
  String get bookingSelectChair => 'اختر الكرسي';

  @override
  String get bookingSelectServices => 'اختر الخدمات';

  @override
  String get bookingSelectTime => 'اختر الوقت';

  @override
  String get bookingConfirmAction => 'تأكيد الحجز';

  @override
  String get bookingSuccessTitle => 'تم تأكيد الحجز';

  @override
  String get bookingSuccessMessage => 'تم حجز موعدك.';

  @override
  String get bookingViewBookings => 'عرض حجوزاتي';

  @override
  String get bookingConflictMessage =>
      'تم حجز هذا الموعد للتو. اختر وقتًا آخر.';

  @override
  String discoverCompatibilityBadge(int percent) {
    return '$percent%';
  }

  @override
  String get historyTitle => 'سجل الخدمات';

  @override
  String get historyEmptyTitle => 'لا يوجد سجل بعد';

  @override
  String get historyEmptyMessage => 'ستظهر الخدمات التي حجزتها هنا بعد موعدها.';

  @override
  String get historyRebookAction => 'إعادة الحجز';

  @override
  String get historyRebookTitle => 'إعادة الحجز';

  @override
  String historyRebookMessage(String item) {
    return 'اختر موعدًا جديدًا لـ$item.';
  }

  @override
  String get historyRebookSuccessTitle => 'تم إعادة الحجز';

  @override
  String get historyRebookSuccessMessage =>
      'تم حجز موعدك الجديد. ستجده في الحجوزات.';

  @override
  String get profileMemberLabel => 'عضو';

  @override
  String get avatarUpdateAction => 'تغيير الصورة';

  @override
  String get faceAnalysisTitle => 'تحليل الوجه';

  @override
  String get faceAnalysisDetectedShape => 'شكل الوجه المكتشف';

  @override
  String get faceAnalysisConfidence => 'درجة الثقة';

  @override
  String get faceScanAction => 'امسح وجهي';

  @override
  String get faceAnalysisPendingTitle => 'التحليل قيد التنفيذ';

  @override
  String get faceAnalysisPendingMessage =>
      'نحن نحلل وجهك. تحقق مجددًا بعد قليل.';

  @override
  String get faceAnalysisEmptyTitle => 'لا يوجد تحليل بعد';

  @override
  String get faceAnalysisEmptyMessage =>
      'ارفع صورة لاكتشاف التسريحات التي تناسبك.';

  @override
  String get actionCheckAgain => 'تحقق مجددًا';

  @override
  String get faceShapeOval => 'بيضاوي';

  @override
  String get faceShapeRound => 'دائري';

  @override
  String get faceShapeSquare => 'مربع';

  @override
  String get faceShapeHeart => 'قلب';

  @override
  String get faceShapeDiamond => 'ماسي';

  @override
  String get faceShapeOblong => 'مستطيل';

  @override
  String get faceShapeTriangle => 'مثلث';

  @override
  String get curatedForYouTitle => 'مختار لك';

  @override
  String get curatedEmptyMessage => 'لا توجد تسريحات مناسبة بعد.';

  @override
  String curatedPriceRange(num min, num max, String currency) {
    return '$min–$max $currency';
  }

  @override
  String get stylistServicesTitle => 'الخدمات';

  @override
  String get stylistNoServicesMessage => 'لا توجد خدمات بعد.';

  @override
  String get serviceAtHomeLabel => 'متاح بالمنزل';

  @override
  String serviceDurationLabel(int minutes) {
    return '$minutes دقيقة';
  }

  @override
  String servicePrice(String displayPrice, String currency) {
    return '$displayPrice $currency';
  }

  @override
  String get stylistStatServicesLabel => 'الخدمات';

  @override
  String get stylistStatRankLabel => 'الترتيب';

  @override
  String get stylistStatCompatibilityLabel => 'التوافق';

  @override
  String get reviewTitle => 'تقييم تجربتك';

  @override
  String get reviewStylistPrompt => 'كيف كانت جلستك؟';

  @override
  String get reviewCommentHint => 'شاركونا التفاصيل الإضافية (اختياري)';

  @override
  String get reviewSubmitButton => 'رسل التقييم';

  @override
  String get reviewSubmitSuccess => 'تم إرسال التقييم';

  @override
  String get reviewAlreadyReviewed => 'قد قمت بالفعل بتقييم هذا الحجز';

  @override
  String get reviewBookingNotCompleted => 'لم يكتمل هذا الحجز بعد';

  @override
  String get reviewErrorGeneric => 'لم نتمكنا من إرسال تقييمك';

  @override
  String reviewStarLabel(int stars) {
    return '$stars من 5 نجوم';
  }

  @override
  String get reviewCommentsSection => 'التقييمات';

  @override
  String get bookingRateAction => 'قيّم';

  @override
  String get profileCompletionTitle => 'أكمل ملفك الشخصي';

  @override
  String get profileCompletionSubtitle => 'أضف بياناتك لتخصيص تجربتك في دوراك.';

  @override
  String get profileCompletionNameLabel => 'الاسم';

  @override
  String get profileCompletionPhoneLabel => 'رقم الهاتف';

  @override
  String get profileCompletionContinue => 'حفظ ومتابعة';

  @override
  String get profileCompletionError => 'تعذر حفظ ملفك الشخصي';

  @override
  String get bookingAtHomeToggle => 'الحجز في المنزل';

  @override
  String get bookingAtHomeStreetLabel => 'الشارع';

  @override
  String get bookingAtHomeBuildingLabel => 'البناء';

  @override
  String get bookingAtHomeUnitLabel => 'الوحدة / الشقة';

  @override
  String get bookingAtHomePinAction => 'استخدم موقعي الحالي كدبوس GPS';

  @override
  String bookingAtHomePinSelected(String latitude, String longitude) {
    return 'تم تحديد دبوس GPS: $latitude، $longitude';
  }

  @override
  String get bookingAtHomeLocationError =>
      'تعذر الحصول على موقع GPS. تحقق من إذن الموقع ثم حاول مجدداً.';

  @override
  String bookingEndTimeLabel(String time) {
    return 'ينتهي في $time';
  }

  @override
  String get bookingCancellationClosed =>
      'لا يمكن الإلغاء خلال ساعتين قبل الموعد.';

  @override
  String get reviewStatusPublished => 'منشور';

  @override
  String get reviewStatusUnderReview => 'قيد المراجعة';

  @override
  String get reviewStatusHidden => 'مخفي';

  @override
  String get reviewStatusResolved => 'تم الحل';

  @override
  String get reviewDisputeHoldNote =>
      'هذا التقييم معلّق لمدة تصل إلى 48 ساعة بينما يحل المسؤول النزاع.';

  @override
  String get floorZoneMen => 'قسم الرجال';

  @override
  String get floorZoneWomen => 'قسم النساء';

  @override
  String get floorZoneShared => 'القسم المشترك';

  @override
  String get managerManualBarberTitle => 'إضافة حلاق';

  @override
  String get managerManualBarberSubtitle =>
      'أنشئ ملف حلاق دون إنشاء حساب لتسجيل الدخول.';

  @override
  String get managerBarberNameEnglish => 'الاسم بالإنجليزية';

  @override
  String get managerBarberNameArabic => 'الاسم بالعربية';

  @override
  String get managerBarberPhone => 'رقم الهاتف';

  @override
  String get managerBarberPhoneHint => 'أضف رمز البلد، مثلاً +963...';

  @override
  String get managerBarberPhoneSharedNote =>
      'يمكن لعميل استخدام الرقم نفسه. سيُنشأ ملف حلاق منفصل.';

  @override
  String get managerBarberCreate => 'إنشاء حلاق';

  @override
  String get managerBarberPhoneInvalid => 'أدخل رقم هاتف صالحاً مع رمز البلد.';

  @override
  String get managerBarberCreated => 'تم إنشاء الحلاق دون حساب لتسجيل الدخول.';

  @override
  String get managerBarberCreateError => 'تعذر إنشاء الحلاق. حاول مجدداً.';

  @override
  String get bookingSavedAddressesLabel => 'العناوين المحفوظة';

  @override
  String get bookingFirstAvailable => 'أول متاح';

  @override
  String get bookingPreferredBarber => 'الحلاق المفضل';

  @override
  String get bookingSummaryTitle => 'ملخص الحجز';

  @override
  String bookingTotalPrice(Object price) {
    return 'السعر الإجمالي: $price';
  }

  @override
  String bookingTotalDuration(int minutes) {
    return 'المدة المتوقعة: $minutes دقيقة';
  }

  @override
  String get bookingPaymentTitle => 'الدفع';

  @override
  String get bookingPayAtSalon => 'الدفع في الصالون';

  @override
  String get bookingPayAtSalonOnly =>
      'يستحق الدفع شخصياً عند وصولك إلى الصالون.';

  @override
  String get bookingStatusInProgress => 'قيد التنفيذ';

  @override
  String get bookingTrackerTitle => 'حالة الموعد';

  @override
  String get bookingTrackerConfirmed => 'تم تأكيد موعدك.';

  @override
  String get bookingTrackerInProgress => 'موعدك قيد التنفيذ.';

  @override
  String get bookingTrackerCompleted => 'اكتمل موعدك.';

  @override
  String get bookingTrackerCancelled => 'تم إلغاء هذا الموعد.';

  @override
  String get bookingTrackAction => 'تتبع الموعد';

  @override
  String get profileEditAction => 'تعديل الملف الشخصي';

  @override
  String get profileSavedAddressesAction => 'العناوين المحفوظة';

  @override
  String get profileEditTitle => 'تعديل الملف الشخصي';

  @override
  String get profileSaveAction => 'حفظ';

  @override
  String get profileFullNameLabel => 'الاسم الكامل';

  @override
  String get profilePhoneNumberLabel => 'رقم الهاتف';

  @override
  String get savedAddressesTitle => 'العناوين المحفوظة';

  @override
  String get savedAddressAddTitle => 'إضافة عنوان';

  @override
  String get savedAddressEditTitle => 'تعديل العنوان';

  @override
  String get savedAddressStreetLabel => 'الشارع';

  @override
  String get savedAddressBuildingLabel => 'البناء';

  @override
  String get savedAddressUnitLabel => 'الوحدة';

  @override
  String get savedAddressLatitudeLabel => 'خط العرض';

  @override
  String get savedAddressLongitudeLabel => 'خط الطول';

  @override
  String get businessBranchOperationsTitle => 'عمليات الفرع';

  @override
  String businessAppointmentDateTime(String date, String time) {
    return '$date · $time';
  }

  @override
  String get bookingStatusPending => 'قيد الانتظار';

  @override
  String get bookingStatusNoShow => 'لم يحضر';

  @override
  String get bookingStatusUnknown => 'حالة غير معروفة';

  @override
  String get staffLogOut => 'تسجيل الخروج';

  @override
  String get businessLoginTitle => 'تسجيل الدخول إلى فرعك';

  @override
  String get businessLoginSubtitle => 'استخدم حساب الفرع لإدارة العمليات.';

  @override
  String get stylistLoginTitle => 'تسجيل الدخول إلى حساب الحلاق';

  @override
  String get stylistLoginSubtitle => 'أدر مواعيدك وحالة عملك.';

  @override
  String get chairStatusAvailable => 'متاح';

  @override
  String get chairStatusOccupied => 'مشغول';

  @override
  String get chairStatusMaintenance => 'قيد الصيانة';

  @override
  String get chairStatusUnknown => 'حالة غير معروفة';

  @override
  String get businessRetry => 'إعادة المحاولة';

  @override
  String get businessDashboardTitle => 'لوحة المعلومات';

  @override
  String businessTodayRevenue(Object value) {
    return 'إيرادات اليوم: $value';
  }

  @override
  String businessMonthlyRevenue(Object value) {
    return 'الإيرادات الشهرية: $value';
  }

  @override
  String businessTodayBookings(int value) {
    return 'حجوزات اليوم: $value';
  }

  @override
  String businessActiveChairs(int active, int total) {
    return 'الكراسي النشطة: $active/$total';
  }

  @override
  String businessChairStatus(Object value) {
    return 'حالة الكراسي: $value';
  }

  @override
  String get businessBranchHint => 'الفرع';

  @override
  String get businessAppointmentsTitle => 'المواعيد';

  @override
  String get businessConfirm => 'تأكيد';

  @override
  String get businessStart => 'ابدأ';

  @override
  String get businessComplete => 'إكمال';

  @override
  String get businessNoShow => 'لم يحضر';

  @override
  String get businessCancelBooking => 'إلغاء';

  @override
  String get businessChairsTitle => 'الكراسي';

  @override
  String get businessUnassigned => 'غير معيّن';

  @override
  String get stylistTodayTitle => 'اليوم';

  @override
  String stylistAppointmentDateTime(String date, String time) {
    return '$date · $time';
  }

  @override
  String get stylistWorkstationOnline => 'محطة العمل متصلة';

  @override
  String get stylistUpdateFailed => 'تعذر التحديث. اسحب لإعادة المحاولة.';

  @override
  String get stylistTodayAppointments => 'مواعيد اليوم';

  @override
  String get stylistAcceptBooking => 'قبول الحجز';

  @override
  String get stylistStartSession => 'بدء الجلسة';

  @override
  String get stylistCompleteSession => 'إنهاء الجلسة';

  @override
  String get stylistMarkNoShow => 'تحديد عدم الحضور';
}
