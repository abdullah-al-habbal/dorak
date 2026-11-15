import type { Dictionary } from "@/types/core/shared/dictionary.type";

export const arSubscription: Dictionary["subscription"] = {
  title: "الاشتراك",
  description: "الخطة التي تعمل عليها كل علامة من علاماتك التجارية وتكلفتها والميزات التي تتيحها.",
  status: { pending: "قيد الانتظار", active: "نشط", past_due: "متأخر السداد", cancelled: "ملغى" },
  price: "{price} / {interval}",
  interval: {
    every: { day: "يوم", week: "أسبوع", month: "شهر", year: "سنة" },
    everyMany: { day: "{count} أيام", week: "{count} أسابيع", month: "{count} أشهر", year: "{count} سنوات" },
  },
  dates: { starts: "بدأ في", ends: "يتجدد أو ينتهي", cancelled: "أُلغي في", none: "-" },
  pastDue: "الدفع متأخر. تبقى الميزات مفعّلة حتى {date}.",
  pastDueNoGrace: "الدفع متأخر. سدّد المبلغ للحفاظ على ميزاتك.",
  features: { title: "الميزات", on: "مشمولة", off: "غير مشمولة", labels: { multi_branch: "فروع متعددة", job_board: "لوحة الوظائف" } },
  planFeatures: "ميزات الخطة: {features}",
  states: {
    emptyTitle: "لا يوجد اشتراك بعد",
    emptyBody: "لم تُسند خطة لأي من علاماتك التجارية. تواصل مع فريق المنصة للبدء.",
    errorTitle: "تعذّر تحميل اشتراكك",
    errorBody: "تحقق من اتصالك وحاول مرة أخرى.",
    forbiddenTitle: "الاشتراكات لأصحاب العلامات التجارية",
    forbiddenBody: "حسابك لا يملك صلاحية الوصول إلى تفاصيل الاشتراك. اسأل مالك العلامة.",
  },
};
