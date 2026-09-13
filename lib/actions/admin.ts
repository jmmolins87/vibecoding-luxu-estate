"use server";

import { revalidatePath } from "next/cache";
import { createAuthServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";
import { ADMIN_ROLE, type UserRole } from "@/lib/auth/roles";
import type { Property } from "@/types/property";
import type { PropertyFilters } from "@/lib/filters";

/* ------------------------------------------------------------------ */
/* Guardias                                                            */
/* ------------------------------------------------------------------ */

async function requireAdminUserId(): Promise<string> {
  const supabase = await createAuthServerSupabaseClient();
  if (!supabase) throw new Error("Supabase no está configurado.");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesión requerida.");

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleRow?.role !== ADMIN_ROLE) throw new Error("Se requiere rol de administrador.");
  return user.id;
}

function requireService() {
  const service = createServiceSupabaseClient();
  if (!service) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor.",
    );
  }
  return service;
}

/* ------------------------------------------------------------------ */
/* Propiedades (lectura paginada + CRUD completo)                      */
/* ------------------------------------------------------------------ */

/** Acota el tamaño de página entre 1 y 100. */
function clampPageSize(value: number): number {
  if (!Number.isFinite(value)) return 10;
  return Math.min(100, Math.max(1, Math.floor(value)));
}

/** Escapa `%`, `_` y `\` para búsquedas `ilike` literales. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}

export interface AdminPropertyRow {
  id: string;
  slug: string | null;
  title: string;
  location: string;
  address: string;
  price: number;
  price_suffix: string | null;
  type: string;
  status: string;
  beds: number;
  baths: number;
  area: number;
  garage: number;
  image: string;
  tag: string | null;
  featured: boolean;
  /** Desactivación lógica: el admin ve todas, la web solo las activas. */
  is_active: boolean;
  created_at: string;
}

export async function getAdminProperties(
  options?: { page?: number; pageSize?: number; query?: string } & PropertyFilters,
): Promise<{
  rows: AdminPropertyRow[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}> {
  await requireAdminUserId();
  const service = requireService();

  const pageSize = clampPageSize(options?.pageSize ?? 10);
  const query = options?.query?.trim() ?? "";

  const buildBase = () => {
    let base = service
      .from("properties")
      .select(
        "id, slug, title, location, address, price, price_suffix, type, status, beds, baths, area, garage, image, tag, featured, is_active, created_at",
        { count: "exact" },
      );
    if (query !== "") {
      const like = `%${escapeLike(query)}%`;
      base = base.or(
        `title.ilike.${like},location.ilike.${like},address.ilike.${like},id.ilike.${like}`,
      );
    }
    // Filtros de la modal compartida con la web (misma semántica).
    const f = options ?? {};
    if (f.status === "sale" || f.status === "rent") {
      base = base.eq("status", f.status);
    }
    const city = f.city?.trim();
    if (city) {
      const like = `%${escapeLike(city)}%`;
      base = base.or(`location.ilike.${like},address.ilike.${like}`);
    }
    if (typeof f.minPrice === "number") base = base.gte("price", f.minPrice);
    if (typeof f.maxPrice === "number") base = base.lte("price", f.maxPrice);
    if (typeof f.beds === "number") base = base.gte("beds", f.beds);
    if (typeof f.baths === "number") base = base.gte("baths", f.baths);
    if (f.type) base = base.eq("type", f.type);
    if (f.amenities && f.amenities.length > 0) {
      base = base.contains("amenities", f.amenities);
    }
    return base;
  };

  // Total primero para fijar la página válida (el count ignora el range).
  const { count, error: countError } = await buildBase();
  if (countError) throw new Error(countError.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, Math.floor(options?.page ?? 1)), totalPages);
  const from = (page - 1) * pageSize;

  const { data, error } = await buildBase()
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);
  if (error) throw new Error(error.message);

  // El admin ve activas e inactivas; `?? true` por compatibilidad con BD sin migrar.
  const rows = ((data ?? []) as AdminPropertyRow[]).map((r) => ({
    ...r,
    is_active: r.is_active ?? true,
  }));
  return { rows, total, totalPages, page, pageSize };
}

export interface AdminPropertyDetail extends AdminPropertyRow {
  image_alt: string;
  description: string;
  amenities: string[];
  images: string[];
  images_alt: string[];
  lat: number | null;
  lng: number | null;
  year_built: number | null;
}

