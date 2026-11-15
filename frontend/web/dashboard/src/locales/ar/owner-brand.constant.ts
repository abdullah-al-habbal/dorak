import type { Dictionary } from "@/types/core/dictionary.type";

export const arOwnerBrand: Dictionary["ownerBrand"] = {
  title: "العلامة التجارية",
  description: "ملف علامتك التجارية. أي علامة جديدة تذهب إلى فريق المنصة للموافقة كالأولى.",
  add: "إضافة علامة تجارية",
  edit: "تعديل",
  branches: "{count} فروع",
  notActive: "العملاء يرون العلامات المفعّلة فقط. راجع مراجعة النشاط لمعرفة الحالة.",
  states: {
    errorTitle: "تعذّر تحميل علاماتك",
    errorBody: "تحقق من اتصالك ثم حاول مجددًا.",
    emptyTitle: "لا توجد علامات بعد",
    emptyBody: "أضف علامتك الأولى لتبدأ الموافقة.",
  },
  create: {
    title: "إضافة علامة تجارية",
    description: "تتم مراجعة العلامة قبل أن يراها العملاء.",
    nameEn: "اسم العلامة (الإنجليزية)",
    nameAr: "اسم العلامة (العربية)",
    currency: "العملة",
    currencyPlaceholder: "اختر عملة",
    branchHint: "تبدأ كل علامة بفرع واحد. يمكنك إضافة المزيد لاحقًا.",
    branchEn: "الفرع الأول (الإنجليزية)",
    branchAr: "الفرع الأول (العربية)",
    submit: "إضافة العلامة",
    generic: "تعذّرت إضافة العلامة.",
    validation: { name: "أدخل اسمًا لا يتجاوز 255 حرفًا.", currency: "اختر عملة.", branch: "أدخل اسمًا لا يتجاوز 120 حرفًا." },
  },
  toast: { created: "تمت إضافة العلامة وهي بانتظار الموافقة." },
};
