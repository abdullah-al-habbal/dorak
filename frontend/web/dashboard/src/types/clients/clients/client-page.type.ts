import type { AdminClient } from "@/types/clients/clients/admin-client.type";
import type { PageInfo } from "@/types/core/shared/page-info.type";

export interface ClientPage {
  items: AdminClient[];
  page: PageInfo;
}
