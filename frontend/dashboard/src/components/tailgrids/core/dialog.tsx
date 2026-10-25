import { cn } from "@/utils/cn.util";
import { Close } from "@tailgrids/icons";
import type { ComponentProps } from "react";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  Modal as AriaModal,
  Heading,
  type DialogProps as AriaDialogProps,
  type HeadingProps,
} from "react-aria-components";
import { Button, ButtonProps } from "@/components/tailgrids/core/button";
import {
  Description,
  DescriptionProps,
} from "@/components/tailgrids/core/description";

export interface DialogLabels {
  close: string;
}

export interface DialogProps extends AriaDialogProps {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  showCloseButton?: boolean;
  labels: DialogLabels;
}

export function Dialog({
  isOpen,
  defaultOpen,
  onOpenChange,
  className,
  showCloseButton = true,
  children,
  labels,
  ...props
}: DialogProps) {
  return (
    <AriaModal
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      className="fixed inset-0 grid place-items-center p-4"
    >
      <AriaDialog
        className={cn(
          "w-full max-w-140 rounded-xl border border-border-primary bg-background-white-primary p-6 shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          className,
        )}
        {...props}
      >
        {({ close }) => (
          <>
            {typeof children === "function" ? children({ close }) : children}
            {showCloseButton && (
              <AriaButton
                onPress={close}
                aria-label={labels.close}
                className="absolute top-4 end-4 flex size-7 items-center justify-center rounded-md text-text-100 opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none [&>svg]:size-5"
              >
                <Close />
                <span className="sr-only">{labels.close}</span>
              </AriaButton>
            )}
          </>
        )}
      </AriaDialog>
    </AriaModal>
  );
}

export interface DialogHeaderProps extends ComponentProps<"div"> {}

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 text-start", className)}
      {...props}
    />
  );
}

export interface DialogTitleProps extends HeadingProps {
  className?: string;
}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <Heading
      slot="title"
      className={cn(
        "text-lg leading-none font-semibold text-title-50",
        className,
      )}
      {...props}
    />
  );
}

export interface DialogDescriptionProps extends DescriptionProps {}

export function DialogDescription({ ...props }: DialogDescriptionProps) {
  return <Description {...props} />;
}

export interface DialogBodyProps extends ComponentProps<"div"> {}

export function DialogBody({ className, ...props }: DialogBodyProps) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("py-4 text-sm text-text-100", className)}
      {...props}
    />
  );
}

export interface DialogFooterProps extends ComponentProps<"div"> {
  showCloseButton?: boolean;
}

export function DialogFooter({
  className,
  children,
  ...props
}: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DialogCloseProps extends Omit<ButtonProps, "slot"> {}

export function DialogClose({ ...props }: DialogCloseProps) {
  return <Button slot="close" {...props} />;
}
