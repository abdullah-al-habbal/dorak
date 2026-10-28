"use client";

import { BranchPicker } from "@/components/branches/branch-picker";
import { ConfirmActionButton } from "@/components/people/confirm-action-button";
import { InviteAffiliationForm } from "@/components/people/invite-affiliation-form";
import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import { Pagination } from "@/components/tailgrids/core/pagination";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { useDictionary } from "@/hooks/use-dictionary";
import { useSelectedBranch } from "@/hooks/use-selected-branch";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import { notifySuccess } from "@/services/api/core/notifications";
import { AFFILIATION_STATUSES } from "@/services/api/dashboard/people/people.constant";
import {
  affiliationsQueryKey,
  getAffiliations,
  respondToAffiliation,
} from "@/services/api/dashboard/people/people.query";
import type { IAffiliation } from "@/services/api/dashboard/people/types/iaffiliation.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const ALL_STATUSES = "all";
type Action = "accept" | "reject" | "terminate";

export function AffiliationsPage() {
  const dictionary = useDictionary();
  const copy = dictionary.people.affiliations;
  const queryClient = useQueryClient();
  const { branches, branchId, selectBranch, isLoading } =
    useSelectedBranch("affiliations");
  const [status, setStatus] = useState(ALL_STATUSES);
  const [page, setPage] = useState(1);
  const statusFilter = status === ALL_STATUSES ? "" : status;
  const list = useQuery({
    enabled: branchId !== undefined,
    queryKey: affiliationsQueryKey(branchId ?? "", statusFilter, page),
    queryFn: () => getAffiliations(branchId ?? "", statusFilter, page),
  });
  const respond = useMutation({
    mutationFn: (variables: { id: string; action: Action }) =>
      respondToAffiliation(branchId ?? "", variables.id, variables.action),
    onSuccess: async () => {
      notifySuccess(copy.updated);
      // Accepting or terminating changes who staffs the branch's chairs.
      await Promise.all(
        ["affiliations", "stylists", "chairs"].map((resource) =>
          queryClient.invalidateQueries({ queryKey: ["dashboard", resource] }),
        ),
      );
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
            selectBranch(id);
          }}
        />
      )}
      {branchId ? <InviteAffiliationForm branchId={branchId} /> : null}
      <label className="grid max-w-xs gap-2 text-sm text-text-100">
        <span>{copy.statusFilter}</span>
        <Select
          value={status}
          onChange={(key) => {
            setStatus(String(key));
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue />
            <SelectIndicator />
          </SelectTrigger>
          <SelectContent>
            <SelectItem id={ALL_STATUSES}>{copy.allStatuses}</SelectItem>
            {AFFILIATION_STATUSES.map((value) => (
              <SelectItem id={value} key={value}>
                {copy.statuses[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      {list.isPending && branchId !== undefined ? (
        <p className="text-text-secondary">{dictionary.people.loading}</p>
      ) : null}
      {list.isError ? (
        <p role="alert">{apiErrorMessage(list.error, dictionary)}</p>
      ) : null}
      {respond.isError ? (
        <p role="alert">{apiErrorMessage(respond.error, dictionary)}</p>
      ) : null}
      {list.data?.items.length === 0 ? (
        <p className="text-text-secondary">{copy.empty}</p>
      ) : null}
      <ul className="space-y-3">
        {list.data?.items.map((affiliation) => (
          <li key={affiliation.id}>
            <AffiliationRow
              affiliation={affiliation}
              isPending={respond.isPending}
              onAction={(action) =>
                respond.mutate({ id: affiliation.id, action })
              }
            />
          </li>
        ))}
      </ul>
      {list.data ? (
        <Pagination
          currentPage={list.data.pagination.currentPage}
          totalPages={list.data.pagination.totalPages}
          onPageChange={setPage}
          labels={dictionary.common.pagination}
        />
      ) : null}
    </section>
  );
}

interface IAffiliationRowProps {
  affiliation: IAffiliation;
  isPending: boolean;
  onAction: (action: Action) => void;
}

function AffiliationRow({
  affiliation,
  isPending,
  onAction,
}: IAffiliationRowProps) {
  const copy = useDictionary().people.affiliations;
  // A shop cannot answer its own invite; only the barber's requests are decidable.
  const canDecide =
    affiliation.status === "pending" && !affiliation.initiatedByBranch;

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm">
        <div className="space-y-1">
          <strong>{affiliation.barberName ?? copy.unnamedBarber}</strong>
          <p className="text-text-secondary">
            {affiliation.initiatedByBranch
              ? copy.invitedByShop
              : copy.invitedByBarber}
            {affiliation.commissionRate === null
              ? ""
              : ` · ${copy.commission}: ${affiliation.commissionRate}%`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{copy.statuses[affiliation.status]}</Badge>
          {canDecide ? (
            <>
              <ConfirmActionButton
                label={copy.accept}
                title={copy.acceptTitle}
                body={copy.confirmBody}
                isPending={isPending}
                onConfirm={() => onAction("accept")}
              />
              <ConfirmActionButton
                danger
                label={copy.reject}
                title={copy.rejectTitle}
                body={copy.confirmBody}
                isPending={isPending}
                onConfirm={() => onAction("reject")}
              />
            </>
          ) : null}
          {affiliation.status === "active" ? (
            <ConfirmActionButton
              danger
              label={copy.terminate}
              title={copy.terminateTitle}
              body={copy.terminateBody}
              isPending={isPending}
              onConfirm={() => onAction("terminate")}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
