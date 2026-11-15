import type { AdminClient } from "@/types/clients/admin-client.type";
import type { PageInfo } from "@/types/core/page-info.type";

export interface ClientPage {
  items: AdminClient[];
  page: PageInfo;
}
