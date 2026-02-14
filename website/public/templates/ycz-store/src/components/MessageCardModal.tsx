"use client";

import * as React from "react";

export type MessageCardModalVariant = "success" | "error" | "info";

export type MessageCardModalProps = {
  open: boolean;
  variant?: MessageCardModalVariant;
  title: string;
  details?: string;
  onClose: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  showSuccessIcon?: boolean;
};

export default function MessageCardModal({
  open,
  variant = "info",
  title,
  details,
  onClose,
  primaryActionLabel,
  onPrimaryAction,
  showSuccessIcon,
}: MessageCardModalProps) {
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const shouldShowSuccessIcon = (showSuccessIcon ?? true) && variant === "success";

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <button className="modal-backdrop" type="button" aria-label="Close" onClick={onClose} />
      <div className="modal-card">
        {shouldShowSuccessIcon ? (
          <div className="modal-successMark modal-successMarkPop" aria-hidden="true">
            <svg className="modal-successMarkSvg" viewBox="0 0 96 96" focusable="false">
              <circle className="modal-successMarkCircle" cx="48" cy="48" r="36" />
              <path className="modal-successMarkCheck" d="M30 50 L42 62 L67 37" />
            </svg>
          </div>
        ) : null}
        <div className={variant === "success" ? "modal-title modal-titleSuccess" : variant === "error" ? "modal-title modal-titleError" : "modal-title"}>
          {title}
        </div>
        <div className="modal-sep" />
        {details ? <div className="modal-details">{details}</div> : null}
        <div className="modal-actions">
          {primaryActionLabel ? (
            <button className="modal-btn modal-btnPrimary" type="button" onClick={onPrimaryAction ?? onClose}>
              {primaryActionLabel}
            </button>
          ) : null}
          <button className="modal-btn modal-btnSecondary" type="button" onClick={onClose}>
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
