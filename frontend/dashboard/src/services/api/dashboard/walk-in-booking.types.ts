export interface WalkInBookingInput {
  branchId: string;
  chairId: string;
  barberId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | undefined;
  serviceIds: string[];
  timeSlot: string;
}
