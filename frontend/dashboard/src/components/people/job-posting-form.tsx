"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { useDictionary } from "@/hooks/use-dictionary";
import { ApiClientError } from "@/services/api/core/client-error";
import {
  notifyApiError,
  notifySuccess,
} from "@/services/api/core/notifications";
import { JOB_POSTING_STATUSES } from "@/services/api/dashboard/people/people.constant";
import {
  createJobPosting,
  updateJobPosting,
} from "@/services/api/dashboard/people/people.query";
import { jobPostingFormSchema } from "@/services/api/dashboard/people/schemas/people.schema";
import type {
  IJobPosting,
  IJobPostingForm,
  IJobPostingFormInput,
} from "@/services/api/dashboard/people/types/ipeople.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

interface IJobPostingFormProps {
  branchId: string;
  /** When set, the form edits this posting instead of creating one. */
  posting?: IJobPosting;
  onDone: () => void;
}

const SERVER_FIELD_MAP: Record<string, keyof IJobPostingFormInput> = {
  "title.en": "titleEn",
  "title.ar": "titleAr",
  "description.en": "descriptionEn",
  "description.ar": "descriptionAr",
  location: "location",
  type: "type",
  status: "status",
};

function defaultsFor(posting?: IJobPosting): IJobPostingFormInput {
  return {
    titleEn: posting?.title.en ?? "",
    titleAr: posting?.title.ar ?? "",
    descriptionEn: posting?.description.en ?? "",
    descriptionAr: posting?.description.ar ?? "",
    location: posting?.location ?? "",
    type: posting?.type ?? "",
    status: posting?.status ?? "open",
  };
}

export function JobPostingForm({
  branchId,
  posting,
  onDone,
}: IJobPostingFormProps) {
  const dictionary = useDictionary();
  const copy = dictionary.people.jobs;
  const queryClient = useQueryClient();
  const form = useForm<IJobPostingFormInput, unknown, IJobPostingForm>({
    resolver: zodResolver(jobPostingFormSchema),
    defaultValues: defaultsFor(posting),
  });
  const { errors } = form.formState;

  const save = useMutation({
    mutationFn: (value: IJobPostingForm) =>
      posting
        ? updateJobPosting(branchId, posting.id, value)
        : createJobPosting(branchId, value),
    onSuccess: async () => {
      notifySuccess(posting ? copy.saved : copy.created);
      await queryClient.invalidateQueries({
        queryKey: ["dashboard", "job-postings"],
      });
      form.reset(defaultsFor());
      onDone();
    },
    onError: (error) => {
      if (error instanceof ApiClientError && error.status === 422) {
        Object.entries(error.errors ?? {}).forEach(([key, messages]) => {
          const field = SERVER_FIELD_MAP[key];
          if (field)
            form.setError(field, { type: "server", message: messages[0] });
        });
        return;
      }
      notifyApiError(error, dictionary);
    },
  });

  const text = (
    name: "titleEn" | "titleAr" | "location" | "type",
    label: string,
  ) => (
    <label className="grid gap-1 text-sm text-text-100">
      <span>{label}</span>
      <Input
        state={errors[name] ? "error" : "default"}
        {...form.register(name)}
      />
      {errors[name]?.type === "server" ? (
        <span className="text-input-error-focus-border" role="alert">
          {errors[name]?.message}
        </span>
      ) : null}
    </label>
  );
  const area = (name: "descriptionEn" | "descriptionAr", label: string) => (
    <label className="grid gap-1 text-sm text-text-100">
      <span>{label}</span>
      <TextArea {...form.register(name)} />
      {errors[name]?.type === "server" ? (
        <span className="text-input-error-focus-border" role="alert">
          {errors[name]?.message}
        </span>
      ) : null}
    </label>
  );

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={form.handleSubmit((value) => save.mutate(value))}
    >
      {text("titleEn", copy.titleEn)}
      {text("titleAr", copy.titleAr)}
      {area("descriptionEn", copy.descriptionEn)}
      {area("descriptionAr", copy.descriptionAr)}
      {text("location", copy.location)}
      {text("type", copy.type)}
      {posting ? (
        <label className="grid gap-1 text-sm text-text-100">
          <span>{copy.status}</span>
          <select
            className="rounded-lg border border-card-border bg-input-background px-4 py-2.5"
            {...form.register("status")}
          >
            {JOB_POSTING_STATUSES.map((value) => (
              <option key={value} value={value}>
                {copy.statuses[value]}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" isDisabled={save.isPending}>
          {copy.save}
        </Button>
        {posting ? (
          <Button type="button" appearance="outline" onPress={onDone}>
            {copy.cancelEdit}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
