"use client";

import { useEffect, useCallback } from "react";

export interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional class for the inner modal panel */
  className?: string;
}

export function ModalWrapper({
  isOpen,
  onClose,
  children,
  className = "",
}: ModalWrapperProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed w-full h-full inset-0 z-1000 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="modal-backdrop absolute inset-0 bg-black/50"
        aria-label="Close modal"
      />
      <div
        className={`modal-panel relative w-full max-w-full rounded-2xl border border-blue-custom bg-white shadow-xl sm:max-w-lg ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
