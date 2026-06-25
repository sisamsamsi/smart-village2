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
  
  // Select one row from mutasi_penduduk to inspect columns
  const { data, error } = await supabase.from('mutasi_penduduk').select('*').limit(1);
  if (error) {
    console.error('Error selecting mutasi_penduduk:', error);
  } else {
    console.log('Sample Mutasi Penduduk Row:', data);
  }
}

run();
