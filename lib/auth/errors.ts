/**
 * Traduce los mensajes de error en inglés que devuelve Supabase Auth
 * (GoTrue) a claves de nuestro diccionario i18n.
 * Se compara por patrones insensibles a mayúsculas para resistir
 * pequeños cambios de texto entre versiones de GoTrue.
 * Todo lo no reconocido cae en `auth.errorDefault`.
 */
const patterns: Array<[RegExp, string]> = [
  [/banned|user_banned/i, "auth.errors.userBanned"],
  [/rate limit/i, "auth.errors.rateLimited"],
  [/already (been )?registered|already exists|duplicate/i, "auth.errors.userExists"],
  [/invalid login credentials/i, "auth.errors.invalidCredentials"],
  [/email not confirmed/i, "auth.errors.emailNotConfirmed"],
  [/password.*(least|valid|short)|weak password/i, "auth.errors.weakPassword"],
  [/signups? not allowed|signup.*disabled/i, "auth.errors.signupDisabled"],
  [/session missing|no session|user not found/i, "auth.errors.sessionMissing"],
  [/should be different|same password/i, "auth.errors.samePassword"],
];

export function authErrorKey(raw: string | null | undefined): string {
  if (!raw) return "auth.errorDefault";
  for (const [re, key] of patterns) {
    if (re.test(raw)) return key;
  }
  return "auth.errorDefault";
}
