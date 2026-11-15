"use client";

import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { APPLICATION_STATUS_STYLE, POSTING_STATUS_STYLE } from "@/config/job-board.constant";
import { ApplicationStatus } from "@/enums/application-status.enum";
import { JobPostingStatus } from "@/enums/job-posting-status.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";

export function PostingStatusBadge({ status }: { status: string }): JSX.Element {
  const { jobs } = useDictionary();
  const known = Object.values(JobPostingStatus).find((value) => value === status) ?? JobPostingStatus.Closed;
  const { variant, icon: Icon } = POSTING_STATUS_STYLE[known];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {jobs.postingStatus[known]}
    </Badge>
  );
}

export function ApplicationStatusBadge({ status }: { status: string }): JSX.Element {
  const { jobs } = useDictionary();
  const known = Object.values(ApplicationStatus).find((value) => value === status) ?? ApplicationStatus.Submitted;
  const { variant, icon: Icon } = APPLICATION_STATUS_STYLE[known];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {jobs.applicationStatus[known]}
    </Badge>
  );
}
