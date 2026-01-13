-- Migration: Soporte para Multi-Usuario y Progreso Independiente
-- Ejecuta esto en el Editor SQL de Supabase

-- 1. Asegurar que la tabla de gastos tiene user_id
ALTER TABLE "public"."gastos" ADD COLUMN IF NOT EXISTS "user_id" "uuid" REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- 2. Tabla para seguimiento independiente del Itinerario
CREATE TABLE IF NOT EXISTS "public"."itinerario_progreso" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" REFERENCES "auth"."users"("id") ON DELETE CASCADE NOT NULL,
    "itinerario_id" "uuid" REFERENCES "public"."itinerario"("id") ON DELETE CASCADE NOT NULL,
    "completado" BOOLEAN DEFAULT false NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now"() NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("user_id", "itinerario_id")
);

-- 3. Tabla para seguimiento independiente de Lugares
CREATE TABLE IF NOT EXISTS "public"."lugares_progreso" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" REFERENCES "auth"."users"("id") ON DELETE CASCADE NOT NULL,
    "lugar_id" "uuid" REFERENCES "public"."lugares"("id") ON DELETE CASCADE NOT NULL,
    "visitado" BOOLEAN DEFAULT false NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now"() NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("user_id", "lugar_id")
);

-- 4. Tabla para seguimiento independiente de la Maleta/Equipaje
CREATE TABLE IF NOT EXISTS "public"."equipaje_progreso" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" REFERENCES "auth"."users"("id") ON DELETE CASCADE NOT NULL,
    "item_id" "uuid" REFERENCES "public"."equipaje"("id") ON DELETE CASCADE NOT NULL,
    "empacado" BOOLEAN DEFAULT false NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT "now"() NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("user_id", "item_id")
);

-- 5. Habilitar RLS (Row Level Security) para las nuevas tablas
ALTER TABLE "public"."itinerario_progreso" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."lugares_progreso" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."equipaje_progreso" ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de RLS
-- Gastos: Cada usuario ve sus propios gastos
CREATE POLICY "Usuarios pueden ver sus propios gastos" ON "public"."gastos"
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL); -- IS NULL para gastos compartidos heredados

-- Progreso: Cada usuario solo accede a su propio progreso
CREATE POLICY "Usuarios pueden gestionar su progreso en itinerario" ON "public"."itinerario_progreso"
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden gestionar su progreso en lugares" ON "public"."lugares_progreso"
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden gestionar su progreso en equipaje" ON "public"."equipaje_progreso"
    FOR ALL USING (auth.uid() = user_id);

-- 7. Equipaje: Cada usuario ve sus propios items o los globales
ALTER TABLE "public"."equipaje" ADD COLUMN IF NOT EXISTS "user_id" "uuid" REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."equipaje" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver items de equipaje propios o compartidos" ON "public"."equipaje"
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Usuarios pueden crear sus propios items de equipaje" ON "public"."equipaje"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden editar/borrar sus propios items de equipaje" ON "public"."equipaje"
    FOR ALL USING (auth.uid() = user_id);
