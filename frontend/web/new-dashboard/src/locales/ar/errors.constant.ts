import type { Dictionary } from "@/types/dictionary.type";

export const arErrors: Dictionary["errors"] = {
  notFound: { title: "الصفحة غير موجودة", body: "هذه الصفحة غير موجودة أو تم نقلها." },
  generic: { title: "حدث خطأ ما", body: "تعذر عرض الصفحة. حاول مرة أخرى." },
  forbidden: { title: "تم رفض الوصول", body: "دورك لا يسمح بفتح هذه المنطقة." },
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
    too_many_requests: "محاولات كثيرة. انتظر دقيقة ثم حاول مجددًا.",
    network_error: "تعذر الوصول إلى الخادم. تحقق من اتصالك.",
    server_error: "حدث خطأ من جانبنا. حاول مجددًا بعد قليل.",
  },
};
