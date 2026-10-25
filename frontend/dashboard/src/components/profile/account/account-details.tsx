"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/tailgrids/core/card";
import { useSession } from "@/hooks/use-session";
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import { Input } from "@/components/tailgrids/core/input";
import { Button } from "@/components/tailgrids/core/button";
import {
  requestEmailChangeSchema,
  updateDisplayNameSchema,
  verifyEmailChangeSchema,
} from "@/services/api/dashboard/profile/schemas/account-details.schema";
import { getProfile } from "@/services/api/dashboard/profile/profile.query";
import {
  requestEmailChange,
  updateProfile,
  verifyEmailChange,
} from "@/services/api/dashboard/profile/profile.mutation";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { z } from "zod";

export function AccountDetails() {
  const session = useSession();
  const dictionary = useDictionary();
  const copy = dictionary.profile.account;
  const router = useRouter();
  const profile = useQuery({
    queryKey: ["dashboard", "profile"],
    queryFn: getProfile,
  });
  const current = profile.data;

  const nameForm = useForm<z.infer<typeof updateDisplayNameSchema>>({
    resolver: zodResolver(updateDisplayNameSchema),
    defaultValues: { displayName: session.displayName ?? "" },
  });
  useEffect(() => {
    if (current) nameForm.reset({ displayName: current.displayName ?? "" });
  }, [current, nameForm]);
  const saveName = useDashboardMutation(
    "profile",
    (value: z.infer<typeof updateDisplayNameSchema>) =>
      updateProfile({ displayName: value.displayName }),
  );

  const emailForm = useForm<z.infer<typeof requestEmailChangeSchema>>({
    resolver: zodResolver(requestEmailChangeSchema),
    defaultValues: { email: "" },
  });
  const beginEmailChange = useDashboardMutation(
    "profile",
    (value: z.infer<typeof requestEmailChangeSchema>) =>
      requestEmailChange(value.email),
  );

  const codeForm = useForm<z.infer<typeof verifyEmailChangeSchema>>({
    resolver: zodResolver(verifyEmailChangeSchema),
    defaultValues: { code: "" },
  });
  const confirmEmailChange = useDashboardMutation(
    "profile",
    (value: z.infer<typeof verifyEmailChangeSchema>) =>
      verifyEmailChange(value.code),
  );

  const failed = (error: unknown) =>
    toast.error(apiErrorMessage(error, dictionary));

  return (
    <Card className="bg-transparent p-5">
      <h2 className="text-xl leading-7 font-semibold text-text-primary">
        {copy.details}
      </h2>

      <form
        className="mt-6 grid gap-3"
        onSubmit={nameForm.handleSubmit((value) =>
          saveName.mutate(value, {
            onSuccess: () => toast.success(copy.details),
            onError: failed,
          }),
        )}
      >
        <label className="grid gap-2 text-sm text-text-primary">
          {copy.fullName}
          <Input
            {...nameForm.register("displayName")}
            state={nameForm.formState.errors.displayName ? "error" : "default"}
          />
        </label>
        <Button type="submit" isDisabled={saveName.isPending}>
          {copy.details}
        </Button>
      </form>
      <form
        className="mt-6 grid gap-3"
        onSubmit={emailForm.handleSubmit((value) =>
          beginEmailChange.mutate(value, {
            onSuccess: () => toast.success(copy.email),
            onError: failed,
          }),
        )}
      >
        <label className="grid gap-2 text-sm text-text-primary">
          {copy.email}
          <Input
            type="email"
            placeholder={
              current?.email ?? session.email ?? copy.emailPlaceholder
            }
            {...emailForm.register("email")}
            state={emailForm.formState.errors.email ? "error" : "default"}
          />
        </label>
        <Button type="submit" isDisabled={beginEmailChange.isPending}>
          {copy.email}
        </Button>
      </form>
      {current?.pendingEmail ? (
        <form
          className="mt-4 grid gap-3"
          onSubmit={codeForm.handleSubmit((value) =>
            confirmEmailChange.mutate(value, {
              onSuccess: () => {
                codeForm.reset();
                router.refresh();
                toast.success(copy.email);
              },
              onError: failed,
            }),
          )}
        >
          <p className="text-sm text-text-secondary">{current.pendingEmail}</p>
          <Input
            inputMode="numeric"
            {...codeForm.register("code")}
            state={codeForm.formState.errors.code ? "error" : "default"}
          />
          <Button type="submit" isDisabled={confirmEmailChange.isPending}>
            {copy.email}
          </Button>
        </form>
      ) : null}
    </Card>
  );
}
