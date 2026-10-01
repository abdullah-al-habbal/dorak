import { BookingShowPage } from '@/features/bookings/components/cards/booking-show-page';
export default async function Page({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  return <BookingShowPage id={(await params).id} />;
}
