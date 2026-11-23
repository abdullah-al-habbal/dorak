"use client";

import type { JSX } from "react";

import { StatusBadge } from "@/components/common/status-badge";
import { APPLICATION_STATUS_STYLE, POSTING_STATUS_STYLE } from "@/config/ops/job-board.constant";
import { useDictionary } from "@/hooks/core/state/use-dictionary";

export function PostingStatusBadge({ status }: { status: string }): JSX.Element {
  const { jobs } = useDictionary();
  return <StatusBadge status={status} styles={POSTING_STATUS_STYLE} labels={jobs.postingStatus} scope="job-posting" />;
}

export function ApplicationStatusBadge({ status }: { status: string }): JSX.Element {
  const { jobs } = useDictionary();
  return <StatusBadge status={status} styles={APPLICATION_STATUS_STYLE} labels={jobs.applicationStatus} scope="job-application" />;
}
