"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getSavedPropertyIds, toggleSavedProperty } from "@/lib/actions/saved";
import { useAuth } from "@/lib/auth/AuthProvider";

interface SavedContextValue {
  /** Ids guardados por el usuario actual (vacío para invitados). */
  savedIds: Set<string>;
  toggle: (propertyId: string) => Promise<void>;
}

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({
  initialIds,
  children,
}: {
  initialIds: string[];
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set(initialIds));
  const [prevUserId, setPrevUserId] = useState<string | undefined>(() => user?.id);

  // Al cambiar de cuenta (login/logout), limpia durante el render y deja
  // que el efecto recargue los favoritos del nuevo usuario.
  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    setSavedIds(new Set());
  }

  // Recarga los favoritos al cambiar de sesión.
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    getSavedPropertyIds().then((ids) => {
      if (mounted) setSavedIds(new Set(ids));
    });
    return () => {
      mounted = false;
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback(async (propertyId: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) next.delete(propertyId);
      else next.add(propertyId);
      return next;
    });
    try {
      const { saved } = await toggleSavedProperty(propertyId);
      // Reconcilia con el servidor por si hubo carrera concurrente.
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (saved) next.add(propertyId);
        else next.delete(propertyId);
        return next;
      });
    } catch {
      // Revierte el optimismo si falla (p. ej. pierde la sesión).
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (next.has(propertyId)) next.delete(propertyId);
        else next.add(propertyId);
        return next;
      });
    }
  }, []);

  const value = useMemo<SavedContextValue>(
    () => ({ savedIds, toggle }),
    [savedIds, toggle],
  );

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved debe usarse dentro de <SavedProvider>.");
  return ctx;
}
