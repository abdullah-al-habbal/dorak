import type { Dictionary } from "@/types/dictionary.type";

export const arReviews: Dictionary["reviews"] = {
  title: "التقييمات",
  description: "ما يقوله العملاء عن فرعك. تُحتسب في التقييم المنشورة والمحسومة فقط.",
  branch: "الفرع",
  anonymous: "عميل",
  rating: "{rating} من {max}",
  status: { published: "منشور", disputed: "معترض عليه", resolved: "تم الحسم", hidden: "مخفي" },
  summary: {
    title: "ملخص التقييم",
    average: "متوسط التقييم",
    none: "-",
    count: "{count} تقييمات",
    distribution: "التقييمات حسب الدرجة",
    stars: "{rating} نجوم",
  },
  states: {
    emptyTitle: "لا توجد تقييمات بعد",
    emptyBody: "تظهر التقييمات هنا بعد أن يقيّم العملاء حجزاً مكتملاً.",
    errorTitle: "تعذّر تحميل التقييمات",
    errorBody: "تحقق من اتصالك ثم حاول مرة أخرى.",
    noBranchTitle: "لا يوجد فرع للعرض",
    noBranchBody: "تظهر التقييمات عندما يصبح لحسابك فرع.",
    forbiddenTitle: "التقييمات غير متاحة لدورك",
    forbiddenBody: "تقييمات الفروع لفرق الفروع والعلامات التجارية.",
    results: "{count} تقييمات",
  },
};
