export type WalkInBookingPayloadWire = {
  readonly barber_id?: string;
  readonly branch_id: string;
  readonly chair_id: string;
  readonly customer_email: string;
  readonly customer_name: string;
  readonly customer_phone?: string;
  readonly service_ids: string[];
  readonly time_slot: string;
};
