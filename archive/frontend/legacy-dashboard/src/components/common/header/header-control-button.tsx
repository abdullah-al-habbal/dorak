"use client";

import { HEADER_CONTROL_CLASS_NAME } from "@/components/common/header/header-control.constant";
import { Button } from "@/components/tailgrids/core/button";
import { cn } from "@/utils/cn.util";

interface HeaderControlButtonProps {
  ariaLabel: string;
  onPress: () => void;
  className?: string;
  children: React.ReactNode;
}

/** Square icon-only control shared by every header toggle. */
export function HeaderControlButton({
  ariaLabel,
  onPress,
  className,
  children,
}: HeaderControlButtonProps) {
  return (
    <Button
      iconOnly
      appearance="outline"
      onPress={onPress}
      aria-label={ariaLabel}
      className={cn(HEADER_CONTROL_CLASS_NAME, className)}
    >
      {children}
    </Button>
  );
}
