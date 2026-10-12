import { WalkInBookingForm } from "@/components/bookings/walk-in-booking-form";
import { WalkInBookingHeading } from "@/components/bookings/walk-in-booking-heading";
export default function Page() {
  return (
    <section className="space-y-6">
      <WalkInBookingHeading />
      <WalkInBookingForm />
    </section>
  );
}
