import { BookingStatus } from "@/enums/booking-status.enum";

/** The backend lets the shop rate the client of a completed or no-show booking only. */
export const RATABLE_STATUSES: readonly BookingStatus[] = [BookingStatus.Completed, BookingStatus.NoShow];
export const CLIENT_RATING_MIN = 1;
export const CLIENT_RATING_MAX = 5;
export const CLIENT_RATING_BODY_MAX = 1000;
