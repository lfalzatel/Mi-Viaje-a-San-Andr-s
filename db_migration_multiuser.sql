-- Migration: Soporte para Multi-Usuario y Progreso Independiente (Idempotente)
-- Ejecuta esto en el Editor SQL de Supabase

-- 1. Asegurar columnas de user_id
ALTER TABLE "public"."gastos" ADD COLUMN IF NOT EXISTS "user_id" "uuid" REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."equipaje" ADD COLUMN IF NOT EXISTS "user_id" "uuid" REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."lugares" ADD COLUMN IF NOT EXISTS "user_id" "uuid" REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."itinerario" ADD COLUMN IF NOT EXISTS "lat" NUMERIC(10, 8);
ALTER TABLE "public"."itinerario" ADD COLUMN IF NOT EXISTS "lng" NUMERIC(11, 8);
ALTER TABLE "public"."lugares" ADD COLUMN IF NOT EXISTS "lat" NUMERIC(10, 8);
ALTER TABLE "public"."lugares" ADD COLUMN IF NOT EXISTS "lng" NUMERIC(11, 8);

-- 2. Tablas de progreso
CREATE TABLE IF NOT EXISTS "public"."itinerario_progreso" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" REFERENCES "auth"."users"("id") ON DELETE CASCADE NOT NULL,
    "itinerario_id" "uuid" REFERENCES "public"."itinerario"("id") ON DELETE CASCADE NOT NULL,
    "completado" BOOLEAN DEFAULT false NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now"() NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("user_id", "itinerario_id")
);

CREATE TABLE IF NOT EXISTS "public"."lugares_progreso" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" REFERENCES "auth"."users"("id") ON DELETE CASCADE NOT NULL,
    "lugar_id" "uuid" REFERENCES "public"."lugares"("id") ON DELETE CASCADE NOT NULL,
    "visitado" BOOLEAN DEFAULT false NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now"() NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("user_id", "lugar_id")
);

CREATE TABLE IF NOT EXISTS "public"."equipaje_progreso" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" REFERENCES "auth"."users"("id") ON DELETE CASCADE NOT NULL,
    "item_id" "uuid" REFERENCES "public"."equipaje"("id") ON DELETE CASCADE NOT NULL,
    "empacado" BOOLEAN DEFAULT false NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now"() NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("user_id", "item_id")
);

-- 3. Habilitar RLS
ALTER TABLE "public"."gastos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."itinerario_progreso" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."lugares_progreso" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."equipaje_progreso" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."equipaje" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."lugares" ENABLE ROW LEVEL SECURITY;

-- 4. Políticas (Limpiar antes de crear para evitar errores de 'already exists')

-- Gastos
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios gastos" ON "public"."gastos";
CREATE POLICY "Usuarios pueden ver sus propios gastos" ON "public"."gastos"
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Itinerario Progreso
DROP POLICY IF EXISTS "Usuarios pueden gestionar su progreso en itinerario" ON "public"."itinerario_progreso";
CREATE POLICY "Usuarios pueden gestionar su progreso en itinerario" ON "public"."itinerario_progreso"
    FOR ALL USING (auth.uid() = user_id);

-- Lugares Progreso
DROP POLICY IF EXISTS "Usuarios pueden gestionar su progreso en lugares" ON "public"."lugares_progreso";
CREATE POLICY "Usuarios pueden gestionar su progreso en lugares" ON "public"."lugares_progreso"
    FOR ALL USING (auth.uid() = user_id);

-- Equipaje Progreso
DROP POLICY IF EXISTS "Usuarios pueden gestionar su progreso en equipaje" ON "public"."equipaje_progreso";
CREATE POLICY "Usuarios pueden gestionar su progreso en equipaje" ON "public"."equipaje_progreso"
    FOR ALL USING (auth.uid() = user_id);

-- Equipaje (Items Privados)
DROP POLICY IF EXISTS "Usuarios pueden ver items de equipaje propios o compartidos" ON "public"."equipaje";
CREATE POLICY "Usuarios pueden ver items de equipaje propios o compartidos" ON "public"."equipaje"
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Usuarios pueden crear sus propios items de equipaje" ON "public"."equipaje";
CREATE POLICY "Usuarios pueden crear sus propios items de equipaje" ON "public"."equipaje"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden editar/borrar sus propios items de equipaje" ON "public"."equipaje";
CREATE POLICY "Usuarios pueden editar/borrar sus propios items de equipaje" ON "public"."equipaje"
    FOR ALL USING (auth.uid() = user_id);

-- Lugares (Items Privados)
DROP POLICY IF EXISTS "Usuarios pueden ver lugares propios o compartidos" ON "public"."lugares";
CREATE POLICY "Usuarios pueden ver lugares propios o compartidos" ON "public"."lugares"
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Usuarios pueden crear sus propios lugares" ON "public"."lugares";
CREATE POLICY "Usuarios pueden crear sus propios lugares" ON "public"."lugares"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden editar/borrar sus propios lugares" ON "public"."lugares";
CREATE POLICY "Usuarios pueden editar/borrar sus propios lugares" ON "public"."lugares"
    FOR ALL USING (auth.uid() = user_id);
