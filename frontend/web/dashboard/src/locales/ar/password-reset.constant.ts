import type { Dictionary } from "@/types/core/shared/dictionary.type";

export const arPasswordReset: Dictionary["passwordReset"] = {
  forgotLink: "نسيت كلمة المرور؟",
  forgot: {
    title: "إعادة تعيين كلمة المرور",
    body: "أدخل البريد الذي تسجّل الدخول به، وسنرسل إليك رابطًا لتعيين كلمة مرور جديدة.",
    submit: "إرسال رابط إعادة التعيين",
    submitting: "جارٍ الإرسال…",
    sentTitle: "تحقّق من بريدك",
    sentBody: "إذا كان {email} يستطيع تسجيل الدخول إلى مساحة العمل هذه، فرابط إعادة التعيين في الطريق إليه. يعمل الرابط مرة واحدة وتنتهي صلاحيته خلال ساعة.",
    otherEmail: "استخدام بريد آخر",
  },
  reset: {
    title: "تعيين كلمة مرور جديدة",
    body: "استخدم 12 حرفًا على الأقل. سيُسجَّل خروج كل جهاز مسجّل الدخول بهذا الحساب.",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور الجديدة",
    submit: "تعيين كلمة المرور",
    submitting: "جارٍ الحفظ…",
    invalidTitle: "لا يمكن استخدام هذا الرابط",
    invalidBody: "ربما انتهت صلاحيته أو استُخدم من قبل. اطلب رابطًا جديدًا.",
    requestNew: "طلب رابط جديد",
  },
  validation: {
    email: "أدخل عنوان بريد إلكتروني صالحًا.",
    passwordLength: "استخدم من 12 إلى 255 حرفًا.",
    passwordMismatch: "كلمتا المرور غير متطابقتين.",
  },
  tooManyRequests: "طلبات كثيرة جدًا. انتظر بضع دقائق ثم حاول مرة أخرى.",
  doneNotice: "تم تحديث كلمة المرور. سجّل الدخول بكلمة المرور الجديدة.",
  backToSignIn: "العودة إلى تسجيل الدخول",
};
