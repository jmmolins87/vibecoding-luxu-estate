"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LoginModal from "@/components/auth/LoginModal";
import { useAuth } from "@/lib/auth/AuthProvider";

/**
 * Monta el LoginModal global y lo abre automáticamente
 * cuando la URL trae `?login=...` (p. ej. redirección de ruta protegida).
 *
 * Los parámetros se consumen una sola vez y se eliminan de la URL:
 * así un `router.refresh()` posterior (p. ej. cambio de idioma)
 * no vuelve a abrir el modal.
 */
export default function AuthModalHost() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openLogin, isLoginOpen, user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (searchParams.get("login") === null) return;
    const next = searchParams.get("next");
    // Consumir la intención de login: limpiar la URL para que
    // futuros refresh no reabran el modal.
    router.replace(pathname, { scroll: false });
    // Con sesión ya iniciada no hay nada que abrir.
    if (user || isLoginOpen) return;
    openLogin(next && next.startsWith("/") ? next : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return <LoginModal />;
}
