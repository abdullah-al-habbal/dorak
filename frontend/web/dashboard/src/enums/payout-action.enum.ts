/** The admin transitions of a payout; the values are the backend path segments (`PATCH /admin/payouts/{id}/{action}`). */
export enum PayoutAction {
  Approve = "approve",
  MarkPaid = "mark-paid",
  Cancel = "cancel",
}
