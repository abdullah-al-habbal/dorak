import { CLIENT_RELATION_PER_PAGE } from "@/config/client.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { ClientRelation } from "@/enums/client-relation.enum";
import { adminClientSchema, clientBookingListSchema, clientReviewListSchema } from "@/schemas/admin-client.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminClient } from "@/types/clients/admin-client.type";
import type { ClientBooking } from "@/types/bookings/client-booking.type";
import type { ClientReview } from "@/types/clients/client-review.type";

function clientPath(id: string): string {
  return `${DASHBOARD_API}/admin/clients/${encodeURIComponent(id)}`;
}

/** The detail read adds the ban history that the list leaves out. */
export function fetchClient(id: string): Promise<AdminClient> {
  return apiRequest(clientPath(id), { schema: adminClientSchema });
}

export function fetchClientBookings(id: string): Promise<ClientBooking[]> {
  return apiRequest(`${clientPath(id)}/${ClientRelation.Bookings}?per_page=${CLIENT_RELATION_PER_PAGE}`, { schema: clientBookingListSchema });
}

export function fetchClientReviews(id: string): Promise<ClientReview[]> {
  return apiRequest(`${clientPath(id)}/${ClientRelation.Reviews}?per_page=${CLIENT_RELATION_PER_PAGE}`, { schema: clientReviewListSchema });
}
