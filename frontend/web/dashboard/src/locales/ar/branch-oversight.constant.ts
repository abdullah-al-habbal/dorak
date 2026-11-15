import type { Dictionary } from "@/types/core/dictionary.type";

export const arBranchOversight: Dictionary["branchOversight"] = {
  description: "عرض للقراءة فقط لهذا الفرع لأغراض الدعم. الكراسي والمصففون والخدمات في قوائمها الخاصة مع تصفية بالفرع.",
  none: "-",
  loadFailed: "تعذّر تحميل هذا القسم.",
  close: "إغلاق",
  edit: "تعديل الفرع",
  reviews: { title: "التقييمات", none: "لا توجد تقييمات بعد.", summary: "المتوسط {average} من {count} تقييم" },
  hours: { title: "ساعات العمل", closed: "مغلق", notConfigured: "لا توجد ساعات محفوظة لهذا الفرع." },
  invitations: { title: "دعوات الحلاقين", empty: "لا توجد دعوات." },
  jobs: { title: "الوظائف المعلنة", empty: "لا توجد وظائف معلنة.", applications: "{count} طلب" },
  states: { pending: "قيد الانتظار", active: "نشط", rejected: "مرفوض", terminated: "منتهٍ", open: "مفتوح", closed: "مغلق", draft: "مسودة", filled: "مكتمل" },
};
