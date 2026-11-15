import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon, SparklesIcon } from "lucide-react";
import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { TrendDirection } from "@/enums/trend-direction.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";
import type { EarningsTrend } from "@/interfaces/earnings/earnings-trend.interface";
import { formatPercent } from "@/lib/earnings/earnings-format.util";

const PRESENTATION = {
  [TrendDirection.Up]: { variant: "success", icon: <ArrowUpRightIcon aria-hidden /> },
  [TrendDirection.Down]: { variant: "destructive", icon: <ArrowDownRightIcon aria-hidden /> },
  [TrendDirection.Flat]: { variant: "secondary", icon: <MinusIcon aria-hidden /> },
  [TrendDirection.New]: { variant: "info", icon: <SparklesIcon aria-hidden /> },
} as const;

/** Direction is carried by an icon and words as well as colour, and a refund-heavy period never flips them. */
export function TrendBadge({ trend, locale }: { trend: EarningsTrend; locale: string }): JSX.Element {
  const { earnings: t } = useDictionary();
  const { variant, icon } = PRESENTATION[trend.direction];
  const percent = trend.percent === null ? "" : formatPercent(trend.percent, locale);
  const sentence = {
    [TrendDirection.Up]: t.trend.up,
    [TrendDirection.Down]: t.trend.down,
    [TrendDirection.Flat]: t.trend.flat,
    [TrendDirection.New]: t.trend.new,
  }[trend.direction].replace("{percent}", percent);
  const visible = trend.direction === TrendDirection.New ? t.trend.newShort : trend.direction === TrendDirection.Flat ? t.trend.flatShort : percent;

  return (
    <Badge variant={variant} title={sentence} className="tabular">
      {icon}
      <span aria-hidden>{visible}</span>
      <span className="sr-only">{sentence}</span>
    </Badge>
  );
}
