import type { CLIENT_STATUS_FILTER_ALL } from "@/config/venue/client.constant";
import type { ClientBanFilter } from "@/enums/people/client-ban-filter.enum";
import type { ClientStatus } from "@/enums/people/client-status.enum";

export interface ClientFilters {
  status: ClientStatus | typeof CLIENT_STATUS_FILTER_ALL;
  banned: ClientBanFilter;
  search?: string;
  page: number;
}
