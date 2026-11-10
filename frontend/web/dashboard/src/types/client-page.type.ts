import type { AdminClient } from "@/types/admin-client.type";
import type { PageInfo } from "@/types/page-info.type";

export interface ClientPage {
  items: AdminClient[];
  page: PageInfo;
}