/** Fila completa para precargar el formulario de edición. */
export async function getAdminPropertyById(id: string): Promise<AdminPropertyDetail | null> {
  await requireAdminUserId();
  const service = requireService();

  const { data, error } = await service
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as AdminPropertyDetail | null;
}

export interface PropertyFormInput {
  id: string;
  title: string;
  location: string;
  address: string;
  price: number;
  priceSuffix: string;
  type: Property["type"];
  status: "sale" | "rent" | "sold";
  beds: number;
  baths: number;
  area: number;
  garage: number;
  yearBuilt: string;
  image: string;
  imageAlt: string;
  tag: string;
  featured: boolean;
  slug: string;
  description: string;
  amenities: string;
  lat: string;
  lng: string;
  extraImages: string;
}

const PROPERTY_TYPES = ["House", "Apartment", "Villa", "Penthouse"] as const;
const PROPERTY_STATUS = ["sale", "rent", "sold"] as const;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function parsePropertyInput(input: PropertyFormInput) {
  const title = input.title.trim();
  const location = input.location.trim();
  const address = input.address.trim();
  if (!title || !location || !address) {
    throw new Error("Título, ubicación y dirección son obligatorios.");
  }
  if (!PROPERTY_TYPES.includes(input.type as (typeof PROPERTY_TYPES)[number])) {
    throw new Error("Tipo de propiedad no válido.");
  }
  if (!PROPERTY_STATUS.includes(input.status as (typeof PROPERTY_STATUS)[number])) {
    throw new Error("Estado no válido.");
  }

  const price = Number(input.price);
  if (!Number.isFinite(price) || price < 0) throw new Error("Precio no válido.");

  const id = (input.id.trim() || slugify(title)) ?? "";
  if (!id) throw new Error("Identificador no válido.");
  const slug = input.slug.trim() || `${slugify(title)}-${slugify(location)}`.slice(0, 100);

  const num = (v: unknown, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };
  const yearRaw = input.yearBuilt.trim();
  const yearBuilt =
    yearRaw === "" ? null : Math.trunc(Number(yearRaw));
  if (
    yearBuilt !== null &&
    (!Number.isFinite(yearBuilt) || yearBuilt < 1000 || yearBuilt > 2100)
  ) {
    throw new Error("Año de construcción no válido.");
  }
  const images = input.extraImages
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const mainImage = input.image.trim();
  const allImages = [mainImage, ...images.filter((u) => u !== mainImage)].filter(Boolean);
  if (allImages.length === 0) throw new Error("Se requiere al menos una imagen.");

  return {
    id,
    title,
    location,
    address,
    price,
    price_suffix: input.priceSuffix.trim() || null,
    type: input.type,
    status: input.status,
    beds: Math.trunc(num(input.beds)),
    baths: num(input.baths),
    area: num(input.area),
    garage: Math.trunc(num(input.garage)),
    year_built: yearBuilt,
    image: mainImage,
    image_alt: input.imageAlt.trim() || title,
    tag: input.tag.trim() || null,
    featured: Boolean(input.featured),
    slug,
    description: input.description.trim(),
    amenities: input.amenities
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    images: allImages,
    images_alt: allImages.map((_, i) => (i === 0 ? input.imageAlt.trim() || title : `${title} — photo ${i + 1}`)),
    lat: input.lat.trim() === "" ? null : Number(input.lat),
    lng: input.lng.trim() === "" ? null : Number(input.lng),
  };
}

const DEFAULT_AGENT = {
  name: "Sarah Jenkins",
  photo:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
  rating: "Top Rated Agent",
  phone: "+13105550142",
  whatsapp: "https://wa.me/13105550142",
};

