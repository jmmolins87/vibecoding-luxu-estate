"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LoginModal from "@/components/auth/LoginModal";
import { useAuth } from "@/lib/auth/AuthProvider";

/**
 * Monta el LoginModal global y lo abre automáticamente
 * cuando la URL trae `?login=...` (p. ej. redirección de ruta protegida).
 */
export default function AuthModalHost() {
  const searchParams = useSearchParams();
  const { openLogin, isLoginOpen } = useAuth();

  useEffect(() => {
    const loginParam = searchParams.get("login");
    if (loginParam === null || isLoginOpen) return;
    const next = searchParams.get("next");
    openLogin(next && next.startsWith("/") ? next : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return <LoginModal />;
}
