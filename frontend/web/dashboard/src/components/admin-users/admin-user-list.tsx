"use client";

import { MailIcon, PencilIcon, PowerIcon } from "lucide-react";
import { useMemo } from "react";
import type { JSX } from "react";

import { AdminUserStateBadge } from "@/components/admin-users/admin-user-state-badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table/data-table";
import { useI18n } from "@/hooks/use-i18n";
import type { DataTableColumn } from "@/interfaces/ui/data-table-column.interface";
import { localizedText } from "@/lib/booking-format.util";
import type { AdminUser } from "@/types/platform/admin-user.type";

interface AdminUserListProps {
  admins: readonly AdminUser[];
  /** The signed-in admin's email: the account page carries no id, and a row cannot deactivate its own account. */
  currentEmail?: string;
  onEdit: (admin: AdminUser) => void;
  onToggleActive: (admin: AdminUser) => void;
  onResendInvite: (admin: AdminUser) => void;
}

function isCurrent(admin: AdminUser, email: string | undefined): boolean {
  return email !== undefined && admin.email.toLowerCase() === email.toLowerCase();
}

function getAdminId(admin: AdminUser): string {
  return admin.id;
}

export function AdminUserList({ admins, currentEmail, onEdit, onToggleActive, onResendInvite }: AdminUserListProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { adminUsers: t } = dictionary;
  const rowLabel = (admin: AdminUser) => t.rowLabel.replace("{admin}", localizedText(admin.name, locale) || admin.email);

  const columns = useMemo<DataTableColumn<AdminUser>[]>(() => {
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
    return [
      {
        id: "admin",
        header: t.columns.admin,
        primary: true,
        cell: (admin) => (
          <span dir="auto" className="truncate font-medium">
            {localizedText(admin.name, locale) || t.none}
            {isCurrent(admin, currentEmail) ? <span className="ms-2 text-xs font-normal text-muted-foreground">{t.you}</span> : null}
          </span>
        ),
      },
      { id: "email", header: t.columns.email, cell: (admin) => <span dir="ltr" translate="no" className="truncate text-muted-foreground">{admin.email}</span> },
      { id: "state", header: t.columns.state, cell: (admin) => <AdminUserStateBadge active={admin.is_active} /> },
      { id: "created", header: t.columns.created, cell: (admin) => <span className="tabular text-sm text-muted-foreground">{date.format(new Date(admin.created_at))}</span> },
      {
        id: "actions",
        header: t.columns.actions,
        interactive: true,
        align: "end",
        cell: (admin) => {
          const name = localizedText(admin.name, locale) || admin.email;
          const own = isCurrent(admin, currentEmail);
          return (
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" aria-label={t.rowEdit.replace("{admin}", name)} onClick={() => onEdit(admin)}>
                <PencilIcon aria-hidden data-icon="inline-start" />
                {t.edit}
              </Button>
              {admin.is_active ? (
                <Button size="sm" variant="ghost" aria-label={t.rowResend.replace("{admin}", name)} onClick={() => onResendInvite(admin)}>
                  <MailIcon aria-hidden data-icon="inline-start" />
                  {t.resend}
                </Button>
              ) : null}
              {own && admin.is_active ? null : (
                <Button size="sm" variant={admin.is_active ? "ghost" : "outline"} aria-label={(admin.is_active ? t.rowDeactivate : t.rowReactivate).replace("{admin}", name)} onClick={() => onToggleActive(admin)}>
                  <PowerIcon aria-hidden data-icon="inline-start" />
                  {admin.is_active ? t.deactivate : t.reactivate}
                </Button>
              )}
            </div>
          );
        },
      },
    ];
  }, [currentEmail, locale, onEdit, onResendInvite, onToggleActive, t]);

  return <DataTable caption={t.title} columns={columns} rows={admins} getRowId={getAdminId} onRowSelect={onEdit} rowLabel={rowLabel} />;
}
