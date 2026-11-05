"use client";

import { BranchPicker } from "@/components/branches/branch-picker";
import { ApplicationsPanel } from "@/components/people/applications-panel";
import { ConfirmActionButton } from "@/components/people/confirm-action-button";
import { JobPostingForm } from "@/components/people/job-posting-form";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";
import { useDictionary } from "@/hooks/use-dictionary";
import { useSelectedBranch } from "@/hooks/use-selected-branch";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import { notifySuccess } from "@/services/api/core/notifications";
import {
  deleteJobPosting,
  getJobPostings,
  jobPostingsQueryKey,
} from "@/services/api/dashboard/people/people.query";
import type { IJobPosting } from "@/services/api/dashboard/people/types/ijob-posting.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function JobPostingsPage() {
  const dictionary = useDictionary();
  const copy = dictionary.people.jobs;
  const queryClient = useQueryClient();
  const { branches, branchId, selectBranch, isLoading } =
    useSelectedBranch("job-postings");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<IJobPosting | null>(null);
  const [openApplicants, setOpenApplicants] = useState<string | null>(null);
  const postings = useQuery({
    enabled: branchId !== undefined,
    queryKey: jobPostingsQueryKey(branchId ?? "", page),
    queryFn: () => getJobPostings(branchId ?? "", page),
  });
  const remove = useMutation({
    mutationFn: (postingId: string) =>
      deleteJobPosting(branchId ?? "", postingId),
    onSuccess: async () => {
      notifySuccess(copy.deleted);
      await queryClient.invalidateQueries({
        queryKey: ["dashboard", "job-postings"],
      });
    },
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-title-50">{copy.title}</h1>
      {!isLoading && branches.length === 0 ? (
        <p className="text-text-secondary">{dictionary.people.noBranches}</p>
      ) : (
        <BranchPicker
          label={dictionary.people.branch}
          branches={branches}
          value={branchId}
          onChange={(id) => {
            setPage(1);
            setEditing(null);
            setOpenApplicants(null);
            selectBranch(id);
          }}
        />
      )}
      {branchId ? (
        <Card>
          <CardContent className="space-y-3 pt-4">
            <h2 className="text-lg font-semibold text-title-50">
              {editing ? copy.editTitle : copy.create}
            </h2>
            <JobPostingForm
              key={editing?.id ?? "new"}
              branchId={branchId}
              posting={editing ?? undefined}
              onDone={() => setEditing(null)}
            />
          </CardContent>
        </Card>
      ) : null}
      {postings.isPending && branchId !== undefined ? (
        <p className="text-text-secondary">{dictionary.people.loading}</p>
      ) : null}
      {postings.isError ? (
        <p role="alert">{apiErrorMessage(postings.error, dictionary)}</p>
      ) : null}
      {remove.isError ? (
        <p role="alert">{apiErrorMessage(remove.error, dictionary)}</p>
      ) : null}
      {postings.data?.items.length === 0 ? (
        <p className="text-text-secondary">{copy.empty}</p>
      ) : null}
      <ul className="space-y-3">
        {postings.data?.items.map((posting) => (
          <li key={posting.id}>
            <Card>
              <CardContent className="space-y-3 pt-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <strong>{posting.title.en || posting.title.ar}</strong>
                    <p className="text-text-secondary">
                      {posting.applicationsCount} {copy.applicantsCount}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{copy.statuses[posting.status]}</Badge>
                    <Button
                      size="sm"
                      appearance="outline"
                      onPress={() =>
                        setOpenApplicants(
                          openApplicants === posting.id ? null : posting.id,
                        )
                      }
                    >
                      {openApplicants === posting.id
                        ? copy.hideApplicants
                        : copy.applicants}
                    </Button>
                    <Button
                      size="sm"
                      appearance="outline"
                      onPress={() => setEditing(posting)}
                    >
                      {copy.edit}
                    </Button>
                    <ConfirmActionButton
                      danger
                      label={copy.delete}
                      title={copy.deleteTitle}
                      body={copy.deleteBody}
                      isPending={remove.isPending}
                      onConfirm={() => remove.mutate(posting.id)}
                    />
                  </div>
                </div>
                {openApplicants === posting.id && branchId ? (
                  <ApplicationsPanel
                    branchId={branchId}
                    postingId={posting.id}
                  />
                ) : null}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      {postings.data ? (
        <Pagination
          currentPage={postings.data.pagination.currentPage}
          totalPages={postings.data.pagination.totalPages}
          onPageChange={setPage}
          labels={dictionary.common.pagination}
        />
      ) : null}
    </section>
  );
}
