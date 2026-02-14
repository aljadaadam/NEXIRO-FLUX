"use client";

import { useEffect, useState } from "react";
import ProfileAuthSection from "./sections/ProfileAuthSection";
import ProfileDashboardSection from "./sections/ProfileDashboardSection";

type AuthState =
  | { status: "unknown" }
  | { status: "guest" }
  | { status: "authed"; email?: string };

export default function ProfileScreen() {
  const [authState, setAuthState] = useState<AuthState>({ status: "unknown" });

  useEffect(() => {
    try {
      const token = localStorage.getItem("auth_token");
      const email = localStorage.getItem("auth_email") ?? undefined;
      if (token) setAuthState({ status: "authed", email });
      else setAuthState({ status: "guest" });
    } catch {
      setAuthState({ status: "guest" });
    }
  }, []);

  if (authState.status === "unknown") return null;

  if (authState.status === "authed") {
    return (
      <ProfileDashboardSection
        email={authState.email}
        onLogout={() => {
          try {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_email");
          } catch {
            // ignore
          }
          setAuthState({ status: "guest" });
        }}
      />
    );
  }

  return (
    <ProfileAuthSection
      onAuthSuccess={(email) => {
        setAuthState({ status: "authed", email });
      }}
    />
  );
}
