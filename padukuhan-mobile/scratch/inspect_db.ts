import { supabase } from '../lib/supabase';

async function inspect() {
  const { data: surat, error: sError } = await supabase.from('surat_pengajuan').select('*').limit(1);
  console.log('Surat Pengajuan sample:', surat);
  if (sError) console.error('Surat Error:', sError);

  const { data: warga, error: wError } = await supabase.from('wargas').select('*').limit(1);
  console.log('Wargas sample:', warga);
  if (wError) console.error('Wargas Error:', wError);
}

inspect();
