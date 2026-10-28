"use client";

import { ConfirmActionButton } from "@/components/people/confirm-action-button";
import { Badge } from "@/components/tailgrids/core/badge";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { useDictionary } from "@/hooks/use-dictionary";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import { notifySuccess } from "@/services/api/core/notifications";
import {
  applicationsQueryKey,
  getApplications,
  setApplicationStatus,
} from "@/services/api/dashboard/people/people.query";
import type { IApplication } from "@/services/api/dashboard/people/types/ipeople.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface IApplicationsPanelProps {
  branchId: string;
  postingId: string;
}

export function ApplicationsPanel({
  branchId,
  postingId,
}: IApplicationsPanelProps) {
  const dictionary = useDictionary();
  const copy = dictionary.people.jobs;
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const applications = useQuery({
    queryKey: applicationsQueryKey(postingId, page),
    queryFn: () => getApplications(branchId, postingId, page),
  });
  const decide = useMutation({
    mutationFn: (variables: { id: string; status: "accepted" | "rejected" }) =>
      setApplicationStatus(branchId, postingId, variables.id, variables.status),
    onSuccess: async () => {
      notifySuccess(copy.applicationUpdated);
      await queryClient.invalidateQueries({
        queryKey: ["dashboard", "job-postings"],
      });
    },
  });

  if (applications.isPending)
    return <p className="text-text-secondary">{dictionary.people.loading}</p>;
  if (applications.isError)
    return (
      <p role="alert">{apiErrorMessage(applications.error, dictionary)}</p>
    );

  return (
    <div className="space-y-3">
      {decide.isError ? (
        <p role="alert">{apiErrorMessage(decide.error, dictionary)}</p>
      ) : null}
      {applications.data.items.length === 0 ? (
        <p className="text-text-secondary">{copy.noApplicants}</p>
      ) : null}
      <ul className="space-y-3">
        {applications.data.items.map((application) => (
          <li key={application.id}>
            <ApplicantCard
              application={application}
              isPending={decide.isPending}
              onDecide={(status) =>
                decide.mutate({ id: application.id, status })
              }
            />
          </li>
        ))}
      </ul>
      <Pagination
        currentPage={applications.data.pagination.currentPage}
        totalPages={applications.data.pagination.totalPages}
        onPageChange={setPage}
        labels={dictionary.common.pagination}
      />
    </div>
  );
}

interface IApplicantCardProps {
  application: IApplication;
  isPending: boolean;
  onDecide: (status: "accepted" | "rejected") => void;
}

function ApplicantCard({
  application,
  isPending,
  onDecide,
}: IApplicantCardProps) {
  const copy = useDictionary().people.jobs;
  const decidable =
    application.status === "submitted" || application.status === "seen";

  return (
    <div className="space-y-2 rounded-lg border border-card-border p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <strong>{application.applicantName}</strong>
        <Badge>{copy.applicationStatuses[application.status]}</Badge>
      </div>
      {application.bio ? <p>{application.bio}</p> : null}
      <p className="text-text-secondary">
        {application.ratingAverage === null
          ? null
          : `${copy.rating}: ${application.ratingAverage} (${application.ratingCount}) · `}
        {application.portfolioCount} {copy.portfolioPhotos}
        {application.serviceNames.length === 0
          ? ""
          : ` · ${copy.services}: ${application.serviceNames.join(", ")}`}
      </p>
      {decidable ? (
        <div className="flex gap-2">
          <ConfirmActionButton
            label={copy.accept}
            title={copy.accept}
            body={copy.decisionBody}
            isPending={isPending}
            onConfirm={() => onDecide("accepted")}
          />
          <ConfirmActionButton
            danger
            label={copy.reject}
            title={copy.reject}
            body={copy.decisionBody}
            isPending={isPending}
            onConfirm={() => onDecide("rejected")}
          />
        </div>
      ) : null}
    </div>
  );
}
