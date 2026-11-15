import type { Dictionary } from "@/types/core/shared/dictionary.type";

export const arPayouts: Dictionary["payouts"] = {
  title: "المدفوعات",
  description: "التسويات بين علاماتك التجارية والمنصة. المسودات داخلية ولا تظهر هنا.",
  columns: { period: "الفترة", brand: "العلامة", direction: "الاتجاه", amount: "المبلغ", status: "الحالة", paid: "تاريخ الدفع" },
  status: { draft: "مسودة", approved: "معتمد", paid: "مدفوع", cancelled: "ملغى" },
  direction: { brand_to_platform: "تدفع للمنصة", platform_to_brand: "المنصة تدفع لك" },
  periodRange: "{from} إلى {to}",
  reference: "المرجع {reference}",
  notPaid: "-",
  filters: { toolbar: "تصفية المدفوعات", status: "الحالة", allStatuses: "كل الحالات", clear: "مسح التصفية" },
  states: {
    emptyTitle: "لا توجد مدفوعات بعد",
    emptyBody: "ستظهر هنا التسويات المعتمدة والمدفوعة لعلاماتك التجارية.",
    filteredTitle: "لا توجد مدفوعات بهذه الحالة",
    filteredBody: "جرّب حالة أخرى أو امسح التصفية.",
    errorTitle: "تعذّر تحميل المدفوعات",
    errorBody: "تحقق من اتصالك وحاول مرة أخرى.",
    forbiddenTitle: "المدفوعات غير متاحة لدورك",
    forbiddenBody: "حسابك لا يملك صلاحية الوصول إلى المدفوعات. اطلب من مالك العلامة إن احتجت إلى تسوية.",
    results: "{count} دفعات",
  },
};
