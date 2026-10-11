"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-mint font-bold text-ink",
        size === "sm" && "h-8 w-8 text-[0.65rem]",
        size === "md" && "h-10 w-10 text-xs",
        size === "lg" && "h-14 w-14 text-sm",
      )}
    >
      {initials(name)}
    </span>
  );
}

export function Modal({
  open,
  title,
  eyebrow,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm">
      <div className="panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          </div>
          <button
            className="button-ghost rounded-full p-2"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#cbd9d0] bg-[#f8fbf9] px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-mint text-xl">
        ✦
      </div>
      <h3 className="font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#718179]">
        {text}
      </p>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="rounded-xl bg-[#fff0ec] px-4 py-3 text-sm font-medium text-[#b35341]">
      {message}
    </p>
  );
}
