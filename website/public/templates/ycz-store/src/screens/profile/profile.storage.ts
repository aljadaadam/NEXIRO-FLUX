export type ProfileVerificationStatus = "unverified" | "pending" | "verified";

export type ProfileDetails = {
  email: string;
  fullName?: string;
  whatsapp?: string;
  address?: string;
  country?: string;
  birthDate?: string; // yyyy-mm-dd
  identityProofFileName?: string;
  verificationStatus: ProfileVerificationStatus;
  updatedAt: number;
};

const STORAGE_KEY = "profile_details_v1";

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function getAuthEmail(): string {
  try {
    return (localStorage.getItem("auth_email") ?? "").trim();
  } catch {
    return "";
  }
}

export function loadProfileDetails(): ProfileDetails | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return safeJsonParse<ProfileDetails>(raw);
  } catch {
    return null;
  }
}

export function saveProfileDetails(next: Omit<ProfileDetails, "updatedAt">): ProfileDetails {
  const record: ProfileDetails = { ...next, updatedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  return record;
}
