const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '../../.env');
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...value] = trimmed.split('=');
    if (key && value) {
      env[key.trim()] = value.join('=').trim();
    }
  });
  return {
    url: env.SUPABASE_URL,
    key: env.SUPABASE_SERVICE_ROLE_KEY
  };
}

async function run() {
  const config = loadEnv();
  const supabase = createClient(config.url, config.key);
  
  // Select from pg_catalog to get all tables in public schema
  const { data, error } = await supabase.rpc('inspect_schema_tables');
  if (error) {
    // If RPC doesn't exist, let's query some common tables or run a query via postgres if possible, or query some tables manually
    console.log('RPC inspect_schema_tables failed. Trying query via REST API on tables.');
    const tables = ['wargas', 'rumah_tanggas', 'rts', 'dasawismas', 'mutasi_penduduk', 'surat_pengajuan', 'pengumuman', 'program_pembangunan', 'pkk_partisipasi', 'user_profiles'];
    for (const t of tables) {
      const { data: row, error: err } = await supabase.from(t).select('*').limit(1);
      console.log(`Table ${t}: exists=${!err}, error=${err ? err.message : 'none'}`);
    }
  } else {
    console.log('Tables:', data);
  }
}

run();
