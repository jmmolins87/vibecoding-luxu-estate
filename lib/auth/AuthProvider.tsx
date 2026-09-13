"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/auth/roles";

export type OAuthProvider = "google" | "github";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  isLoading: boolean;
  isLoginOpen: boolean;
  openLogin: (nextPath?: string) => void;
  closeLogin: () => void;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Avatar de Google (`picture`) o GitHub (`avatar_url`) vía user_metadata. */
export function getAvatarUrl(user: User | null): string | null {
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const avatar = meta.avatar_url ?? meta.picture;
  return typeof avatar === "string" && avatar.length > 0 ? avatar : null;
}

/** Nombre visible: metadata de OAuth o parte local del email. */
export function getDisplayName(user: User | null): string {
  if (!user) return "";
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name = meta.full_name ?? meta.name;
  if (typeof name === "string" && name.length > 0) return name;
  return user.email?.split("@")[0] ?? "";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = useMemo(() => {
    try {
      return createBrowserSupabaseClient();
    } catch {
      return null;
    }
  }, []);

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(() => supabase !== null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [pendingNext, setPendingNext] = useState<string | null>(null);
  // Espejos en refs para leer el estado más reciente desde el callback
  // de onAuthStateChange (solo se escriben en manejadores, nunca en render).
  const loginOpenRef = useRef(false);
  const pendingNextRef = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    });    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        if (event === "SIGNED_OUT") setRole(null);
        // Al iniciar sesión con el modal abierto: cierra y redirige al destino.
        if (event === "SIGNED_IN" && loginOpenRef.current) {
          loginOpenRef.current = false;
          setIsLoginOpen(false);
          const next = pendingNextRef.current;
          pendingNextRef.current = null;
          setPendingNext(null);
          if (next) router.push(next);
          else router.refresh();
        }
      },
    );
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Rol del usuario actual (para mostrar el acceso a /admin). Se recarga
  // con cada cambio de sesión; al cerrar sesión lo limpia el listener
  // de onAuthStateChange (evento SIGNED_OUT).
  useEffect(() => {
    if (!session?.user) return;
    let mounted = true;
    fetch("/api/me/role", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { role: null }))
      .then((data: { role: UserRole | null }) => {
        if (mounted) setRole(data.role === "admin" ? "admin" : data.role === "user" ? "user" : null);
      })
      .catch(() => {
        if (mounted) setRole(null);
      });
    return () => {
      mounted = false;
    };
  }, [session]);

  const openLogin = useCallback((nextPath?: string) => {
    pendingNextRef.current = nextPath ?? null;
    setPendingNext(nextPath ?? null);
    loginOpenRef.current = true;
    setIsLoginOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    loginOpenRef.current = false;
    pendingNextRef.current = null;
    setPendingNext(null);
    setIsLoginOpen(false);
  }, []);

  const signInWithOAuth = useCallback(
    async (provider: OAuthProvider) => {
      if (!supabase) return;
      const next = pendingNext ?? "/";
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
    },
    [supabase, pendingNext],
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: "Supabase no está configurado." };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? error.message : null };
    },
    [supabase],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: "Supabase no está configurado.", needsConfirmation: false };
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message, needsConfirmation: false };
      return { error: null, needsConfirmation: !data.session };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.refresh();
  }, [supabase, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      role,
      isLoading,
      isLoginOpen,
      openLogin,
      closeLogin,
      signInWithOAuth,
      signInWithEmail,
      signUpWithEmail,
      signOut,
    }),
    [
      user,
      session,
      role,
      isLoading,
      isLoginOpen,
      openLogin,
      closeLogin,
      signInWithOAuth,
      signInWithEmail,
      signUpWithEmail,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  return ctx;
}
