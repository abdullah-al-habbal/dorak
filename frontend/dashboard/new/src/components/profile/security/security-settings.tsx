"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import { useDictionary } from "@/hooks/use-dictionary";
import { updatePassword } from "@/services/api/dashboard/profile.mutation";
import { toast } from "sonner";
import { useState } from "react";

export function SecuritySettings() {
  const copy = useDictionary().profile.security;
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) return toast.error(copy.confirmPassword);
    setSaving(true);
    try {
      await updatePassword({ currentPassword, password, passwordConfirmation: confirmation });
      setCurrentPassword(""); setPassword(""); setConfirmation("");
      toast.success(copy.updatePassword);
    } catch (error) { toast.error(error instanceof Error ? error.message : copy.updatePassword); } finally { setSaving(false); }
  }

  return <Card className="bg-transparent p-5"><h2 className="text-xl font-semibold text-text-primary">{copy.updatePassword}</h2><form className="mt-6 grid gap-4" onSubmit={submit}>
    <label className="grid gap-2 text-sm text-text-primary">{copy.currentPassword}<Input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
    <label className="grid gap-2 text-sm text-text-primary">{copy.newPassword}<Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={12} required /></label>
    <label className="grid gap-2 text-sm text-text-primary">{copy.confirmPassword}<Input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={12} required /></label>
    <Button type="submit" isDisabled={saving}>{copy.updatePassword}</Button>
  </form></Card>;
}
