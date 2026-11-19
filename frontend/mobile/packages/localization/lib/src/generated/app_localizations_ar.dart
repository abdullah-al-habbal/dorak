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
  String get recoveryCodeThrottled =>
      'محاولات كثيرة. انتظر دقيقة ثم حاول مجدداً.';

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
  String get favoritesTitle => 'لا توجد مفضلات بعد';

  @override
  String get favoritesSubtitle => 'اضغط على القلب في صالون أو حلاق لحفظه هنا.';

  @override
  String get favoritesActionLabel => 'اكتشف';

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
  String get discoverFreelancerBadge => 'مستقل';

  @override
  String get discoverTravelsToYou => 'يأتي إليك';

  @override
  String get discoverSearchHint => 'ابحث عن صالونات أو علامات تجارية أو خدمات';

  @override
  String ratingSummary(String rating, int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count مراجعة',
      many: '$count مراجعة',
      few: '$count مراجعات',
      two: 'مراجعتان',
      one: 'مراجعة واحدة',
    );
    return '★ $rating ($_temp0)';
  }

  @override
  String get ratingNoReviews => 'لا توجد مراجعات بعد';

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
  String get bookingStatusCancelled => 'ملغي';

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
  String branchChairBarberServices(String name) {
    return 'خدمات $name';
  }

  @override
  String get branchChairShopMenu => 'قائمة خدمات الصالون';

  @override
  String get branchChairNoServices => 'لا توجد خدمات مدرجة لهذا الكرسي بعد.';

  @override
  String get stylistWorkplacesTitle => 'يعمل في';

  @override
  String stylistWorkplaceChair(String place, String chair) {
    return '$place · $chair';
  }

  @override
  String branchChairsCount(int count) {
    return '$count كراسي';
  }

  @override
  String get branchNotBookableTitle => 'الحجز غير متاح بعد';

  @override
  String get branchNotBookableMessage =>
      'لم يجهّز هذا الفرع خدماته أو فريقه بعد. عاود المحاولة قريباً.';

  @override
  String get branchAvailableLabel => 'متاح';

  @override
  String get branchOccupiedLabel => 'مشغول';

  @override
  String get branchBarbersTitle => 'الحلاقون';

  @override
  String get bookingSelectServices => 'اختر الخدمات';

  @override
  String get bookingSelectTime => 'اختر الوقت';

  @override
  String get bookingSelectDate => 'اختر التاريخ';

  @override
  String get bookingNoSlots => 'لا توجد مواعيد متاحة';

  @override
  String get bookingSelectServiceHint => 'اختر خدمة للمتابعة';

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
  String get bookingOutsideScheduleMessage => 'الوقت المطلوب خارج جدول الحلاق.';

  @override
  String get bookingAtHomeBarberRequiredMessage =>
      'الحجز المنزلي يتطلب اختيار حلاق.';

  @override
  String get bookingAtHomeServiceNotEligibleMessage =>
      'يجب أن تكون كل الخدمات خدمات منزلية يقدّمها الحلاق المختار.';

  @override
  String get bookingAtHomeNotOfferedMessage =>
      'هذا الحلاق لا يقدّم خدمة منزلية.';

  @override
  String get bookingAtHomeOutOfRadiusMessage => 'موقعك خارج نطاق تنقّل الحلاق.';

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
  String get historyRebookSuccessTitle => 'تم إعادة الحجز';

  @override
  String get historyRebookSuccessMessage =>
      'تم حجز موعدك الجديد. ستجده في الحجوزات.';

  @override
  String get profileMemberLabel => 'عضو';

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
  String get stylistBookAction => 'احجز';

  @override
  String get stylistBookUnavailableHint =>
      'الحجز متاح للمصففين العاملين في صالون';

  @override
  String get deleteAccountTitle => 'حذف الحساب';

  @override
  String get deleteAccountWarning =>
      'حذف الحساب نهائي. أدخل كلمة المرور للتأكيد.';

  @override
  String get deleteAccountPassword => 'كلمة المرور';

  @override
  String get deleteAccountConfirm => 'احذف حسابي';

  @override
  String get deleteAccountWrongPassword => 'كلمة المرور غير صحيحة.';

  @override
  String get deleteAccountActiveBookings =>
      'ألغِ حجوزاتك القادمة أو أنهها قبل حذف حسابك.';

  @override
  String get historyAttachPhotoAction => 'أضف صورة';

  @override
  String get historyMediaTypeTitle => 'ما نوع هذه الصورة؟';

  @override
  String get historyMediaTypeBefore => 'قبل';

  @override
  String get historyMediaTypeAfter => 'بعد';

  @override
  String get historyMediaTypeReference => 'مرجع';

  @override
  String get historyMediaTypeContinue => 'متابعة';

  @override
  String get historyAttachPhotoFailed => 'تعذّرت إضافة الصورة. حاول مرة أخرى.';

  @override
  String get branchReviewsTitle => 'التقييمات';

  @override
  String get branchReviewsEmptyTitle => 'لا توجد تقييمات بعد';

  @override
  String get branchReviewsEmptyMessage => 'ستظهر هنا تقييمات العملاء.';

  @override
  String get branchReviewsLoadMore => 'عرض المزيد';

  @override
  String get savedFiltersTitle => 'المرشحات المحفوظة';

  @override
  String get savedFiltersEmpty => 'لا توجد مرشحات محفوظة بعد.';

  @override
  String get savedFiltersDelete => 'حذف المرشح';

  @override
  String get savedFiltersNameLabel => 'اسم المرشح';

  @override
  String get savedFiltersSaveCurrent => 'احفظ المرشحات الحالية';

  @override
  String get discoveryPreferencesTitle => 'تفضيلات الاستكشاف';

  @override
  String get discoveryPreferencesShowUnavailable => 'إظهار النتائج غير المتاحة';

  @override
  String get discoveryPreferencesClearHidden => 'إظهار العلامات المخفية مجددًا';

  @override
  String discoveryPreferencesRadius(int km) {
    return 'نطاق البحث الافتراضي: $km كم';
  }

  @override
  String discoveryPreferencesHiddenBrands(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count علامة مخفية',
      many: '$count علامة مخفية',
      few: '$count علامات مخفية',
      two: 'علامتان مخفيتان',
      one: 'علامة واحدة مخفية',
      zero: 'لا علامات مخفية',
    );
    return '$_temp0';
  }

  @override
  String get discoveryPreferencesChooseBrands => 'اختيار العلامات لإخفائها';

  @override
  String get brandVisibilityTitle => 'إخفاء العلامات من الاستكشاف';

  @override
  String get brandVisibilityEmpty => 'لا توجد علامات متاحة.';

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
  String get bookingTrackerPending => 'موعدك بانتظار التأكيد.';

  @override
  String get bookingTrackerNoShow => 'تم تسجيل هذا الموعد كعدم حضور.';

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
  String get profileEmailLabel => 'البريد الإلكتروني';

  @override
  String get profileSettingsAction => 'الإعدادات';

  @override
  String get profileSettingsTitle => 'الإعدادات';

  @override
  String get profileSettingsLanguageLabel => 'اللغة المفضلة';

  @override
  String get profileSettingsLanguageEnglish => 'الإنجليزية';

  @override
  String get profileSettingsLanguageArabic => 'العربية';

  @override
  String get profileSettingsCurrencyLabel => 'عملة العرض';

  @override
  String get profileSettingsPriceDisplayModeLabel => 'عرض السعر';

  @override
  String get profileSettingsPriceDisplayModeTaxInclusive => 'شامل الضريبة';

  @override
  String get profileSettingsPriceDisplayModeTaxExclusive => 'غير شامل الضريبة';

  @override
  String get profileSettingsSaved => 'تم حفظ الإعدادات';

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
  String get stylistSignUpLink => 'جديد في دوراك؟ أنشئ حساب مصفف';

  @override
  String get stylistSignUpTitle => 'انضم إلى دوراك كمصفف';

  @override
  String get stylistSignUpSubtitle =>
      'أنشئ حسابك. يراجع المشرف المصففين الجدد قبل أن يتمكنوا من استقبال الحجوزات.';

  @override
  String get stylistSignUpFreelancerLabel => 'أعمل بشكل مستقل';

  @override
  String get stylistSignUpEmailTaken =>
      'يوجد حساب مسجل بهذا البريد الإلكتروني.';

  @override
  String get stylistVerifyCodeLabel => 'رمز التحقق';

  @override
  String get stylistVerifyCodeResent => 'تم إرسال رمز جديد.';

  @override
  String get stylistPendingTitle => 'بانتظار الموافقة';

  @override
  String get stylistPendingMessage =>
      'تم إنشاء حسابك. سيراجعه المشرف ويفعّله، ويمكنك تسجيل الدخول بعد الموافقة.';

  @override
  String get stylistPendingBackToLogin => 'العودة إلى تسجيل الدخول';

  @override
  String get chairStatusAvailable => 'متاح';

  @override
  String get chairStatusOccupied => 'مشغول';

  @override
  String get chairStatusMaintenance => 'قيد الصيانة';

  @override
  String get chairMaintenanceConflictTitle => 'للكرسي حجوزات قادمة';

  @override
  String chairMaintenanceConflictBody(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other:
          'هناك $count حجزًا قادمًا على هذا الكرسي. سيؤدي تعيين الصيانة إلى إلغائها وإشعار كل عميل.',
      few:
          'هناك $count حجوزات قادمة على هذا الكرسي. سيؤدي تعيين الصيانة إلى إلغائها وإشعار كل عميل.',
      two:
          'هناك حجزان قادمان على هذا الكرسي. سيؤدي تعيين الصيانة إلى إلغائهما وإشعار العميلين.',
      one:
          'هناك حجز قادم واحد على هذا الكرسي. سيؤدي تعيين الصيانة إلى إلغائه وإشعار العميل.',
    );
    return '$_temp0';
  }

  @override
  String chairMaintenanceConflictConfirm(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: 'تعيين الصيانة وإلغاء $count حجزًا',
      few: 'تعيين الصيانة وإلغاء $count حجوزات',
      two: 'تعيين الصيانة وإلغاء حجزين',
      one: 'تعيين الصيانة وإلغاء حجز واحد',
    );
    return '$_temp0';
  }

  @override
  String get chairMaintenanceConflictKeep => 'إبقاء الكرسي متاحًا';

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

  @override
  String get notificationsTitle => 'الإشعارات';

  @override
  String get notificationsEmptyTitle => 'لا توجد إشعارات بعد';

  @override
  String get notificationsEmptyMessage =>
      'ستظهر هنا تحديثات الحجوزات والدعوات وطلبات التقييم.';

  @override
  String get notificationsMarkAllRead => 'تعليم الكل كمقروء';

  @override
  String get notificationsUnreadLabel => 'غير مقروء';

  @override
  String get profileNotificationsAction => 'الإشعارات';

  @override
  String get phoneVerifyTitle => 'تأكيد رقم الهاتف';

  @override
  String phoneVerifySubtitle(String phone) {
    return 'أدخل الرمز المكوّن من 6 أرقام الذي أرسلناه إلى $phone';
  }

  @override
  String get phoneVerifyCodeLabel => 'رمز التحقق';

  @override
  String get phoneVerifyButton => 'تأكيد الهاتف';

  @override
  String get phoneVerifyResend => 'إعادة إرسال الرمز';

  @override
  String get phoneVerifySkip => 'ليس الآن';

  @override
  String get phoneVerifyIncomplete => 'أدخل الرمز المكوّن من 6 أرقام.';

  @override
  String get phoneVerifyInvalidCode => 'الرمز غير صحيح أو منتهي الصلاحية.';

  @override
  String get phoneVerifyPhoneRejected =>
      'لا يمكن تأكيد رقم الهاتف هذا. تحقق منه أو استخدم رقماً آخر.';

  @override
  String get phoneVerifyThrottled =>
      'محاولات كثيرة. انتظر دقيقة ثم حاول مجدداً.';

  @override
  String get profilePhoneVerifiedLabel => 'موثّق';

  @override
  String get profilePhoneChangeHint => 'تغيير الهاتف يرسل رمز تحقق';

  @override
  String branchTodayHours(String opens, String closes) {
    return 'اليوم $opens–$closes';
  }

  @override
  String get branchClosedToday => 'مغلق اليوم';

  @override
  String get branchAddressLabel => 'العنوان';

  @override
  String get stylistMenuSchedule => 'الجدول';

  @override
  String get stylistMenuPortfolio => 'معرض الأعمال';

  @override
  String get stylistMenuProfile => 'الملف الشخصي';

  @override
  String get stylistMenuAffiliations => 'الانتسابات';

  @override
  String get stylistMenuJobs => 'الوظائف';

  @override
  String get stylistCancelBooking => 'إلغاء الحجز';

  @override
  String get stylistCancelReasonTitle => 'لماذا تلغي الحجز؟';

  @override
  String get stylistCancelReasonLabel => 'السبب';

  @override
  String get stylistCancelReasonRequired => 'أدخل السبب';

  @override
  String get stylistCancelKeep => 'إبقاء الحجز';

  @override
  String get stylistSave => 'حفظ';

  @override
  String get stylistSaved => 'تم الحفظ';

  @override
  String get stylistLoadFailed => 'تعذر التحميل. اسحب للمحاولة مجددًا.';

  @override
  String get stylistScheduleTitle => 'ساعات العمل الأسبوعية';

  @override
  String get stylistScheduleStart => 'البداية';

  @override
  String get stylistScheduleEnd => 'النهاية';

  @override
  String get stylistScheduleInvalidRange =>
      'يجب أن يكون وقت النهاية بعد وقت البداية';

  @override
  String get stylistScheduleEmpty => 'فعّل يوم عمل واحدًا على الأقل';

  @override
  String get stylistWeekday0 => 'الأحد';

  @override
  String get stylistWeekday1 => 'الاثنين';

  @override
  String get stylistWeekday2 => 'الثلاثاء';

  @override
  String get stylistWeekday3 => 'الأربعاء';

  @override
  String get stylistWeekday4 => 'الخميس';

  @override
  String get stylistWeekday5 => 'الجمعة';

  @override
  String get stylistWeekday6 => 'السبت';

  @override
  String get stylistPortfolioTitle => 'معرض الأعمال';

  @override
  String get stylistPortfolioEmpty => 'لا توجد صور بعد. أضف أفضل أعمالك.';

  @override
  String get stylistPortfolioAdd => 'إضافة صورة';

  @override
  String get stylistPortfolioDelete => 'حذف الصورة';

  @override
  String get stylistProfileTitle => 'الملف الشخصي';

  @override
  String get stylistProfileBioEnglish => 'النبذة (الإنجليزية)';

  @override
  String get stylistProfileBioArabic => 'النبذة (العربية)';

  @override
  String get stylistTravelRadiusLabel => 'نطاق التنقل';

  @override
  String stylistTravelRadiusValue(String kilometers) {
    return '$kilometers كم';
  }

  @override
  String get stylistAffiliationsTitle => 'الانتسابات';

  @override
  String get stylistAffiliationsEmpty => 'لا توجد انتسابات بعد.';

  @override
  String get stylistAffiliationAccept => 'قبول';

  @override
  String get stylistAffiliationReject => 'رفض';

  @override
  String get stylistAffiliationStatusPending => 'قيد الانتظار';

  @override
  String get stylistAffiliationStatusActive => 'نشط';

  @override
  String get stylistAffiliationStatusRejected => 'مرفوض';

  @override
  String get stylistAffiliationStatusTerminated => 'منتهٍ';

  @override
  String get stylistJobsTitle => 'الوظائف';

  @override
  String get stylistJobsEmpty => 'لا توجد وظائف متاحة حاليًا.';

  @override
  String get stylistJobApply => 'تقديم';

  @override
  String get stylistJobApplied => 'تم إرسال الطلب';

  @override
  String get stylistJobApplyRejected => 'الوظيفة مغلقة أو قدّمت عليها مسبقًا.';

  @override
  String get stylistMyApplications => 'طلباتي';

  @override
  String get stylistApplicationsEmpty => 'لم تقدّم على أي وظيفة بعد.';

  @override
  String get stylistApplicationStatusSubmitted => 'تم الإرسال';

  @override
  String get stylistApplicationStatusSeen => 'تمت المشاهدة';

  @override
  String get stylistApplicationStatusAccepted => 'مقبول';

  @override
  String get stylistApplicationStatusRejected => 'مرفوض';

  @override
  String get businessMenuJobs => 'الوظائف';

  @override
  String get businessMenuFloorPlan => 'مخطط الصالون';

  @override
  String get businessMenuAffiliations => 'الانتسابات';

  @override
  String get businessMenuProfile => 'ملف الفرع';

  @override
  String get businessMenuReviews => 'التقييمات';

  @override
  String get businessSave => 'حفظ';

  @override
  String get businessSaved => 'تم الحفظ';

  @override
  String get businessLoadFailed => 'تعذر التحميل. اسحب للمحاولة مجددًا.';

  @override
  String get businessUpdateFailed => 'تعذر الحفظ. حاول مرة أخرى.';

  @override
  String get businessFeatureNotEnabled =>
      'هذه الميزة ليست ضمن باقتك الحالية. قم بالترقية لاستخدامها.';

  @override
  String get businessJobsTitle => 'الوظائف';

  @override
  String get businessJobsEmpty => 'لا توجد وظائف بعد.';

  @override
  String get businessJobAdd => 'إضافة وظيفة';

  @override
  String get businessJobNewTitle => 'وظيفة جديدة';

  @override
  String get businessJobEditTitle => 'تعديل الوظيفة';

  @override
  String get businessJobTitleEnglish => 'العنوان (الإنجليزية)';

  @override
  String get businessJobTitleArabic => 'العنوان (العربية)';

  @override
  String get businessJobDescriptionEnglish => 'الوصف (الإنجليزية)';

  @override
  String get businessJobDescriptionArabic => 'الوصف (العربية)';

  @override
  String get businessJobLocation => 'الموقع';

  @override
  String get businessJobType => 'النوع';

  @override
  String get businessJobFieldRequired => 'مطلوب';

  @override
  String get businessJobDelete => 'حذف';

  @override
  String get businessJobApplicants => 'المتقدمون';

  @override
  String get businessApplicantsEmpty => 'لا توجد طلبات بعد.';

  @override
  String get businessApplicantAccept => 'قبول';

  @override
  String get businessApplicantReject => 'رفض';

  @override
  String get businessApplicationStatusSubmitted => 'تم الإرسال';

  @override
  String get businessApplicationStatusSeen => 'تمت المشاهدة';

  @override
  String get businessApplicationStatusAccepted => 'مقبول';

  @override
  String get businessApplicationStatusRejected => 'مرفوض';

  @override
  String get businessFloorPlanTitle => 'مخطط الصالون';

  @override
  String get businessFloorPlanPresetStandard => 'قياسي';

  @override
  String get businessFloorPlanPresetCompact => 'مدمج';

  @override
  String get businessFloorPlanPresetUnisexZoned => 'مناطق مختلطة';

  @override
  String get businessAffiliationsTitle => 'الانتسابات';

  @override
  String get businessAffiliationsEmpty => 'لا توجد طلبات انتساب.';

  @override
  String get businessAffiliationsPending => 'الطلبات المعلقة';

  @override
  String get businessAffiliationsOthers => 'انتسابات أخرى';

  @override
  String get businessAffiliationAccept => 'قبول';

  @override
  String get businessAffiliationReject => 'رفض';

  @override
  String get businessAffiliationStatusPending => 'قيد الانتظار';

  @override
  String get businessAffiliationStatusActive => 'نشط';

  @override
  String get businessAffiliationStatusRejected => 'مرفوض';

  @override
  String get businessAffiliationStatusTerminated => 'منتهٍ';

  @override
  String get businessProfileTitle => 'ملف الفرع';

  @override
  String get businessProfileDescriptionEnglish => 'الوصف (الإنجليزية)';

  @override
  String get businessProfileDescriptionArabic => 'الوصف (العربية)';

  @override
  String get businessProfileAddressEnglish => 'العنوان (الإنجليزية)';

  @override
  String get businessProfileAddressArabic => 'العنوان (العربية)';

  @override
  String get businessProfileTags => 'الوسوم (مفصولة بفواصل)';

  @override
  String get businessReviewsTitle => 'التقييمات';

  @override
  String get businessReviewsEmpty => 'لا توجد تقييمات بعد.';

  @override
  String businessReviewRating(int rating) {
    return '$rating / 5';
  }

  @override
  String get reviewDisputeAction => 'اعتراض';

  @override
  String get reviewDisputeTitle => 'الاعتراض على هذا التقييم';

  @override
  String get reviewDisputeReasonLabel => 'لماذا هذا التقييم غير صحيح؟';

  @override
  String reviewDisputeReasonTooShort(int min) {
    return 'أدخل $min أحرف على الأقل';
  }

  @override
  String get reviewDisputeCancel => 'إلغاء';

  @override
  String get reviewDisputeSubmit => 'إرسال الاعتراض';

  @override
  String get reviewDisputeUnderReview => 'قيد مراجعة الإدارة';

  @override
  String get reviewDisputeSent => 'تم إرسال الاعتراض. ستراجعه الإدارة.';

  @override
  String get stylistMenuReviews => 'التقييمات';

  @override
  String get stylistReviewsTitle => 'التقييمات';

  @override
  String get stylistReviewsEmpty => 'لا توجد تقييمات بعد.';

  @override
  String stylistReviewRating(int rating) {
    return '$rating / 5';
  }

  @override
  String get stylistClientHistoryAction => 'سجل الزيارات';

  @override
  String get stylistClientHistoryTitle => 'سجل العميل';

  @override
  String get stylistClientHistoryEmpty =>
      'لا توجد زيارات مسجلة لهذا العميل بعد.';

  @override
  String get stylistHistoryVisitFallback => 'زيارة';

  @override
  String get stylistHistoryPhotoAdded => 'تمت إضافة الصورة.';

  @override
  String get staffTabHome => 'الرئيسية';

  @override
  String get staffTabInbox => 'الوارد';

  @override
  String get staffTabMore => 'المزيد';

  @override
  String get staffMoreTitle => 'المزيد';

  @override
  String get staffEarningsTitle => 'الأرباح';

  @override
  String get staffEarningsEmpty => 'لا توجد حجوزات مكتملة في هذه الفترة.';

  @override
  String get staffEarningsRangeMonth => 'هذا الشهر';

  @override
  String get staffEarningsRangeAll => 'كل الفترات';

  @override
  String get staffEarningsGross => 'الإجمالي';

  @override
  String get staffEarningsCommission => 'العمولة';

  @override
  String get staffEarningsNet => 'الصافي';

  @override
  String get staffEarningsNetUnavailable => 'غير متاح';

  @override
  String staffEarningsBookings(int count) {
    return '$count حجوزات مكتملة';
  }

  @override
  String get staffInboxTitle => 'الوارد';

  @override
  String get staffServiceNameEn => 'الاسم (بالإنجليزية)';

  @override
  String get staffServiceNameAr => 'الاسم (بالعربية)';

  @override
  String get staffServicePrice => 'السعر';

  @override
  String get staffServiceCurrency => 'رمز العملة';

  @override
  String get staffServiceDuration => 'المدة (بالدقائق)';

  @override
  String get staffServiceAtHome => 'متاحة في المنزل';

  @override
  String get staffServiceActive => 'مفعّلة';

  @override
  String get staffServiceInactive => 'غير مفعّلة';

  @override
  String get staffServiceAdd => 'إضافة خدمة';

  @override
  String get staffServiceEditTitle => 'تعديل الخدمة';

  @override
  String get staffServiceNewTitle => 'خدمة جديدة';

  @override
  String get staffServiceSave => 'حفظ الخدمة';

  @override
  String get staffServiceDelete => 'حذف';

  @override
  String get staffServiceDeleteTitle => 'حذف هذه الخدمة؟';

  @override
  String get staffServiceDeleteMessage => 'لن يتمكن العملاء من حجزها بعد الآن.';

  @override
  String get staffServiceCancel => 'إلغاء';

  @override
  String get staffServiceRequired => 'هذا الحقل مطلوب.';

  @override
  String get staffServiceInvalidNumber => 'أدخل رقماً صحيحاً.';

  @override
  String staffServiceMeta(String price, String currency, int minutes) {
    return '$price $currency · $minutes د';
  }

  @override
  String staffServiceMetaNoDuration(String price, String currency) {
    return '$price $currency';
  }

  @override
  String get businessTabStaff => 'الفريق';

  @override
  String get businessTabServices => 'الخدمات';

  @override
  String get businessMenuHours => 'ساعات العمل';

  @override
  String get businessMenuEarnings => 'الأرباح';

  @override
  String get businessStaffTitle => 'الفريق';

  @override
  String get businessStaffEmpty => 'لا يوجد مصففون في هذا الفرع بعد.';

  @override
  String get businessStaffActivate => 'تفعيل';

  @override
  String get businessStaffDeactivate => 'تعطيل';

  @override
  String get businessStaffStatusEnabled => 'مفعّل';

  @override
  String get businessStaffStatusDisabled => 'معطّل';

  @override
  String get businessStaffStatusPending => 'قيد المراجعة';

  @override
  String businessStaffRating(String rating, int count) {
    return '$rating ($count)';
  }

  @override
  String get businessServicesTitle => 'الخدمات';

  @override
  String get businessServicesEmpty => 'لا توجد خدمات بعد. يضيفها مالك العلامة.';

  @override
  String get businessHoursTitle => 'ساعات العمل';

  @override
  String get businessHoursClosed => 'مغلق';

  @override
  String get businessHoursOpens => 'يفتح';

  @override
  String get businessHoursCloses => 'يغلق';

  @override
  String get businessHoursInvalidRange =>
      'يجب أن يكون وقت الإغلاق بعد وقت الفتح.';

  @override
  String get stylistTabHistory => 'السجل';

  @override
  String get stylistTabEarnings => 'الأرباح';

  @override
  String get stylistMenuServices => 'الخدمات والأسعار';

  @override
  String get stylistHistoryTitle => 'المواعيد السابقة';

  @override
  String get stylistHistoryEmpty => 'لا توجد مواعيد مطابقة لهذا الفلتر.';

  @override
  String get stylistHistoryFilterAll => 'الكل';

  @override
  String get stylistServicesEditorTitle => 'الخدمات والأسعار';

  @override
  String get stylistServicesEditorEmpty => 'ليس لديك خدمات بعد. أضف أول خدمة.';

  @override
  String get socialLoginDivider => 'أو';

  @override
  String get socialLoginGoogle => 'المتابعة باستخدام Google';

  @override
  String get socialLoginFailed => 'فشل تسجيل الدخول. حاول مرة أخرى.';

  @override
  String get aboutLegalTitle => 'حول التطبيق والقانونية';

  @override
  String get legalPrivacyPolicy => 'سياسة الخصوصية';

  @override
  String get legalTermsOfService => 'شروط الاستخدام';

  @override
  String get legalAboutDorak => 'عن دورك';

  @override
  String get legalContactUs => 'تواصل معنا';

  @override
  String get legalDeleteAccountInfo => 'كيفية حذف حسابك';

  @override
  String appVersionLabel(String version) {
    return 'الإصدار $version';
  }

  @override
  String get openLinkFailed => 'تعذّر فتح الرابط. حاول لاحقًا.';

  @override
  String get feedbackEntry => 'إرسال ملاحظات';

  @override
  String get feedbackTitle => 'إرسال ملاحظات';

  @override
  String get feedbackKindLabel => 'ما نوع رسالتك؟';

  @override
  String get feedbackKindSuggestion => 'اقتراح';

  @override
  String get feedbackKindBug => 'خطأ';

  @override
  String get feedbackKindSupport => 'دعم';

  @override
  String get feedbackMessageLabel => 'رسالتك';

  @override
  String get feedbackMessageHint => 'أخبرنا بما حدث أو بما تتمناه';

  @override
  String get feedbackMessageTooShort => 'اكتب 5 أحرف على الأقل.';

  @override
  String get feedbackEmailLabel => 'بريدك الإلكتروني';

  @override
  String get feedbackEmailInvalid =>
      'أدخل بريدًا إلكترونيًا صالحًا لنتمكن من الرد.';

  @override
  String get feedbackSubmit => 'إرسال';

  @override
  String get feedbackSent => 'شكرًا لك. وصلتنا رسالتك.';

  @override
  String get feedbackFailed =>
      'تعذّر إرسال رسالتك. تحقق من اتصالك وحاول مجددًا.';

  @override
  String get feedbackRateLimited => 'أرسلت عدة رسائل بالفعل. حاول لاحقًا.';

  @override
  String get deleteAccountActiveAffiliation =>
      'أنهِ عملك مع العلامة التجارية أو الفرع أولاً، ثم احذف حسابك.';

  @override
  String get ownerRoleBranch => 'حساب الفرع';

  @override
  String get ownerRoleOwner => 'مالك العلامة التجارية';

  @override
  String get ownerRoleLabel => 'تسجيل الدخول كـ';

  @override
  String get ownerRegisterLink => 'سجّل كمالك علامة تجارية على الموقع';

  @override
  String get ownerHomeTitle => 'علامتي التجارية';

  @override
  String get ownerBannerPending =>
      'علامتك التجارية بانتظار الموافقة. يمكنك حتى ذلك الحين تعديلها وإضافة فرع واحد، بينما تبقى الحجوزات والفوترة مقفلة.';

  @override
  String ownerBannerRejected(String reason) {
    return 'تم رفض علامتك التجارية: $reason';
  }

  @override
  String get ownerBannerRejectedNoReason => 'تم رفض علامتك التجارية.';

  @override
  String get ownerBannerSuspended =>
      'علامتك التجارية موقوفة. يمكنك عرض كل شيء ولكن لا يمكن تغيير أي شيء.';

  @override
  String get ownerResubmit => 'إرسال لمراجعة أخرى';

  @override
  String get ownerResubmitted => 'تم الإرسال للمراجعة.';

  @override
  String get ownerBrandActive => 'نشطة';

  @override
  String get ownerBrandPending => 'بانتظار الموافقة';

  @override
  String get ownerBrandRejected => 'مرفوضة';

  @override
  String get ownerBrandSuspended => 'موقوفة';

  @override
  String get ownerNoBrandTitle => 'لا توجد علامة تجارية لهذا الحساب';

  @override
  String get ownerNoBrandBody =>
      'يتم تسجيل مالكي العلامات التجارية على الموقع. سجّل هناك ثم سجّل الدخول مجددًا.';

  @override
  String get ownerMenuBranches => 'الفروع';

  @override
  String get ownerMenuServices => 'الخدمات';

  @override
  String get ownerMenuBilling => 'الباقة والمدفوعات';

  @override
  String get ownerBranchesTitle => 'الفروع';

  @override
  String get ownerBranchesEmpty => 'لا توجد فروع بعد.';

  @override
  String get ownerBranchAdd => 'إضافة فرع';

  @override
  String get ownerBranchEdit => 'تعديل الفرع';

  @override
  String get ownerBranchNameEn => 'الاسم (الإنجليزية)';

  @override
  String get ownerBranchNameAr => 'الاسم (العربية)';

  @override
  String get ownerBranchEmail => 'البريد الإلكتروني لدخول الفرع';

  @override
  String get ownerBranchPassword => 'كلمة مرور دخول الفرع';

  @override
  String get ownerBranchPasswordKeep =>
      'اتركها فارغة للإبقاء على كلمة المرور الحالية';

  @override
  String get ownerBranchSave => 'حفظ الفرع';

  @override
  String get ownerBranchSaved => 'تم حفظ الفرع.';

  @override
  String get ownerBranchOn => 'مفتوح';

  @override
  String get ownerBranchOff => 'مغلق';

  @override
  String get ownerErrorBrandNotApproved =>
      'هذا متاح بعد الموافقة على علامتك التجارية.';

  @override
  String get ownerErrorReadOnly => 'لا يمكن تغيير علامة تجارية موقوفة.';

  @override
  String get ownerBillingTitle => 'الباقة والمدفوعات';

  @override
  String get ownerSubscriptionTitle => 'الباقة';

  @override
  String get ownerNoSubscription => 'لا توجد باقة بعد.';

  @override
  String ownerPlanLine(String plan, String status) {
    return '$plan · $status';
  }

  @override
  String get ownerPayoutsTitle => 'المدفوعات';

  @override
  String get ownerPayoutsEmpty => 'لا توجد مدفوعات بعد.';

  @override
  String ownerPayoutLine(String amount, String currency, String status) {
    return '$amount $currency · $status';
  }

  @override
  String get ownerServicesTitle => 'الخدمات';

  @override
  String get ownerServicesEmpty => 'لا توجد خدمات بعد.';

  @override
  String get ownerServiceAdd => 'إضافة خدمة';

  @override
  String get ownerServiceEdit => 'تعديل الخدمة';

  @override
  String get ownerServiceName => 'الاسم';

  @override
  String get ownerServicePrice => 'السعر';

  @override
  String get ownerServiceCurrency => 'رمز العملة';

  @override
  String get ownerServiceDuration => 'المدة (بالدقائق)';

  @override
  String get ownerServiceSave => 'حفظ الخدمة';

  @override
  String get ownerServiceSaved => 'تم حفظ الخدمة.';

  @override
  String get ownerServiceDelete => 'حذف الخدمة';

  @override
  String get ownerFieldInvalidNumber => 'أدخل رقمًا صالحًا';
}
