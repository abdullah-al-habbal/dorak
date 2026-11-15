import type { Dictionary } from "@/types/core/shared/dictionary.type";

export const arNotificationsPage: Dictionary["notificationsPage"] = {
  description: "كل تحديثات الحجوزات وتنبيهات التقييمات وإشعارات المنصة المرسلة إلى حسابك، الأحدث أولًا.",
  toolbar: "تصفية الإشعارات",
  all: "الكل",
  unreadOnly: "غير المقروءة ({count})",
  results: "{count} إشعارًا",
  errorTitle: "تعذّر تحميل الإشعارات",
  filteredTitle: "لا توجد إشعارات غير مقروءة",
  filteredBody: "لقد قرأت كل شيء. اعرض كل الإشعارات لرؤية السابقة.",
} as const;
