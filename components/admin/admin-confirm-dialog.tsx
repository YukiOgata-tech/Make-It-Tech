"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  busy?: boolean;
  error?: string;
  tone?: "danger" | "caution";
  icon?: "alert" | "logout";
};

export function AdminConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel,
  busy = false,
  error,
  tone = "danger",
  icon = "alert",
}: AdminConfirmDialogProps) {
  const Icon = icon === "logout" ? LogOut : AlertTriangle;

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-[3px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="admin-app fixed left-1/2 top-1/2 z-[101] w-[min(calc(100vw-2rem),28rem)] -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] border border-border bg-card p-6 text-foreground shadow-[0_24px_80px_rgb(0_0_0/0.25)] focus:outline-none sm:p-7"
          onEscapeKeyDown={(event) => { if (busy) event.preventDefault(); }}
          onPointerDownOutside={(event) => { if (busy) event.preventDefault(); }}
        >
          <span className={tone === "danger"
            ? "flex size-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"
            : "flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          }>
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <Dialog.Title className="mt-4 text-lg font-semibold tracking-tight">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </Dialog.Description>
          {error ? <p role="alert" className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="rounded-xl sm:min-w-28" disabled={busy} onClick={() => onOpenChange(false)}>
              戻る
            </Button>
            <Button type="button" variant={tone === "danger" ? "destructive" : "default"} className="rounded-xl sm:min-w-32" disabled={busy} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
