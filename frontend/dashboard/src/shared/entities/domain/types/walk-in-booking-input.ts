export interface WalkInBookingInput {
  readonly barberId: string | null | undefined;
  readonly branchId: string;
  readonly chairId: string;
  readonly customerEmail: string;
  readonly customerName: string;
  readonly customerPhone: string | undefined;
  readonly serviceIds: string[];
  readonly timeSlot: string;
}
