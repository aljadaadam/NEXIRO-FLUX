"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LoadingButton from "../../../components/LoadingButton";
import MessageCardModal from "../../../components/MessageCardModal";
import PromptModal from "../../../components/PromptModal";
import ResetPasswordModal from "../../../components/ResetPasswordModal";
import Footer from "../../home/components/Footer";
import Header from "../../home/components/Header";

export default function ProfileAuthSection(props: {
  onAuthSuccess: (email?: string) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [pendingAction, setPendingAction] = useState<"login" | "register" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPending, setForgotPending] = useState(false);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetPending, setResetPending] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<"success" | "error" | "info">("info");
  const [modalTitle, setModalTitle] = useState("");
  const [modalDetails, setModalDetails] = useState<string | undefined>(undefined);
  const [modalPrimaryLabel, setModalPrimaryLabel] = useState<string | undefined>(undefined);
  const [modalPrimaryAction, setModalPrimaryAction] = useState<(() => void) | undefined>(undefined);

  useEffect(() => {
    const token = searchParams.get("reset_token");
    if (!token) return;

    setResetToken(token);
    setResetOpen(true);
  }, [searchParams]);

  const closeModal = () => {
    setModalOpen(false);
    setModalPrimaryLabel(undefined);
    setModalPrimaryAction(undefined);
  };

  function openModal(
    variant: "success" | "error" | "info",
    title: string,
    details?: string,
    opts?: { primaryLabel?: string; onPrimaryAction?: () => void }
  ) {
    setModalVariant(variant);
    setModalTitle(title);
    setModalDetails(details);
    setModalPrimaryLabel(opts?.primaryLabel);
    setModalPrimaryAction(() => opts?.onPrimaryAction);
    setModalOpen(true);
  }

  function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function validateInputs(): { ok: true } | { ok: false; title: string; details?: string } {
    const emailTrimmed = email.trim();
    if (!emailTrimmed) return { ok: false, title: "يرجى إدخال البريد الإلكتروني" };
    if (!isValidEmail(emailTrimmed)) return { ok: false, title: "البريد الإلكتروني غير صحيح" };
    if (!password) return { ok: false, title: "يرجى إدخال كلمة المرور" };
    if (password.length < 6) return { ok: false, title: "كلمة المرور قصيرة", details: "الحد الأدنى 6 أحرف" };
    return { ok: true };
  }

  function translateAuthError(err: any): { title: string; details?: string } {
    const code = String(err?.code ?? "UNKNOWN");
    switch (code) {
      case "AUTH_EMAIL_EXISTS":
        return { title: "هذا البريد مسجل مسبقاً", details: "اضغط على زر تسجيل الدخول" };
      case "AUTH_USER_NOT_FOUND":
        return { title: "الحساب غير موجود", details: "هذا البريد غير مسجل. اضغط على زر إنشاء حساب" };
      case "AUTH_INVALID_CREDENTIALS":
        return { title: "بيانات الدخول غير صحيحة", details: "تأكد من البريد وكلمة المرور" };
      case "AUTH_SOCIAL_ONLY":
        return {
          title: "هذا الحساب يستخدم الدخول السريع",
          details: "لا يمكن تسجيل الدخول بهذه البوابة. استخدم Google أو Apple",
        };
      case "VALIDATION_EMAIL_REQUIRED":
        return { title: "البريد الإلكتروني مطلوب" };
      case "VALIDATION_EMAIL_INVALID":
        return { title: "البريد الإلكتروني غير صحيح" };
      case "VALIDATION_PASSWORD_REQUIRED":
        return { title: "كلمة المرور مطلوبة" };
      case "VALIDATION_PASSWORD_WEAK":
        return { title: "كلمة المرور قصيرة", details: "الحد الأدنى 6 أحرف" };
      case "RESET_TOKEN_INVALID":
        return { title: "رابط إعادة التعيين غير صالح" };
      case "RESET_TOKEN_EXPIRED":
        return { title: "انتهت صلاحية رابط إعادة التعيين", details: "اطلب رابطاً جديداً" };
      case "UPSTREAM_UNAVAILABLE":
        return { title: "تعذر الاتصال بالخادم", details: "حاول مرة أخرى لاحقاً" };
      default:
        return { title: "حدث خطأ غير متوقع", details: code };
    }
  }

  function cleanResetTokenFromUrl() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("reset_token");
      const qs = url.searchParams.toString();
      router.replace(qs ? `${url.pathname}?${qs}` : url.pathname);
    } catch {
      // ignore
    }
  }

  async function handleResetConfirm() {
    if (resetPending) return;

    const token = resetToken ?? "";
    if (!token) {
      openModal("error", "رابط إعادة التعيين غير صالح");
      return;
    }
    if (!resetPassword) {
      openModal("error", "كلمة المرور مطلوبة");
      return;
    }
    if (resetPassword.length < 6) {
      openModal("error", "كلمة المرور قصيرة", "الحد الأدنى 6 أحرف");
      return;
    }
    if (resetPassword !== resetConfirmPassword) {
      openModal("error", "كلمتا المرور غير متطابقتين");
      return;
    }

    setResetPending(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ token, password: resetPassword }),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? (JSON.parse(text) as any) : null;
      } catch {
        data = null;
      }

      if (!res.ok || !data?.ok) {
        const { title, details } = translateAuthError(data?.error);
        setResetOpen(false);
        openModal("error", title, details);
        return;
      }

      setResetOpen(false);
      setResetPassword("");
      setResetConfirmPassword("");
      setResetToken(null);
      cleanResetTokenFromUrl();
      openModal("success", "تم تحديث كلمة المرور", "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة");
    } catch {
      setResetOpen(false);
      const { title, details } = translateAuthError({ code: "UPSTREAM_UNAVAILABLE" });
      openModal("error", title, details);
    } finally {
      setResetPending(false);
    }
  }

  async function handleForgotConfirm() {
    if (forgotPending) return;

    const emailTrimmed = forgotEmail.trim();
    if (!emailTrimmed) {
      openModal("error", "يرجى إدخال البريد الإلكتروني");
      return;
    }
    if (!isValidEmail(emailTrimmed)) {
      openModal("error", "البريد الإلكتروني غير صحيح");
      return;
    }

    setForgotPending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ email: emailTrimmed }),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? (JSON.parse(text) as any) : null;
      } catch {
        data = null;
      }

      if (!res.ok || !data?.ok) {
        const code = String(data?.error?.code ?? "UNKNOWN");
        const { title, details } = translateAuthError(data?.error);
        setForgotOpen(false);

        if (code === "AUTH_USER_NOT_FOUND") {
          const emailForRegister = emailTrimmed;
          openModal(
            "error",
            "هذا البريد غير مسجل لدينا",
            "لا يمكن إرسال رابط إعادة التعيين لأن الحساب غير موجود. يمكنك إنشاء حساب الآن ثم المحاولة مرة أخرى.",
            {
              primaryLabel: "الرجوع للتسجيل",
              onPrimaryAction: () => {
                closeModal();
                setEmail(emailForRegister);
                setTimeout(() => {
                  passwordInputRef.current?.focus();
                }, 0);
              },
            }
          );
          return;
        }

        openModal("error", title, details);
        return;
      }

      setForgotOpen(false);
      openModal(
        "success",
        "تم إرسال رابط إعادة تعيين كلمة المرور",
        "تحقق من بريدك الإلكتروني لإكمال إعادة التعيين"
      );
    } catch {
      setForgotOpen(false);
      const { title, details } = translateAuthError({ code: "UPSTREAM_UNAVAILABLE" });
      openModal("error", title, details);
    } finally {
      setForgotPending(false);
    }
  }

  async function postAuth(path: "/api/auth/login" | "/api/auth/register") {
    const res = await fetch(path, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const text = await res.text();
    let data: any = null;
    try {
      data = text ? (JSON.parse(text) as any) : null;
    } catch {
      data = null;
    }
    return { res, data };
  }

  function persistAuth(token?: string, authedEmail?: string) {
    if (!token) return;
    try {
      localStorage.setItem("auth_token", token);
      if (authedEmail) localStorage.setItem("auth_email", authedEmail);
    } catch {
      // ignore
    }
  }

  async function handleLoginSubmit() {
    if (pendingAction) return;

    const validation = validateInputs();
    if (!validation.ok) {
      openModal("error", validation.title, validation.details);
      return;
    }

    setPendingAction("login");

    try {
      const { res, data } = await postAuth("/api/auth/login");

      if (!res.ok || !data?.ok) {
        const { title, details } = translateAuthError(data?.error);
        openModal("error", title, details);
        return;
      }

      const token = data?.data?.token;
      const authedEmail = data?.data?.user?.email as string | undefined;
      persistAuth(token, authedEmail);

      openModal("success", "تم تسجيل الدخول بنجاح", authedEmail ? `مرحباً: ${authedEmail}` : undefined);
      props.onAuthSuccess(authedEmail);
    } catch {
      const { title, details } = translateAuthError({ code: "UPSTREAM_UNAVAILABLE" });
      openModal("error", title, details);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleRegisterClick() {
    if (pendingAction) return;

    const validation = validateInputs();
    if (!validation.ok) {
      openModal("error", validation.title, validation.details);
      return;
    }

    setPendingAction("register");

    try {
      const { res, data } = await postAuth("/api/auth/register");

      if (!res.ok || !data?.ok) {
        const { title, details } = translateAuthError(data?.error);
        openModal("error", title, details);
        return;
      }

      const token = data?.data?.token;
      const authedEmail = data?.data?.user?.email as string | undefined;
      persistAuth(token, authedEmail);

      openModal("success", "تم إنشاء الحساب بنجاح", authedEmail ? `مرحباً: ${authedEmail}` : undefined);
      props.onAuthSuccess(authedEmail);
    } catch {
      const { title, details } = translateAuthError({ code: "UPSTREAM_UNAVAILABLE" });
      openModal("error", title, details);
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div style={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main className="container" style={{ padding: "2rem 0 3.5rem", flex: "1 0 auto" }}>
        <section className="card auth-card">
          <div className="auth-head">
            <div className="auth-title">مرحبا</div>
            <div className="auth-hero">
              <div className="auth-heroBox">
                <Image
                  className="auth-heroImg"
                  src="/images/servicesScreen/security.gif"
                  alt="Security"
                  fill
                  sizes="160px"
                  priority
                  unoptimized
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          </div>

          <div className="auth-subtitle">سجل دخول الي {process.env.NEXT_PUBLIC_STORE_NAME ?? "المتجر"}</div>

          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              void handleLoginSubmit();
            }}
          >
            <div className="auth-fields">
              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder="البريد الإلكتروني"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                ref={emailInputRef}
              />
              <div className="auth-inputWrap">
                <input
                  className="auth-input auth-inputWithIcon"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="كلمة المرور"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  ref={passwordInputRef}
                />
                <button
                  className="auth-inputIconBtn"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="auth-forgotRow">
              <button
                className="auth-forgot"
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotOpen(true);
                }}
              >
                نسيت كلمة المرور؟
              </button>
            </div>

            <div className="auth-actions">
              <LoadingButton className="auth-btn auth-btnPrimary" type="submit" loading={pendingAction === "login"}>
                تسجيل دخول
              </LoadingButton>
              <LoadingButton
                className="auth-btn auth-btnSecondary"
                type="button"
                onClick={() => void handleRegisterClick()}
                loading={pendingAction === "register"}
              >
                انشاء حساب
              </LoadingButton>
            </div>
          </form>

          <div className="auth-altTitle" style={{ direction: "rtl", textAlign: "right" }}>
            أو استخدم خيارات الدخول السريع التالية (مظهر فقط حالياً).
          </div>

          <div className="auth-altActions" style={{ marginTop: "0.75rem" }}>
            <button
              className="auth-btn auth-btnProvider"
              type="button"
              onClick={() => openModal("info", "قريباً", "الدخول عبر Google غير مفعّل حالياً (مظهر فقط)")}
            >
              <span className="auth-providerBtnInner">
                <span className="auth-providerIcon" aria-hidden="true">
                  <Image
                    className="auth-providerIconImg"
                    src="/images/servicesScreen/google.png"
                    alt=""
                    width={22}
                    height={22}
                  />
                </span>
                <span className="auth-providerLabel">الدخول عبر Google</span>
              </span>
            </button>

            <button
              className="auth-btn auth-btnProvider"
              type="button"
              onClick={() => openModal("info", "قريباً", "الدخول عبر Apple غير مفعّل حالياً (مظهر فقط)")}
            >
              <span className="auth-providerBtnInner">
                <span className="auth-providerIcon" aria-hidden="true">
                  <Image
                    className="auth-providerIconImg"
                    src="/images/servicesScreen/apple.png"
                    alt=""
                    width={22}
                    height={22}
                  />
                </span>
                <span className="auth-providerLabel">الدخول عبر Apple</span>
              </span>
            </button>
          </div>

          <section className="auth-steps" style={{ direction: "rtl", textAlign: "right" }}>
            <div className="auth-stepsTitle">شرح طريقة الدخول</div>
            <div className="auth-stepsSplit">
              <div className="auth-stepsGroup">
                <div className="auth-stepsGroupTitle">الدخول بالبريد وكلمة المرور</div>
                <div className="auth-stepsList">
                  <div className="auth-step">
                    <div className="auth-stepNum">1</div>
                    <div className="auth-stepText">اكتب البريد الإلكتروني</div>
                  </div>
                  <div className="auth-step">
                    <div className="auth-stepNum">2</div>
                    <div className="auth-stepText">اكتب كلمة المرور</div>
                  </div>
                  <div className="auth-step">
                    <div className="auth-stepNum">3</div>
                    <div className="auth-stepText">اضغط “تسجيل دخول” أو “انشاء حساب”</div>
                  </div>
                </div>
              </div>

              <div className="auth-stepsGroup">
                <div className="auth-stepsGroupTitle">الدخول السريع (Google / Apple)</div>
                <div className="auth-stepsList">
                  <div className="auth-step">
                    <div className="auth-stepNum">1</div>
                    <div className="auth-stepText">اختر Google أو Apple</div>
                  </div>
                  <div className="auth-step">
                    <div className="auth-stepNum">2</div>
                    <div className="auth-stepText">سيتم تحويلك لمزود الدخول (غير مفعّل حالياً)</div>
                  </div>
                  <div className="auth-step">
                    <div className="auth-stepNum">3</div>
                    <div className="auth-stepText">بعد الموافقة يتم تسجيل الدخول تلقائياً</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
      <Footer />

      <MessageCardModal
        open={modalOpen}
        variant={modalVariant}
        title={modalTitle}
        details={modalDetails}
        onClose={closeModal}
        primaryActionLabel={modalPrimaryLabel}
        onPrimaryAction={modalPrimaryAction}
      />

      <PromptModal
        open={forgotOpen}
        title="نسيت كلمة المرور"
        description="اكتب بريدك الإلكتروني وسنرسل لك تفاصيل إعادة تعيين كلمة المرور"
        placeholder="البريد الإلكتروني"
        value={forgotEmail}
        onChange={setForgotEmail}
        confirmLabel="إرسال"
        onConfirm={handleForgotConfirm}
        onClose={() => setForgotOpen(false)}
        loading={forgotPending}
      />

      <ResetPasswordModal
        open={resetOpen}
        tokenPresent={Boolean(resetToken)}
        password={resetPassword}
        confirmPassword={resetConfirmPassword}
        onChangePassword={setResetPassword}
        onChangeConfirmPassword={setResetConfirmPassword}
        onConfirm={handleResetConfirm}
        onClose={() => {
          if (resetPending) return;
          setResetOpen(false);
          cleanResetTokenFromUrl();
        }}
        loading={resetPending}
      />
    </div>
  );
}
