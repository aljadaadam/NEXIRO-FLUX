"use client";

import * as React from "react";
import LoadingButton from "./LoadingButton";

export type ResetPasswordModalProps = {
  open: boolean;
  title?: string;
  tokenPresent?: boolean;
  password: string;
  confirmPassword: string;
  onChangePassword: (value: string) => void;
  onChangeConfirmPassword: (value: string) => void;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  loading?: boolean;
};

export default function ResetPasswordModal({
  open,
  title = "إعادة تعيين كلمة المرور",
  tokenPresent,
  password,
  confirmPassword,
  onChangePassword,
  onChangeConfirmPassword,
  onConfirm,
  onClose,
  loading = false,
}: ResetPasswordModalProps) {
  const canSubmit = password.length >= 6 && password === confirmPassword && Boolean(tokenPresent);

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

        <div className="modal-details modal-detailsCentered">
          أدخل كلمة مرور جديدة (الحد الأدنى 6 أحرف).
        </div>

        {!tokenPresent ? (
          <div className="modal-details modal-detailsCentered" style={{ color: "rgba(239,68,68,0.9)" }}>
            رابط إعادة التعيين غير صالح أو مفقود.
          </div>
        ) : null}

        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            void onConfirm();
          }}
        >
          <div className="modal-label">كلمة المرور الجديدة</div>
          <input
            className="modal-input"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => onChangePassword(e.target.value)}
            disabled={loading}
          />

          <div className="modal-label" style={{ marginTop: "0.65rem" }}>
            تأكيد كلمة المرور
          </div>
          <input
            className="modal-input"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => onChangeConfirmPassword(e.target.value)}
            disabled={loading}
          />

          {password && confirmPassword && password !== confirmPassword ? (
            <div className="modal-details" style={{ marginTop: "0.65rem", color: "rgba(239,68,68,0.9)" }}>
              كلمتا المرور غير متطابقتين.
            </div>
          ) : null}

          <div className="modal-actions modal-actionsGrid" style={{ marginTop: "0.9rem" }}>
            <LoadingButton
              className="modal-btn modal-btnPrimary"
              type="submit"
              loading={loading}
              disabled={!canSubmit}
              aria-disabled={!canSubmit || loading}
            >
              حفظ
            </LoadingButton>
            <button className="modal-btn modal-btnSecondary" type="button" onClick={onClose} disabled={loading}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
