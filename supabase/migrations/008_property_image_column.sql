-- Migración 008: compatibiliza la columna `image` (foto principal legacy).
--
-- Contexto: la tabla remota se creó sin la columna `image` (solo `images[]`,
-- cuyo elemento [1] es la foto principal), mientras que la migración local 001
-- sí la incluye como NOT NULL. El dashboard admin lee/escribe ambas.
-- Esta migración añade la columna en remoto y la rellena desde `images[1]`.
-- Es idempotente: se puede ejecutar varias veces sin error.

alter table public.properties
  add column if not exists image text;

update public.properties
  set image = images[1]
  where (image is null or image = '')
    and images is not null
    and array_length(images, 1) >= 1;
