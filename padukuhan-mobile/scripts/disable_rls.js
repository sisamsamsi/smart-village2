// Script to disable RLS on all tables using Supabase Management API
// Requires: SUPABASE_ACCESS_TOKEN environment variable
// Get your token from: https://supabase.com/dashboard/account/tokens

const https = require('https');

const PROJECT_REF = 'ouvkmlfbvhtpqqrtcesn';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('ERROR: SUPABASE_ACCESS_TOKEN not set.');
  console.error('');
  console.error('Cara mendapatkan token:');
  console.error('1. Buka https://supabase.com/dashboard/account/tokens');
  console.error('2. Klik "Generate new token"');
  console.error('3. Copy token, lalu jalankan:');
  console.error('');
  console.error('   $env:SUPABASE_ACCESS_TOKEN="your_token_here"');
  console.error('   node scripts/disable_rls.js');
  process.exit(1);
}

const sql = `
ALTER TABLE public.wargas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rumah_tanggas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dasawismas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutasi_penduduk DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengumuman DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat_pengajuan DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pkk_partisipasi DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan_kejadian DISABLE ROW LEVEL SECURITY;

SELECT tablename, rowsecurity as rls_enabled 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
`;

const body = JSON.stringify({ query: sql });

const options = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${PROJECT_REF}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ RLS berhasil dinonaktifkan pada semua tabel!');
      console.log('');
      try {
        const result = JSON.parse(data);
        if (Array.isArray(result)) {
          console.log('Status RLS tabel:');
          console.log('-'.repeat(40));
          result.forEach(r => {
            console.log(`  ${r.tablename}: RLS = ${r.rls_enabled ? 'ON' : 'OFF'}`);
          });
        } else {
          console.log('Response:', JSON.stringify(result, null, 2));
        }
      } catch (e) {
        console.log('Response:', data);
      }
    } else {
      console.error(`❌ Error (${res.statusCode}):`, data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(body);
req.end();
