"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { apiErrorMessage } from "@/services/api/api-error-message.util";
import type { IUpdatePasswordInput } from "@/services/api/dashboard/iupdate-password-input.types";
import { updatePassword } from "@/services/api/dashboard/profile.mutation";
import { createUpdatePasswordFormSchema } from "@/services/api/dashboard/update-password-form.schema";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function SecuritySettings() {
  const dictionary = useDictionary();
  const copy = dictionary.profile.security;
  const form = useForm<IUpdatePasswordInput>({
    resolver: zodResolver(
      createUpdatePasswordFormSchema(dictionary.validation),
    ),
    defaultValues: {
      currentPassword: "",
      password: "",
      passwordConfirmation: "",
    },
  });
  const save = useDashboardMutation("profile", (value: IUpdatePasswordInput) =>
    updatePassword(value),
  );

  return (
    <Card className="bg-transparent p-5">
      <h2 className="text-xl font-semibold text-text-primary">
        {copy.updatePassword}
      </h2>
      <form
        className="mt-6 grid gap-4"
        onSubmit={form.handleSubmit((value) =>
          save.mutate(value, {
            onSuccess: () => {
              form.reset();
              toast.success(copy.updatePassword);
            },
            onError: (error) => toast.error(apiErrorMessage(error, dictionary)),
          }),
        )}
      >
        <label className="grid gap-2 text-sm text-text-primary">
          {copy.currentPassword}
          <Input
            type="password"
            {...form.register("currentPassword")}
            state={form.formState.errors.currentPassword ? "error" : "default"}
          />
        </label>
        <label className="grid gap-2 text-sm text-text-primary">
          {copy.newPassword}
          <Input
            type="password"
            {...form.register("password")}
            state={form.formState.errors.password ? "error" : "default"}
          />
        </label>
        <label className="grid gap-2 text-sm text-text-primary">
          {copy.confirmPassword}
          <Input
            type="password"
            {...form.register("passwordConfirmation")}
            state={
              form.formState.errors.passwordConfirmation ? "error" : "default"
            }
          />
        </label>
        {form.formState.isSubmitted &&
        Object.keys(form.formState.errors).length > 0 ? (
          <p className="text-input-error-focus-border" role="alert">
            {form.formState.errors.passwordConfirmation?.message ??
              dictionary.validation.invalidField}
          </p>
        ) : null}
        <Button type="submit" isDisabled={save.isPending}>
          {copy.updatePassword}
        </Button>
      </form>
    </Card>
  );
}
