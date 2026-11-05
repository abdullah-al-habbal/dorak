import { createStatusPage } from "@/components/status/create-status-page";

export default createStatusPage(
  (dictionary) => dictionary.common.status.loading,
);
