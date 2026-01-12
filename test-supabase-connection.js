
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local manually since we are running a standalone script
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('--- Diagnóstico de Supabase ---');
console.log(`URL configurada: ${supabaseUrl}`);
console.log(`Key configurada: ${supabaseKey ? 'Presente' : 'Faltante'}`);

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Faltan variables de entorno.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Intentando conectar...');
    try {
        const { data, error } = await supabase.from('itinerario').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Error de conexión:', error.message);
            if (error.code) console.error('Código:', error.code);
            if (error.hint) console.error('Pista:', error.hint);
        } else {
            console.log('✅ ¡Conexión exitosa!');
            console.log('La tabla "itinerario" responde.');
        }
    } catch (err) {
        console.error('❌ Error inesperado:', err.message);
    }
}

testConnection();
