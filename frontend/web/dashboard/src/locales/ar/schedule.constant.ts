import type { Dictionary } from "@/types/dictionary.type";

export const arSchedule: Dictionary["schedule"] = {
  title: "الجدول",
  description: "مواعيدك وساعات عملك الأسبوعية. تُعدَّل الساعات من تطبيق الحلاق.",
  unknownClient: "عميل",
  columns: { time: "الوقت", client: "العميل", service: "الخدمة", chair: "الكرسي", status: "الحالة", price: "السعر" },
  range: { today: "اليوم", week: "هذا الأسبوع", upcoming: "القادمة" },
  filters: { toolbar: "عوامل تصفية الجدول", range: "النطاق الزمني", status: "الحالة", allStatuses: "كل الحالات", clear: "مسح التصفية" },
  appointments: { title: "المواعيد" },
  hours: {
    title: "الساعات الأسبوعية",
    description: "الأوقات التي تستقبل فيها الحجوزات.",
    today: "اليوم",
    dayOff: "يوم إجازة",
    range: "من {start} إلى {end}",
    errorTitle: "تعذّر تحميل ساعات عملك",
    errorBody: "تحقق من اتصالك ثم حاول مرة أخرى.",
  },
  states: {
    emptyTitle: "لا مواعيد بعد",
    emptyBody: "تظهر هنا الحجوزات القادمة المسندة إليك.",
    filteredTitle: "لا مواعيد تطابق هذه التصفية",
    filteredBody: "جرّب نطاقًا أو حالة أخرى، أو امسح التصفية.",
    errorTitle: "تعذّر تحميل جدولك",
    errorBody: "تحقق من اتصالك ثم حاول مرة أخرى.",
    forbiddenTitle: "الجدول مخصص للحلاقين",
    forbiddenBody: "يدير فريق الفرع والعلامة الحجوزات من صفحة الحجوزات.",
    results: "{count} موعد",
  },
};
