import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing for root .env
const rootEnvPath = 'd:/smart-village/.env';
const envContent = fs.readFileSync(rootEnvPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.join('=').trim();
  }
});

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log('Checking User Profiles...');
  const { data: profiles, error } = await supabase.from('user_profiles').select('*');
  
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('User Profiles:', profiles);
  }

  const { count: wargaCount } = await supabase.from('wargas').select('*', { count: 'exact', head: true });
  const { count: kkCount } = await supabase.from('rumah_tanggas').select('*', { count: 'exact', head: true });
  
  console.log('Counts - Wargas:', wargaCount, 'KK:', kkCount);
}

inspect();
