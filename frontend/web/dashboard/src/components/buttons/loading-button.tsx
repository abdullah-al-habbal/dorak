import { Loader2Icon } from "lucide-react";
import type { ComponentProps, JSX } from "react";

import { Button } from "@/components/ui/button";

interface LoadingButtonProps extends ComponentProps<typeof Button> {
  loading?: boolean;
  loadingLabel?: string;
}

export function LoadingButton({ loading = false, loadingLabel, children, disabled, ...props }: LoadingButtonProps): JSX.Element {
  return (
    <Button disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading ? <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden /> : null}
      {loading && loadingLabel ? loadingLabel : children}
    </Button>
  );
}