export async function createProperty(input: PropertyFormInput): Promise<{ ok: true; id: string }> {
  await requireAdminUserId();
  const service = requireService();
  const row = parsePropertyInput(input);

  const { error } = await service.from("properties").insert({
    ...row,
    agent: DEFAULT_AGENT,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/properties");
  revalidatePath("/");
  return { ok: true, id: row.id };
}

export async function updateProperty(
  id: string,
  input: PropertyFormInput,
): Promise<{ ok: true }> {
  await requireAdminUserId();
  const service = requireService();
  const row = parsePropertyInput(input);

  const { id: _ignored, ...updatable } = row;
  void _ignored;
  const { error } = await service.from("properties").update(updatable).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/properties");
  revalidatePath("/");
  return { ok: true };
}

/**
 * Activa o desactiva una propiedad (desactivación lógica en vez de
 * borrado físico). Las desactivadas desaparecen de la web pública
 * pero siguen visibles en el panel admin para futuras actualizaciones.
 */
export async function setPropertyActive(
  id: string,
  active: boolean,
): Promise<{ ok: true }> {
  await requireAdminUserId();
  const service = requireService();

  const { error } = await service
    .from("properties")
    .update({ is_active: active })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/properties");
  revalidatePath("/");
  revalidatePath("/saved");
  revalidatePath("/property/[slug]", "page");
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Usuarios y roles                                                    */
/* ------------------------------------------------------------------ */

export interface AdminUserRow {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  bannedUntil: string | null;
  role: UserRole;
}

export async function getAdminUsers(
  options?: { page?: number; perPage?: number; query?: string; role?: UserRole },
): Promise<{
  users: AdminUserRow[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
}> {
  await requireAdminUserId();
  const service = requireService();

  const perPage = clampPageSize(options?.perPage ?? 10);
  const query = options?.query?.trim() ?? "";
  const roleFilter = options?.role;

  const buildBase = () => {
    let base = service
      .from("user_roles")
      .select("user_id, role, email", { count: "exact" });
    if (query !== "") {
      base = base.ilike("email", `%${escapeLike(query)}%`);
    }
    if (roleFilter === "admin" || roleFilter === "user") {
      base = base.eq("role", roleFilter);
    }
    return base;
  };

  // Total primero para fijar la página válida (el count ignora el range).
  const { count, error: countError } = await buildBase();
  if (countError) throw new Error(countError.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, Math.floor(options?.page ?? 1)), totalPages);
  const from = (page - 1) * perPage;

  const { data: rolesData, error: rolesError } = await buildBase()
    .order("email", { ascending: true })
    .range(from, from + perPage - 1);
  if (rolesError) throw new Error(rolesError.message);

  // Enriquece la página con los metadatos de auth (alta / último acceso).
  const rows = (rolesData ?? []) as { user_id: string; role: UserRole; email: string | null }[];
  const metas = await Promise.all(
    rows.map(async (r) => {
      const { data, error } = await service.auth.admin.getUserById(r.user_id);
      if (error || !data.user) return null;
      return data.user;
    }),
  );

  const users: AdminUserRow[] = rows.map((r, i) => {
    const meta = (metas[i]?.user_metadata ?? {}) as Record<string, unknown>;
    const metaName = meta.full_name ?? meta.name;
    const avatar = meta.avatar_url ?? meta.picture;
    return {
      id: r.user_id,
      email: r.email ?? metas[i]?.email ?? "—",
      displayName:
        typeof metaName === "string" && metaName.length > 0 ? metaName : null,
      avatarUrl:
        typeof avatar === "string" && avatar.length > 0 ? avatar : null,
      createdAt: metas[i]?.created_at ?? "",
      lastSignInAt: metas[i]?.last_sign_in_at ?? null,
      bannedUntil: metas[i]?.banned_until ?? null,
      role: r.role ?? "user",
    };
  });

  return { users, total, totalPages, page, perPage };
}

export async function updateUserRole(
  userId: string,
  role: UserRole,
): Promise<{ ok: true }> {
  const adminId = await requireAdminUserId();
  if (userId === adminId && role !== ADMIN_ROLE) {
    throw new Error("No puedes quitarte tu propio rol de administrador.");
  }
  if (role !== "admin" && role !== "user") throw new Error("Rol no válido.");

  const service = requireService();
  const { error } = await service
    .from("user_roles")
    .upsert({ user_id: userId, role }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { ok: true };
}

/**
 * Edita nombre, correo y/o contraseña de un usuario vía Auth Admin API.
 * El email de `user_roles` se sincroniza solo (trigger) y la contraseña
 * nunca sale de `auth.users`. Campos vacíos = sin cambio, salvo el nombre
 * (vacío lo borra). Exige sesión admin.
 */
export async function updateAdminUser(
  userId: string,
  input: { fullName?: string; email?: string; password?: string },
): Promise<{ ok: true }> {
  await requireAdminUserId();
  const service = requireService();

  const email = input.email?.trim() ?? "";
  const password = input.password ?? "";
  if (email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Correo no válido.");
  }
  if (password !== "" && password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }

  const attrs: {
    email?: string;
    password?: string;
    user_metadata?: Record<string, unknown>;
  } = {};
  if (email !== "") attrs.email = email;
  if (password !== "") attrs.password = password;
  if (input.fullName !== undefined) {
    const { data } = await service.auth.admin.getUserById(userId);
    const prev = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
    const fullName = input.fullName.trim();
    attrs.user_metadata = {
      ...prev,
      full_name: fullName === "" ? null : fullName,
    };
  }
  if (Object.keys(attrs).length === 0) throw new Error("Sin cambios.");

  const { error } = await service.auth.admin.updateUserById(userId, attrs);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  return { ok: true };
}

/**
 * Elimina un usuario de Auth (su fila en `user_roles` cae en cascada).
 * No permite autoeliminarse. Exige sesión admin.
 */
export async function deleteAdminUser(userId: string): Promise<{ ok: true }> {
  const adminId = await requireAdminUserId();
  if (userId === adminId) {
    throw new Error("No puedes eliminar tu propio usuario.");
  }
  const service = requireService();
  const { error } = await service.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  return { ok: true };
}

/**
 * Crea un usuario de Auth con email ya confirmado y su fila de rol.
 * El trigger `handle_new_user` crea la fila en `user_roles`, pero se hace
 * upsert explícito para fijar el rol pedido y no depender del trigger.
 * Exige sesión admin.
 */
export async function createAdminUser(
  input: { fullName?: string; email: string; password: string; role?: UserRole },
): Promise<{ ok: true }> {
  await requireAdminUserId();
  const service = requireService();

  const email = input.email.trim();
  const password = input.password;
  const fullName = input.fullName?.trim() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Correo no válido.");
  }
  if (password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }
  const role: UserRole = input.role === "admin" ? "admin" : "user";

  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: fullName === "" ? {} : { full_name: fullName },
  });
  if (error || !data.user) {
    throw new Error(error?.message ?? "No se pudo crear el usuario.");
  }

  const { error: roleError } = await service
    .from("user_roles")
    .upsert(
      { user_id: data.user.id, role, email },
      { onConflict: "user_id" },
    );
  if (roleError) throw new Error(roleError.message);

  revalidatePath("/admin/users");
  return { ok: true };
}

/**
 * Bloquea a un usuario (`ban_duration` de ~10 años): no podrá iniciar
 * sesión, pero conserva sus datos y su fila de rol. No permite
 * autobloqueo. Exige sesión admin.
 */
export async function banAdminUser(userId: string): Promise<{ ok: true }> {
  const adminId = await requireAdminUserId();
  if (userId === adminId) {
    throw new Error("No puedes bloquear tu propio usuario.");
  }
  const service = requireService();
  const { error } = await service.auth.admin.updateUserById(userId, {
    ban_duration: "87600h",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  return { ok: true };
}

/**
 * Desbloquea a un usuario baneado (`ban_duration: "none"`).
 * Exige sesión admin.
 */
export async function unbanAdminUser(userId: string): Promise<{ ok: true }> {
  await requireAdminUserId();
  const service = requireService();
  const { error } = await service.auth.admin.updateUserById(userId, {
    ban_duration: "none",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function getAdminStats(): Promise<{
  totalProperties: number;
  featuredCount: number;
  forSale: number;
  forRent: number;
  sold: number;
  totalUsers: number;
  adminCount: number;
}> {
  await requireAdminUserId();
  const service = requireService();

  const [{ count: totalProperties }, { data: all }, { data: users }] =
    await Promise.all([
      service.from("properties").select("*", { count: "exact", head: true }),
      service.from("properties").select("featured, status"),
      service.from("user_roles").select("role"),
    ]);

  const rows = (all ?? []) as { featured: boolean; status: string }[];
  const roleRows = (users ?? []) as { role: string }[];

  return {
    totalProperties: totalProperties ?? rows.length,
    featuredCount: rows.filter((r) => r.featured).length,
    forSale: rows.filter((r) => r.status === "sale").length,
    forRent: rows.filter((r) => r.status === "rent").length,
    sold: rows.filter((r) => r.status === "sold").length,
    totalUsers: roleRows.length,
    adminCount: roleRows.filter((r) => r.role === "admin").length,
  };
}
