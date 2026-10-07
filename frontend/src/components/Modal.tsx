"use client";

import { ReactNode, useEffect } from "react";
import { CloseIcon } from "./Icons";

export default function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className={`animate-fade-up max-h-[90vh] w-full ${
          wide ? "max-w-3xl" : "max-w-[568px]"
        } overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex h-16 shrink-0 items-center justify-center border-b border-gray-border px-6">
          <button
            onClick={onClose}
            className="absolute left-4 rounded-full p-2 hover:bg-gray-100"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
          <span className="font-semibold">{title}</span>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
