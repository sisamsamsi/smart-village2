import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log('Using URL:', supabaseUrl);
  
  const { count, error: cError } = await supabase
    .from('wargas')
    .select('*', { count: 'exact', head: true });
  
  console.log('Total wargas count:', count);
  if (cError) console.error('Count Error:', cError);

  const { data: sample, error: sError } = await supabase
    .from('wargas')
    .select('*')
    .limit(1);
    
  console.log('Sample warga:', sample);
  if (sError) console.error('Sample Error:', sError);
}

inspect();
