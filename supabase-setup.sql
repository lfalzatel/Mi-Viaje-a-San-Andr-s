-- Script para crear las tablas en Supabase
-- Copia y pega esto en el SQL Editor de Supabase

-- Tabla de itinerario
CREATE TABLE IF NOT EXISTS itinerario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    hora TIME,
    ubicacion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabla de gastos
CREATE TABLE IF NOT EXISTS gastos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria TEXT NOT NULL,
    monto NUMERIC(10, 2) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabla de lugares
CREATE TABLE IF NOT EXISTS lugares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT NOT NULL,
    visitado BOOLEAN DEFAULT false,
    prioridad INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tabla de equipaje
CREATE TABLE IF NOT EXISTS equipaje (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item TEXT NOT NULL,
    categoria TEXT NOT NULL,
    empacado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_itinerario_fecha ON itinerario(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria);
CREATE INDEX IF NOT EXISTS idx_lugares_categoria ON lugares(categoria);
CREATE INDEX IF NOT EXISTS idx_lugares_visitado ON lugares(visitado);
CREATE INDEX IF NOT EXISTS idx_equipaje_categoria ON equipaje(categoria);
CREATE INDEX IF NOT EXISTS idx_equipaje_empacado ON equipaje(empacado);

-- Habilitar Row Level Security (RLS)
ALTER TABLE itinerario ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lugares ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipaje ENABLE ROW LEVEL SECURITY;

-- Políticas para acceso público (puedes ajustarlas según tus necesidades)
-- IMPORTANTE: Estas políticas permiten acceso completo sin autenticación
-- Si quieres restringir el acceso, necesitarás implementar autenticación

CREATE POLICY "Permitir todo en itinerario" ON itinerario FOR ALL USING (true);
CREATE POLICY "Permitir todo en gastos" ON gastos FOR ALL USING (true);
CREATE POLICY "Permitir todo en lugares" ON lugares FOR ALL USING (true);
CREATE POLICY "Permitir todo en equipaje" ON equipaje FOR ALL USING (true);

-- Opcional: Datos de ejemplo para probar
-- Descomenta las siguientes líneas si quieres algunos datos iniciales

-- INSERT INTO lugares (nombre, descripcion, categoria, prioridad) VALUES
-- ('Johnny Cay', 'Pequeña isla con playa paradisíaca y mar cristalino', 'playa', 3),
-- ('Acuario de San Andrés', 'Piscina natural con peces de colores', 'naturaleza', 3),
-- ('Hoyo Soplador', 'Fenómeno natural donde el agua sale disparada', 'turistico', 2),
-- ('Playa Spratt Bight', 'Playa principal con todos los servicios', 'playa', 2),
-- ('West View', 'Excelente para snorkel y buceo', 'actividad', 3);

-- INSERT INTO equipaje (item, categoria) VALUES
-- ('Traje de baño', 'ropa'),
-- ('Bloqueador solar', 'playa'),
-- ('Cédula', 'documentos'),
-- ('Cargador de celular', 'electronica'),
-- ('Toalla de playa', 'playa');
