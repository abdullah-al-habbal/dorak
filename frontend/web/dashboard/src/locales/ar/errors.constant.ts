import type { Dictionary } from "@/types/core/shared/dictionary.type";

export const arErrors: Dictionary["errors"] = {
  notFound: { title: "الصفحة غير موجودة", body: "هذه الصفحة غير موجودة أو تم نقلها." },
  generic: { title: "حدث خطأ ما", body: "تعذر عرض الصفحة. حاول مرة أخرى." },
  forbidden: { title: "تم رفض الوصول", body: "دورك لا يسمح بفتح هذه المنطقة." },
  unavailable: { title: "غير متاح مؤقتًا", body: "دورك في صيانة أو لا يمكن الوصول إليه الآن. حاول مرة أخرى بعد دقائق." },
  rateLimited: { title: "طلبات كثيرة جدًا", body: "أرسلت طلبات كثيرة جدًا. انتظر دقيقة ثم حاول مجددًا." },
  reference: "المرجع",
  backToWorkspace: "العودة إلى مساحة عملك",
  api: {
    invalid_request: "تعذر فهم الطلب.",
    invalid_credentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    account_banned: "هذا الحساب موقوف. تواصل مع الدعم.",
    session_expired: "انتهت جلستك. سجّل الدخول مرة أخرى.",
    session_setup_failed: "تعذر بدء جلستك. حاول مرة أخرى.",
    refresh_unauthorized: "انتهت جلستك. سجّل الدخول مرة أخرى.",
    forbidden: "ليست لديك صلاحية الوصول إلى هذا.",
    resource_not_found: "تعذر العثور على ذلك.",
    conflict: "تم أخذ هذا الموعد أو تغييره للتو. أعد التحميل وحاول مرة أخرى.",
    too_many_requests: "محاولات كثيرة. انتظر دقيقة ثم حاول مجددًا.",
    network_error: "تعذر الوصول إلى الخادم. تحقق من اتصالك.",
    service_unavailable: "دورك غير متاح مؤقتًا. حاول مرة أخرى بعد دقائق.",
    server_error: "حدث خطأ من جانبنا. حاول مجددًا بعد قليل.",
  },
};
