"use client";

import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { useThemeStore } from "@/store/theme.store";

function Toaster(props: ToasterProps) {
  const mode = useThemeStore((state) => state.mode);

  return (
    <Sonner
      theme={mode}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-success" />,
        info: <InfoIcon className="size-4 text-primary" />,
        warning: <TriangleAlertIcon className="size-4 text-warning" />,
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-xl !border-border !bg-popover !text-popover-foreground !shadow-float !font-sans backdrop-blur-md",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
