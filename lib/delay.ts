/**
 * Duración mínima visible de los estados de carga (loaders/skeletons).
 *
 * Todas las lecturas al backend que alimentan una pantalla con loader o
 * skeleton deben durar AL MENOS `MIN_BACKEND_MS`: si Supabase responde
 * antes, se espera el resto para que el feedback visual no parpadee.
 * Úsalo envolviendo la promesa en el Server Component que carga los datos:
 *
 *   const data = await withMinDuration(getAdminProperties({ page }));
 *
 * Envuelve UNA vez por navegación (p. ej. todo el `Promise.all`), no cada
 * subllamada, para no sumar ventanas de 500 ms en serie.
 * No lo uses en mutaciones (guardar/borrar/entrar): esas confirman al
 * instante con sus propios estados `pending` en los botones.
 */

export const MIN_BACKEND_MS = 500;

export function delay(ms: number = MIN_BACKEND_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Resuelve con el valor de `work`, esperando al menos `ms` en total. */
export async function withMinDuration<T>(
  work: Promise<T>,
  ms: number = MIN_BACKEND_MS,
): Promise<T> {
  const [result] = await Promise.all([work, delay(ms)]);
  return result;
}
