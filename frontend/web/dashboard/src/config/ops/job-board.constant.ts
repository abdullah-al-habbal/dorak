import { CheckCircle2Icon, CircleDotIcon, EyeIcon, InboxIcon, LockIcon, XCircleIcon } from "lucide-react";

import { ApplicationStatus } from "@/enums/booking/application-status.enum";
import { EmploymentType } from "@/enums/booking/employment-type.enum";
import { JobPostingStatus } from "@/enums/booking/job-posting-status.enum";
import type { BookingStatusStyle } from "@/interfaces/bookings/booking-status-style.interface";

export const JOB_TITLE_MAX = 120;
export const JOB_TEXT_MAX = 2000;
export const JOB_LOCATION_MAX = 120;
/** The select value for "no employment type" (the backend takes null). */
export const EMPLOYMENT_NONE = "";

export const EMPLOYMENT_TYPES: readonly EmploymentType[] = [EmploymentType.FullTime, EmploymentType.PartTime, EmploymentType.Contract];
export const POSTING_STATUSES: readonly JobPostingStatus[] = [JobPostingStatus.Open, JobPostingStatus.Closed, JobPostingStatus.Archived];

/** Status is always icon plus text, never colour alone. */
export const POSTING_STATUS_STYLE: Record<JobPostingStatus, BookingStatusStyle> = {
  [JobPostingStatus.Open]: { variant: "success", icon: CircleDotIcon },
  [JobPostingStatus.Closed]: { variant: "destructive", icon: LockIcon },
  [JobPostingStatus.Archived]: { variant: "outline", icon: LockIcon },
};

export const APPLICATION_STATUS_STYLE: Record<ApplicationStatus, BookingStatusStyle> = {
  [ApplicationStatus.Submitted]: { variant: "warning", icon: InboxIcon },
  [ApplicationStatus.Seen]: { variant: "info", icon: EyeIcon },
  [ApplicationStatus.Accepted]: { variant: "success", icon: CheckCircle2Icon },
  [ApplicationStatus.Rejected]: { variant: "destructive", icon: XCircleIcon },
};
