/** The admin moves that need a reason (`PATCH /admin/brands/{id}/{action}`). */
export enum BrandLifecycleAction {
  Reject = "reject",
  Suspend = "suspend",
  Reactivate = "reactivate",
}
