/** The words of a ban dialog; a client and a barber each bring their own. */
export interface BanDialogCopy {
  title: string;
  body: string;
  reason: string;
  reasonHint: string;
  reasonRequired: string;
  endsAt: string;
  endsAtHint: string;
  endInPast: string;
  confirm: string;
  failed: string;
}
