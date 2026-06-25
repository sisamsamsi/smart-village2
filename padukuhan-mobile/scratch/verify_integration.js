const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse env variables from root .env or padukuhan-mobile/.env
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '../../.env'),
    path.join(__dirname, '../.env'),
  ];
  
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
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
      if (env.SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL) {
        return {
          url: env.SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL,
          key: env.SUPABASE_SERVICE_ROLE_KEY || env.EXPO_PUBLIC_SUPABASE_ANON_KEY
        };
      }
    }
  }
  throw new Error("Could not find database env configuration.");
}

async function verify() {
  console.log("=== STARTING INTEGRATION VERIFICATION ===");
  const config = loadEnv();
  console.log("Using URL:", config.url);
  
  const supabase = createClient(config.url, config.key);
  
  // 1. Fetch reference RT and Dasawisma to get valid foreign keys
  console.log("\n--- STEP 1: FETCHING RT AND DASAWISMA REFERENCE ---");
  const { data: rts, error: rtErr } = await supabase.from('rts').select('*').limit(1);
  if (rtErr) throw rtErr;
  if (!rts || rts.length === 0) throw new Error("No RTs found in database. Seed data first.");
  
  const testRt = rts[0];
  console.log(`Using RT: id=${testRt.id}, nomor_rt=${testRt.nomor_rt}`);
  
  // 2. Citizens CRUD (wargas)
  console.log("\n--- STEP 2: Citizen (wargas) CRUD Flow ---");
  const citizenId = '99999999-9999-9999-9999-999999999999'; // static GUID for test
  
  // Clean up any old test warga
  await supabase.from('wargas').delete().eq('id', citizenId);
  
  // Create citizen
  console.log("Creating test citizen...");
  const newWarga = {
    id: citizenId,
    rt_id: testRt.id,
    nik: '1234567890123456',
    nama_lengkap: 'TEST CITIZEN MOCK INTEGRATION',
    tempat_lahir: 'Bantul',
    tanggal_lahir: '1990-01-01',
    jenis_kelamin: 'L',
    agama: 'ISLAM',
    pekerjaan: 'PNS',
    status_perkawinan: 'belum_kawin',
    status_dalam_keluarga: 'kepala_keluarga',
    status_warga: 'aktif',
    status_kehamilan: false,
    status_menyusui: false
  };
  
  const { data: createdWarga, error: createErr } = await supabase
    .from('wargas')
    .insert([newWarga])
    .select()
    .single();
    
  if (createErr) {
    console.error("Failed to create warga:", createErr);
    throw createErr;
  }
  console.log("Successfully created warga:", createdWarga.nama_lengkap);
  
  // Read citizen
  console.log("Reading test citizen...");
  const { data: fetchedWarga, error: readErr } = await supabase
    .from('wargas')
    .select('*, rts:rt_id(nomor_rt)')
    .eq('id', citizenId)
    .single();
    
  if (readErr) {
    console.error("Failed to read warga:", readErr);
    throw readErr;
  }
  console.log("Successfully read warga:", fetchedWarga.nama_lengkap, "RT:", fetchedWarga.rts?.nomor_rt);
  
  // Update citizen
  console.log("Updating test citizen...");
  const { data: updatedWarga, error: updateErr } = await supabase
    .from('wargas')
    .update({ pekerjaan: 'WIRAUSAHA', status_kehamilan: true })
    .eq('id', citizenId)
    .select()
    .single();
    
  if (updateErr) {
    console.error("Failed to update warga:", updateErr);
    throw updateErr;
  }
  console.log("Successfully updated warga. New Job:", updatedWarga.pekerjaan, "Hamil:", updatedWarga.status_kehamilan);
  
  // 3. Letters CRUD (surat_pengajuan)
  console.log("\n--- STEP 3: Letter (surat_pengajuan) CRUD Flow ---");
  const letterId = '88888888-8888-8888-8888-888888888888';
  
  // Clean up any old test letter
  await supabase.from('surat_pengajuan').delete().eq('id', letterId);
  
  // Create letter - verifying direct issuance constraints (needs nomor_surat, status 'selesai')
  console.log("Issuing direct letter (Surat Pengantar RT)...");
  const newSurat = {
    id: letterId,
    warga_id: citizenId,
    rt_id: testRt.id,
    jenis_surat: 'pengantar_rt',
    nomor_surat: '123/RT-01/VI/2026',
    keperluan: 'Mengurus KTP Baru',
    status: 'selesai',
    diajukan_via: 'rt'
  };
  
  const { data: createdSurat, error: createSuratErr } = await supabase
    .from('surat_pengajuan')
    .insert([newSurat])
    .select()
    .single();
    
  if (createSuratErr) {
    console.error("Failed to issue letter:", createSuratErr);
    throw createSuratErr;
  }
  console.log("Successfully issued letter: ID =", createdSurat.id, "No =", createdSurat.nomor_surat, "Status =", createdSurat.status);
  
  // Read letter
  console.log("Reading test letter...");
  const { data: fetchedSurat, error: readSuratErr } = await supabase
    .from('surat_pengajuan')
    .select('*, wargas(nama_lengkap)')
    .eq('id', letterId)
    .single();
    
  if (readSuratErr) {
    console.error("Failed to read letter:", readSuratErr);
    throw readSuratErr;
  }
  console.log("Successfully read letter for warga:", fetchedSurat.wargas?.nama_lengkap, "Type:", fetchedSurat.jenis_surat);
  
  // 4. Mutations CRUD (mutasi_penduduk)
  console.log("\n--- STEP 4: Citizen Mutation (mutasi_penduduk) CRUD Flow ---");
  const mutasiId = '77777777-7777-7777-7777-777777777777';
  
  // Clean up any old test mutasi
  await supabase.from('mutasi_penduduk').delete().eq('id', mutasiId);
  
  // Create mutation - death (should trigger trigger/side-effect to change status_warga to 'meninggal')
  console.log("Creating death mutation...");
  const newMutasi = {
    id: mutasiId,
    warga_id: citizenId,
    rt_id: testRt.id,
    jenis_mutasi: 'kematian',
    tanggal_mutasi: new Date().toISOString().split('T')[0],
    keterangan: 'Meninggal sakit usia tua'
  };
  
  const { data: createdMutasi, error: createMutasiErr } = await supabase
    .from('mutasi_penduduk')
    .insert([newMutasi])
    .select()
    .single();
    
  if (createMutasiErr) {
    console.error("Failed to create mutasi:", createMutasiErr);
    throw createMutasiErr;
  }
  console.log("Successfully created mutasi:", createdMutasi.jenis_mutasi);
  
  // Verify side effect: citizen status updated (like useCreateMutasi hook does)
  // The hook does:
  // if (payload.jenis_mutasi === 'kematian') await supabase.from('wargas').update({ status_warga: 'meninggal' }).eq('id', payload.warga_id)
  console.log("Updating citizen status to 'meninggal' following death mutation...");
  const { data: updatedWargaStatus, error: updateStatusErr } = await supabase
    .from('wargas')
    .update({ status_warga: 'meninggal' })
    .eq('id', citizenId)
    .select()
    .single();
    
  if (updateStatusErr) {
    console.error("Failed to update status_warga to meninggal:", updateStatusErr);
    throw updateStatusErr;
  }
  console.log("Citizen status_warga successfully updated to:", updatedWargaStatus.status_warga);
  
  // 5. Clean up all created test entities
  console.log("\n--- STEP 5: CLEANUP TEST ENTITIES ---");
  await supabase.from('mutasi_penduduk').delete().eq('id', mutasiId);
  await supabase.from('surat_pengajuan').delete().eq('id', letterId);
  await supabase.from('wargas').delete().eq('id', citizenId);
  console.log("Successfully cleaned up all integration test entities!");
  
  console.log("\n=== INTEGRATION VERIFICATION SUCCESSFUL ===");
}

verify().catch(err => {
  console.error("Integration verification failed with error:", err);
  process.exit(1);
});
