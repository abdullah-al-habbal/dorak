export const enSubscription = {
  title: "Subscription",
  description: "The plan each of your brands is on, what it costs and which features it unlocks.",
  status: { pending: "Pending", active: "Active", past_due: "Past due", cancelled: "Cancelled" },
  price: "{price} / {interval}",
  interval: {
    every: { day: "day", week: "week", month: "month", year: "year" },
    everyMany: { day: "{count} days", week: "{count} weeks", month: "{count} months", year: "{count} years" },
  },
  dates: { starts: "Started", ends: "Renews or ends", cancelled: "Cancelled on", none: "-" },
  pastDue: "Payment is overdue. Features stay on until {date}.",
  pastDueNoGrace: "Payment is overdue. Settle it to keep your features.",
  features: { title: "Features", on: "Included", off: "Not included", labels: { multi_branch: "Multiple branches", job_board: "Job board" } },
  planFeatures: "Plan features: {features}",
  states: {
    emptyTitle: "No subscription yet",
    emptyBody: "None of your brands has a plan assigned. Contact the platform team to get started.",
    errorTitle: "Your subscription couldn't load",
    errorBody: "Check your connection and try again.",
    forbiddenTitle: "Subscriptions are for brand owners",
    forbiddenBody: "Your account has no access to subscription details. Ask the brand owner.",
  },
};
