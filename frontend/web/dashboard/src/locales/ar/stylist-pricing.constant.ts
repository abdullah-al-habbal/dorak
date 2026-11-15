import type { Dictionary } from "@/types/core/dictionary.type";

export const arStylistPricing: Dictionary["stylistPricing"] = {
  open: "التسعير",
  title: "تسعير {name}",
  description: "حدّد سعر علامتك ومدة خدمات هذا الحلاق. إعادة الضبط تُرجع الخدمة إلى شروط الحلاق.",
  brand: "العلامة التجارية",
  services: "الخدمات",
  default: "افتراضي الحلاق",
  overridden: "شروطك",
  defaultTerms: "الافتراضي: {price}، {duration} دقيقة",
  price: "السعر ({currency})",
  duration: "المدة (بالدقائق)",
  save: "حفظ",
  reset: "العودة للافتراضي",
  invalid: "أدخل سعراً صحيحاً وعدداً صحيحاً من الدقائق.",
  nothing: "غيّر السعر أو المدة ليختلف عن الافتراضي.",
  toast: { saved: "تم حفظ التسعير.", cleared: "عادت الخدمة إلى افتراضي الحلاق.", failed: "تعذّر تغيير التسعير. قد لا يعمل هذا الحلاق لدى هذه العلامة." },
  states: {
    emptyTitle: "لا توجد خدمات",
    emptyBody: "لم يضف هذا الحلاق أي خدمات بعد.",
    errorTitle: "تعذّر تحميل التسعير",
    errorBody: "تحقق من اتصالك ثم حاول مرة أخرى.",
  },
};
