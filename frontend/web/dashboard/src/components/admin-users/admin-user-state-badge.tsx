"use client";

import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { ADMIN_USER_STATE_STYLE } from "@/config/admin-user.constant";
import { AdminUserState } from "@/enums/admin-user-state.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";

export function AdminUserStateBadge({ active }: { active: boolean }): JSX.Element {
  const { adminUsers } = useDictionary();
  const state = active ? AdminUserState.Active : AdminUserState.Inactive;
  const { variant, icon: Icon } = ADMIN_USER_STATE_STYLE[state];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden />
      {adminUsers.state[state]}
    </Badge>
  );
}
