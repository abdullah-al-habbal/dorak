"use client";

import { useMemo } from "react";
import type { JSX } from "react";

import { FeedbackStatusBadge } from "@/components/support/feedback-status-badge";
import { DataTable } from "@/components/ui/table/data-table";
import { useI18n } from "@/hooks/core/state/use-i18n";
import type { DataTableColumn } from "@/interfaces/ui/data/data-table-column.interface";
import type { FeedbackReport } from "@/types/support/feedback-report.type";

interface FeedbackListProps {
  reports: readonly FeedbackReport[];
  onSelect: (report: FeedbackReport) => void;
}

function getReportId(report: FeedbackReport): string {
  return report.id;
}

/** The message is user text: it renders as a React text node (escaped), clamped to two lines. */
export function FeedbackList({ reports, onSelect }: FeedbackListProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { support: t } = dictionary;

  const columns = useMemo<DataTableColumn<FeedbackReport>[]>(() => {
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
    return [
      { id: "message", header: t.columns.message, primary: true, cell: (report) => <span dir="auto" className="line-clamp-2 break-words font-medium">{report.message}</span> },
      { id: "kind", header: t.columns.kind, cell: (report) => <span>{t.kind[report.kind]}</span> },
      { id: "app", header: t.columns.app, cell: (report) => <span className="text-muted-foreground">{t.app[report.source.app]} · {t.platform[report.source.platform]}</span> },
      { id: "status", header: t.columns.status, cell: (report) => <FeedbackStatusBadge status={report.status} /> },
      { id: "created", header: t.columns.created, cell: (report) => <span className="tabular text-sm text-muted-foreground">{report.created_at ? date.format(new Date(report.created_at)) : t.none}</span> },
    ];
  }, [locale, t]);

  return <DataTable caption={t.title} columns={columns} rows={reports} getRowId={getReportId} onRowSelect={onSelect} rowLabel={(report) => t.rowLabel.replace("{message}", report.message.slice(0, 60))} />;
}
