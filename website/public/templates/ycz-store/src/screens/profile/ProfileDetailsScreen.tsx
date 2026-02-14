"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import LoadingButton from "../../components/LoadingButton";
import MessageCardModal from "../../components/MessageCardModal";
import Footer from "../home/components/Footer";
import Header from "../home/components/Header";

type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED";

function statusLabel(status: VerificationStatus): string {
  switch (status) {
    case "VERIFIED":
      return "حساب محقق";
    case "PENDING":
      return "قيد المراجعة";
    default:
      return "غير محقق";
  }
}

export default function ProfileDetailsScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [identityProofFileName, setIdentityProofFileName] = useState<string | undefined>(undefined);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("UNVERIFIED");

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [identityUploading, setIdentityUploading] = useState(false);
  const [pending, setPending] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<"success" | "error" | "info">("info");
  const [modalTitle, setModalTitle] = useState("");
  const [modalDetails, setModalDetails] = useState<string | undefined>(undefined);

  const isAuthed = useMemo(() => Boolean(token), [token]);

  useEffect(() => {
    try {
      setToken(localStorage.getItem("auth_token"));
    } catch {
      setToken(null);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function load() {
      setLoadingProfile(true);
      try {
        const res = await fetch("/api/profile/me", {
          cache: "no-store",
          headers: {
            authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        });

        const body = await res.json().catch(() => null);
        if (!res.ok || !body?.ok) {
          if (!cancelled) {
            setEmail("");
            openModal("error", "تعذر جلب بيانات الحساب", "تأكد من تشغيل السيرفر وتسجيل الدخول");
          }
          return;
        }

        if (cancelled) return;

        setEmail(body.data.email ?? "");
        setFullName(body.data.fullName ?? "");
        setWhatsapp(body.data.whatsapp ?? "");
        setAddress(body.data.address ?? "");
        setCountry(body.data.country ?? "");
        setBirthDate(body.data.birthDate ?? "");
        setVerificationStatus(body.data.verificationStatus ?? "UNVERIFIED");
        setIdentityProofFileName(body.data.identityDocument?.name);
      } catch {
        if (!cancelled) openModal("error", "تعذر جلب بيانات الحساب", "حاول مرة أخرى");
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  function openModal(variant: "success" | "error" | "info", title: string, details?: string) {
    setModalVariant(variant);
    setModalTitle(title);
    setModalDetails(details);
    setModalOpen(true);
  }

  async function handleSave() {
    if (pending) return;
    if (!token) {
      openModal("error", "لا يوجد بريد إلكتروني", "يرجى تسجيل الدخول أولاً");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/profile/me", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
          accept: "application/json",
        },
        body: JSON.stringify({
          fullName,
          whatsapp,
          address,
          country,
          birthDate,
        }),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) {
        openModal("error", "تعذر حفظ المعلومات", body?.error?.message ?? "حاول مرة أخرى");
        return;
      }

      setEmail(body.data.email ?? email);
      setFullName(body.data.fullName ?? "");
      setWhatsapp(body.data.whatsapp ?? "");
      setAddress(body.data.address ?? "");
      setCountry(body.data.country ?? "");
      setBirthDate(body.data.birthDate ?? "");
      setVerificationStatus(body.data.verificationStatus ?? verificationStatus);
      setIdentityProofFileName(body.data.identityDocument?.name ?? identityProofFileName);

      openModal("success", "تم حفظ المعلومات بنجاح");
    } catch {
      openModal("error", "تعذر حفظ المعلومات", "حاول مرة أخرى");
    } finally {
      setPending(false);
    }
  }

  async function handleIdentityUpload(file: File) {
    if (!token) {
      openModal("error", "يلزم تسجيل الدخول", "يرجى تسجيل الدخول أولاً");
      return;
    }

    setIdentityUploading(true);
    try {
      const form = new FormData();
      form.set("file", file, file.name);

      const res = await fetch("/api/profile/me/identity", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          accept: "application/json",
        },
        body: form,
      });

      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) {
        openModal("error", "تعذر رفع الملف", body?.error?.message ?? "حاول مرة أخرى");
        return;
      }

      setVerificationStatus(body.data.verificationStatus ?? verificationStatus);
      setIdentityProofFileName(body.data.identityDocument?.name ?? file.name);
      openModal("success", "تم رفع إثبات الهوية", "تم إرسال الملف للمراجعة");
    } catch {
      openModal("error", "تعذر رفع الملف", "حاول مرة أخرى");
    } finally {
      setIdentityUploading(false);
    }
  }

  if (!isAuthed) {
    return (
      <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
        <Header />
        <main className="container" style={{ padding: "2rem 0 3.5rem", flex: "1 0 auto" }}>
          <section className="card profileDash-card" style={{ direction: "rtl", textAlign: "right" }}>
            <div className="profileDash-title">تفاصيل الشخصية</div>
            <div className="profileSection-placeholder" style={{ marginTop: "0.75rem" }}>
              يجب تسجيل الدخول أولاً لعرض تفاصيل الحساب.
            </div>
            <div className="profileSection-actions">
              <Link className="profileDash-backHome" href="/profile">
                الذهاب لتسجيل الدخول
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main className="container" style={{ padding: "2rem 0 3.5rem", flex: "1 0 auto" }}>
        <section className="card profileDash-card" style={{ direction: "rtl", textAlign: "right" }}>
          <div className="profileDetails-head">
            <div>
              <div className="profileDash-title">تفاصيل الشخصية</div>
              <div className="profileDash-subtitle">عرض وتحديث معلوماتك</div>
              {loadingProfile ? (
                <div className="profileDash-subtitle" style={{ marginTop: ".25rem" }}>
                  جاري تحميل البيانات...
                </div>
              ) : null}
            </div>

            <div className={
              verificationStatus === "VERIFIED"
                ? "profileVerifyBadge profileVerifyBadge--verified"
                : verificationStatus === "PENDING"
                  ? "profileVerifyBadge profileVerifyBadge--pending"
                  : "profileVerifyBadge profileVerifyBadge--unverified"
            }>
              {statusLabel(verificationStatus)}
            </div>
          </div>

          <div className="profileForm-grid">
            <div className="profileField">
              <label className="profileLabel">البريد الإلكتروني (غير قابل للتعديل)</label>
              <input className="profileInput" value={email} readOnly />
            </div>

            <div className="profileField">
              <label className="profileLabel">الاسم الكامل</label>
              <input
                className="profileInput"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="اكتب اسمك الكامل"
              />
            </div>

            <div className="profileField">
              <label className="profileLabel">رقم واتساب</label>
              <input
                className="profileInput"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="مثال: +9665xxxxxxx"
                inputMode="tel"
              />
            </div>

            <div className="profileField">
              <label className="profileLabel">الدولة</label>
              <input
                className="profileInput"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="مثال: السعودية"
              />
            </div>

            <div className="profileField">
              <label className="profileLabel">العنوان</label>
              <input
                className="profileInput"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="المدينة / الحي / الشارع"
              />
            </div>

            <div className="profileField">
              <label className="profileLabel">تاريخ الميلاد</label>
              <input
                className="profileInput"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
          </div>

          <div className="profileIdentity">
            <div className="profileIdentity-title">إثبات الهوية</div>
            <div className="profileIdentity-row">
              <div className="profileIdentity-hint">
                ارفع صورة/ملف لإثبات الهوية لتفعيل التحقق (سيظهر الحساب قيد المراجعة).
              </div>
              <label className="profileIdentity-upload">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleIdentityUpload(f);
                  }}
                />
                {identityUploading ? "جاري الرفع..." : "رفع ملف"}
              </label>
            </div>
            {identityProofFileName ? (
              <div className="profileIdentity-file">الملف الحالي: {identityProofFileName}</div>
            ) : (
              <div className="profileIdentity-file profileIdentity-file--empty">لا يوجد ملف مرفوع</div>
            )}
          </div>

          <div className="profileDetails-actions">
            <LoadingButton
              className="auth-btn auth-btnPrimary"
              type="button"
              loading={pending || loadingProfile}
              onClick={handleSave}
            >
              حفظ
            </LoadingButton>
            <Link className="profileDetails-linkBtn" href="/profile">
              رجوع
            </Link>
          </div>
        </section>
      </main>

      <Footer />

      <MessageCardModal
        open={modalOpen}
        variant={modalVariant}
        title={modalTitle}
        details={modalDetails}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
