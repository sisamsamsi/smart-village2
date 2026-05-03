import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const { count: wargaCount } = await supabase.from('wargas').select('*', { count: 'exact', head: true });
  const { count: kkCount } = await supabase.from('rumah_tanggas').select('*', { count: 'exact', head: true });
  const { count: rtCount } = await supabase.from('rts').select('*', { count: 'exact', head: true });
  
  console.log('Wargas:', wargaCount);
  console.log('KK:', kkCount);
  console.log('RTs:', rtCount);
}

inspect();
