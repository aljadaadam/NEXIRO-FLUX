"use client";

import * as React from "react";
import LoadingButton from "./LoadingButton";

export type PromptModalProps = {
  open: boolean;
  title: string;
  description?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  cancelLabel?: string;
  onClose: () => void;
  loading?: boolean;
};

export default function PromptModal({
  open,
  title,
  description,
  placeholder,
  value,
  onChange,
  confirmLabel,
  onConfirm,
  cancelLabel = "إلغاء",
  onClose,
  loading = false,
}: PromptModalProps) {
  const valueTrimmed = value.trim();
  const canSubmit = valueTrimmed.length > 0;

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, loading]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <button
        className="modal-backdrop"
        type="button"
        aria-label="Close"
        onClick={loading ? undefined : onClose}
        disabled={loading}
      />
      <div className="modal-card">
        <div className="modal-title">{title}</div>
        <div className="modal-sep" />
        {description ? <div className="modal-details modal-detailsCentered">{description}</div> : null}

        <form
          className="modal-form modal-formPrompt"
          onSubmit={(e) => {
            e.preventDefault();
            void onConfirm();
          }}
        >
          <div className="modal-label">البريد الإلكتروني</div>
          <input
            className="modal-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={placeholder ?? "اكتب بريدك الإلكتروني هنا"}
            aria-label={placeholder ?? "البريد الإلكتروني"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={loading}
          />

          <div className="modal-actions modal-actionsGrid">
            <LoadingButton
              className="modal-btn modal-btnPrimary"
              type="submit"
              loading={loading}
              disabled={!canSubmit}
              aria-disabled={!canSubmit || loading}
            >
              {confirmLabel}
            </LoadingButton>
            <button
              className="modal-btn modal-btnSecondary"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              {cancelLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
