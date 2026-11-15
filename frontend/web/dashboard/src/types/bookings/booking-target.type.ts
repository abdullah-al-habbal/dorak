import type { BookingStatus } from "@/enums/booking-status.enum";

/** A status a booking can be moved to. `pending` is only ever an initial state. */
export type BookingTarget = Exclude<BookingStatus, BookingStatus.Pending>;
