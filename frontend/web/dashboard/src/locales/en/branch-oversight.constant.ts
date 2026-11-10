export const enBranchOversight = {
  description: "A read-only view of this branch for support. Chairs, stylists and services are under their own menu entries, with a branch filter.",
  none: "-",
  loadFailed: "This couldn't load.",
  close: "Close",
  edit: "Edit branch",
  reviews: { title: "Reviews", none: "No reviews yet.", summary: "{average} average from {count} reviews" },
  hours: { title: "Opening hours", closed: "Closed", notConfigured: "No hours are saved for this branch." },
  invitations: { title: "Barber invitations", empty: "No invitations." },
  jobs: { title: "Job postings", empty: "No job postings.", applications: "{count} applications" },
  states: { pending: "Pending", active: "Active", rejected: "Rejected", terminated: "Ended", open: "Open", closed: "Closed", draft: "Draft", filled: "Filled" },
} as const;
