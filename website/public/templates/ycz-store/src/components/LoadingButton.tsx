"use client";

import * as React from "react";

export type LoadingButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export default function LoadingButton({
  loading = false,
  disabled,
  className,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      className={className}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      <span className="btn-inner">
        {loading ? <span className="btn-spinner" aria-hidden="true" /> : null}
        <span className={loading ? "btn-label btn-labelLoading" : "btn-label"}>{children}</span>
      </span>
    </button>
  );
}
