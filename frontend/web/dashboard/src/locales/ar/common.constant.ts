import type { Dictionary } from "@/types/core/shared/dictionary.type";

export const arCommon: Dictionary["common"] = {
  appName: "دورك",
  appTagline: "إدارة العمليات للصالونات ومحلات الحلاقة",
  loading: "جارٍ التحميل…",
  retry: "حاول مرة أخرى",
  cancel: "إلغاء",
  close: "إغلاق",
  pagination: { previous: "السابق", next: "التالي", page: "الصفحة {page} من {total}" },
  filters: { active: "التصفية النشطة", remove: "إزالة التصفية {filter}", clearAll: "مسح الكل", on: "مفعّل" },
  reason: { label: "السبب (اختياري)", tooShort: "استخدم {min} أحرف على الأقل، أو اترك الحقل فارغًا." },
  fields: { optional: "اختياري", required: "مطلوب" },
  skipToContent: "انتقل إلى المحتوى",
  language: "اللغة",
  theme: {
    label: "المظهر",
    light: "فاتح",
    dark: "داكن",
    system: "النظام",
  },
};
