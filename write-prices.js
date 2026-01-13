const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.from('itinerario').select('titulo, precio');
    if (error) {
        fs.writeFileSync('output-prices.txt', 'ERROR: ' + error.message);
    } else {
        fs.writeFileSync('output-prices.txt', JSON.stringify(data, null, 2));
    }
    process.exit(0);
}

run();
