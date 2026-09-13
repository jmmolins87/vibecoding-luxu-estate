"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth/AuthProvider";
import { authErrorKey } from "@/lib/auth/errors";
import { useTranslations } from "@/lib/i18n/client";

type Mode = "signin" | "signup";

function GoogleIcon() {
  return (
    <svg className="relative z-10 h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="relative z-10 h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const socialBtn =
  "group flex w-full items-center justify-center gap-3 rounded-lg border border-nordic/10 bg-white p-3.5 font-medium text-nordic transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft relative overflow-hidden dark:border-white/10 dark:bg-white/5 dark:text-white";

export default function LoginModal() {
  const { t } = useTranslations();
  const { isLoginOpen, closeLogin, signInWithOAuth, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleClose = useCallback(() => {
    setError(null);
    setInfo(null);
    setBusy(false);
    setPassword("");
    closeLogin();
  }, [closeLogin]);

  // Cerrar con Escape y bloquear el scroll del fondo.
  useEffect(() => {
    if (!isLoginOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isLoginOpen, handleClose]);

  if (!isLoginOpen) return null;

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error: msg } = await signInWithEmail(email.trim(), password);
        if (msg) setError(t(authErrorKey(msg)));
        else setPassword("");
        // Si OK, el AuthProvider cierra el modal al detectar la sesión.
      } else {
        const { error: msg, needsConfirmation } = await signUpWithEmail(email.trim(), password);
        if (msg) setError(t(authErrorKey(msg)));
        else if (needsConfirmation) setInfo(t("auth.checkEmail"));
        // Si hay sesión inmediata, el AuthProvider cierra el modal.
      }
    } catch {
      setError(t("auth.errorDefault"));
    } finally {
      setBusy(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
  }

  function renderPanel(panelMode: Mode) {
    const active = panelMode === mode;
    const isSignup = panelMode === "signup";
    return (
      <section
        key={panelMode}
        aria-hidden={!active}
        inert={!active}
        className="w-1/2 shrink-0"
      >
        <div className="space-y-4">
          <button type="button" onClick={() => signInWithOAuth("google")} className={socialBtn} tabIndex={active ? undefined : -1}>
            <div className="absolute inset-0 translate-y-full bg-hint/20 transition-transform duration-300 ease-out group-hover:translate-y-0" />
            <GoogleIcon />
            <span className="relative z-10">{t("auth.google")}</span>
          </button>
          <button type="button" onClick={() => signInWithOAuth("github")} className={socialBtn} tabIndex={active ? undefined : -1}>
            <div className="absolute inset-0 translate-y-full bg-hint/20 transition-transform duration-300 ease-out group-hover:translate-y-0" />
            <GitHubIcon />
            <span className="relative z-10">{t("auth.github")}</span>
          </button>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-nordic/50 dark:text-gray-500">
          <span className="h-px flex-1 bg-nordic/10 dark:bg-white/10" />
          {t("auth.or")}
          <span className="h-px flex-1 bg-nordic/10 dark:bg-white/10" />
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor={`login-email-${panelMode}`} className="mb-1.5 block text-sm font-medium text-nordic dark:text-gray-200">
              {t("auth.email")}
            </label>
            <input
              id={`login-email-${panelMode}`}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.emailPlaceholder")}
              className="w-full rounded-lg border border-nordic/10 bg-white px-4 py-3 text-sm text-nordic outline-none transition-all placeholder:text-nordic/30 focus:border-mosque focus:ring-2 focus:ring-mosque/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>
          <div>
            <label htmlFor={`login-password-${panelMode}`} className="mb-1.5 block text-sm font-medium text-nordic dark:text-gray-200">
              {t("auth.password")}
            </label>
            <input
              id={`login-password-${panelMode}`}
              type="password"
              required
              minLength={6}
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.passwordPlaceholder")}
              className="w-full rounded-lg border border-nordic/10 bg-white px-4 py-3 text-sm text-nordic outline-none transition-all placeholder:text-nordic/30 focus:border-mosque focus:ring-2 focus:ring-mosque/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
            />
            {isSignup && (
              <p className="mt-1.5 text-xs text-nordic/50 dark:text-gray-500">{t("auth.passwordMin")}</p>
            )}
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {info && (
            <p role="status" className="rounded-lg bg-mosque/10 px-4 py-3 text-sm text-mosque dark:text-hint">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-mosque p-3.5 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-mosque/90 hover:shadow-soft disabled:translate-y-0 disabled:opacity-60"
          >
            {busy
              ? isSignup
                ? t("auth.signingUp")
                : t("auth.signingIn")
              : isSignup
                ? t("auth.signUp")
                : t("auth.signIn")}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-nordic/70 dark:text-gray-400">
          {isSignup ? t("auth.hasAccount") : t("auth.noAccount")}{" "}
          <button
            type="button"
            onClick={() => switchMode(isSignup ? "signin" : "signup")}
            className="font-semibold text-mosque transition-colors hover:text-nordic dark:text-hint dark:hover:text-white"
          >
            {isSignup ? t("auth.signIn") : t("auth.signUp")}
          </button>
        </p>
      </section>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("auth.welcome")}
    >
      <button
        aria-label={t("auth.close")}
        onClick={handleClose}
        className="absolute inset-0 cursor-default bg-nordic/50 backdrop-blur-sm dark:bg-black/60"
      />
      {/* Resplandores decorativos del diseño original */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-hint/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-mosque/10 blur-3xl" />
      </div>

      <main className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-mosque text-white shadow-soft">
            <Icon name="building" className="h-7 w-7" />
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
            {t("auth.welcome")}
          </h1>
          <p className="text-white/70">{t("auth.subtitle")}</p>
        </div>

        <div className="relative rounded-2xl border border-white/50 bg-white p-8 shadow-soft backdrop-blur-sm sm:p-10 dark:border-white/10 dark:bg-[#0f231f]">
          <button
            onClick={handleClose}
            aria-label={t("auth.close")}
            className="absolute top-4 right-4 rounded-full p-1.5 text-nordic/50 transition-colors hover:bg-nordic/5 hover:text-nordic dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>

          {/* Pista deslizante [registro | acceso]: ir a registro desplaza el
              contenido hacia la derecha; volver a acceso, hacia la izquierda. */}
          <div className="overflow-hidden">
            <div
              className="flex w-[200%] motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{ transform: mode === "signin" ? "translateX(-50%)" : "translateX(0)" }}
            >
              {renderPanel("signup")}
              {renderPanel("signin")}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <nav className="flex justify-center gap-6 text-xs text-white/60">
            <a className="transition-colors hover:text-white" href="#">
              Privacy Policy
            </a>
            <a className="transition-colors hover:text-white" href="#">
              Terms of Service
            </a>
            <a className="transition-colors hover:text-white" href="#">
              Help Center
            </a>
          </nav>
        </div>
      </main>
    </div>
  );
}
