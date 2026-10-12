"use client";

import { Card } from "@/components/tailgrids/core/card";
import { useSession } from "@/hooks/use-session";
import { useDictionary } from "@/hooks/use-dictionary";
import { apiErrorMessage } from "@/services/api/api-error-message.util";
import { Input } from "@/components/tailgrids/core/input";
import { Button } from "@/components/tailgrids/core/button";
import { getProfile } from "@/services/api/dashboard/profile.query";
import {
  requestEmailChange,
  updateProfile,
  verifyEmailChange,
} from "@/services/api/dashboard/profile.mutation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AccountDetails() {
  const session = useSession();
  const dictionary = useDictionary();
  const copy = dictionary.profile.account;
  const profile = useQuery({
    queryKey: ["dashboard", "profile"],
    queryFn: getProfile,
  });
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const router = useRouter();
  const current = profile.data;

  async function saveName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await updateProfile({
        displayName: displayName || current?.displayName || "",
      });
      await profile.refetch();
      toast.success(copy.details);
    } catch (error) {
      toast.error(apiErrorMessage(error, dictionary));
    }
  }
  async function beginEmailChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await requestEmailChange(email);
      await profile.refetch();
      toast.success(copy.email);
    } catch (error) {
      toast.error(apiErrorMessage(error, dictionary));
    }
  }
  async function confirmEmailChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await verifyEmailChange(code);
      setCode("");
      await profile.refetch();
      router.refresh();
      toast.success(copy.email);
    } catch (error) {
      toast.error(apiErrorMessage(error, dictionary));
    }
  }

  return (
    <Card className="bg-transparent p-5">
      <h2 className="text-xl leading-7 font-semibold text-text-primary">
        {copy.details}
      </h2>

      <form className="mt-6 grid gap-3" onSubmit={saveName}>
        <label className="grid gap-2 text-sm text-text-primary">
          {copy.fullName}
          <Input
            value={
              displayName || current?.displayName || session.displayName || ""
            }
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />
        </label>
        <Button type="submit">{copy.details}</Button>
      </form>
      <form className="mt-6 grid gap-3" onSubmit={beginEmailChange}>
        <label className="grid gap-2 text-sm text-text-primary">
          {copy.email}
          <Input
            type="email"
            value={email}
            placeholder={
              current?.email ?? session.email ?? copy.emailPlaceholder
            }
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <Button type="submit">{copy.email}</Button>
      </form>
      {current?.pendingEmail ? (
        <form className="mt-4 grid gap-3" onSubmit={confirmEmailChange}>
          <p className="text-sm text-text-secondary">{current.pendingEmail}</p>
          <Input
            value={code}
            inputMode="numeric"
            minLength={6}
            maxLength={6}
            onChange={(event) => setCode(event.target.value)}
            required
          />
          <Button type="submit">{copy.email}</Button>
        </form>
      ) : null}
    </Card>
  );
}
