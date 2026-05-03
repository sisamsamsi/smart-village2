import sqlite3
import uuid
import os
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Configuration
URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SQLITE_PATH = os.getenv("SQLITE_DB_PATH", r"d:\smart-village\database_backup_20260430_205511.sqlite")

if not URL or not KEY:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    exit(1)

supabase: Client = create_client(URL, KEY)

# ID Mapping (legacy_id/number -> new_uuid)
rt_map = {} # nomor_rt -> new_uuid
dw_map = {} # nama_dasawisma -> new_uuid
dw_to_rt_map = {} # dw_uuid -> rt_uuid (from Supabase)
kk_map = {} # legacy_kk_id -> new_uuid

def sync_rts_and_dasawismas():
    """Sync existing RTs and Dasawismas from Supabase (already seeded via SQL)"""
    print("Syncing RTs and Dasawismas from Supabase...")
    
    # Sync RTs
    rt_res = supabase.table("rts").select("id, nomor_rt").execute()
    for item in rt_res.data:
        rt_map[item['nomor_rt']] = item['id']
    
    # Sync Dasawismas and their RT relation
    dw_res = supabase.table("dasawismas").select("id, nama_dasawisma, rt_id").execute()
    for item in dw_res.data:
        dw_map[item['nama_dasawisma']] = item['id']
        dw_to_rt_map[item['id']] = item['rt_id']
        
    print(f"Synced {len(rt_map)} RTs and {len(dw_map)} Dasawismas.")

def migrate_kk():
    print("Migrating Rumah Tanggas (KK)...")
    conn = sqlite3.connect(SQLITE_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM rumah_tanggas")
    columns = [description[0] for description in cursor.description]
    rows = cursor.fetchall()
    
    for row in rows:
        record = dict(zip(columns, row))
        legacy_id = record.get('id')
        new_id = str(uuid.uuid4())
        
        legacy_dw_id = record.get('dasawisma_id')
        new_dw_id = None
        new_rt_id = None
        
        if legacy_dw_id:
            cursor.execute("SELECT nama_dasawisma FROM dasawismas WHERE id = ?", (legacy_dw_id,))
            dw_info = cursor.fetchone()
            if dw_info:
                nama_dw = dw_info[0]
                new_dw_id = dw_map.get(nama_dw)
                new_rt_id = dw_to_rt_map.get(new_dw_id)

        if not new_rt_id:
            cursor.execute("SELECT rt FROM wargas WHERE rumah_tangga_id = ? LIMIT 1", (legacy_id,))
            rt_res = cursor.fetchone()
            if rt_res:
                try:
                    rt_num = int(rt_res[0])
                    new_rt_id = rt_map.get(rt_num)
                except: pass
        
        if not new_rt_id:
            new_rt_id = rt_map.get(1)

        data = {
            "id": new_id,
            "rt_id": new_rt_id,
            "dasawisma_id": new_dw_id,
            "no_kk": record.get('no_kk'),
            "nama_kepala_keluarga": record.get('nama_kepala_rumah_tangga'),
            "alamat_detail": record.get('alamat_detail'),
            "no_reg": str(record.get('id')), 
            "makanan_pokok": record.get('makanan_pokok', 'beras'),
            "memiliki_jamban": bool(record.get('punya_jamban')),
            "jumlah_jamban": record.get('jumlah_jamban', 0),
            "sumber_air": record.get('sumber_air', 'pdam').lower(),
            "memiliki_tempat_sampah": bool(record.get('punya_tempat_sampah')),
            "memiliki_spal": bool(record.get('punya_spal')),
            "menempel_stiker_p4k": bool(record.get('tempel_stiker_p4k')),
            "kriteria_rumah": record.get('kriteria_rumah', 'sehat_layak_huni'),
            "aktivitas_up2k": bool(record.get('aktivitas_up2k')),
            "pemanfaatan_pekarangan": bool(record.get('pemanfaatan_pekarangan', False)),
            "industri_rumah_tangga": bool(record.get('industri_rumah_tangga', False))
        }
        
        if data["sumber_air"] not in ['pdam', 'sumur', 'sungai', 'lainnya']:
            data["sumber_air"] = 'lainnya'
            
        supabase.table("rumah_tanggas").insert(data).execute()
        kk_map[legacy_id] = new_id
        
    print(f"Migrated {len(rows)} Rumah Tanggas.")
    conn.close()

def migrate_wargas():
    print("Migrating Wargas...")
    conn = sqlite3.connect(SQLITE_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM wargas")
    columns = [description[0] for description in cursor.description]
    rows = cursor.fetchall()
    
    kk_to_rt_supabase = {}
    kk_res = supabase.table("rumah_tanggas").select("id, rt_id").execute()
    for item in kk_res.data:
        kk_to_rt_supabase[item['id']] = item['rt_id']

    chunk_size = 50
    for i in range(0, len(rows), chunk_size):
        chunk = rows[i:i + chunk_size]
        batch_data = []
        
        for row in chunk:
            record = dict(zip(columns, row))
            legacy_kk_id = record.get('rumah_tangga_id')
            kk_uuid = kk_map.get(legacy_kk_id)
            
            # --- FIX: Create Dummy KK if missing ---
            if not kk_uuid:
                dummy_key = legacy_kk_id if legacy_kk_id else "GLOBAL_ORPHAN_KK"
                if dummy_key not in kk_map:
                    print(f"Warning: Warga {record.get('nama_lengkap')} (NIK: {record.get('nik')}) tidak punya KK valid. Membuatkan KK Dummy...")
                    new_kk_uuid = str(uuid.uuid4())
                    dummy_no_kk = "9999999999999999"
                    dummy_kk = {
                        "id": new_kk_uuid,
                        "rt_id": rt_map.get(1),
                        "no_kk": dummy_no_kk,
                        "nama_kepala_keluarga": f"DUMMY ({record.get('nama_lengkap')})",
                        "alamat_detail": "Data hasil migrasi - KK asli tidak ditemukan",
                        "no_reg": 999999
                    }
                    supabase.table("rumah_tanggas").insert(dummy_kk).execute()
                    kk_map[dummy_key] = new_kk_uuid
                    kk_to_rt_supabase[new_kk_uuid] = rt_map.get(1)
                kk_uuid = kk_map[dummy_key]

            try:
                rt_num = int(record.get('rt')) if record.get('rt') else None
                rt_id = rt_map.get(rt_num)
            except:
                rt_id = None
                
            if not rt_id and kk_uuid:
                rt_id = kk_to_rt_supabase.get(kk_uuid)
                
            if not rt_id:
                rt_id = rt_map.get(1)

            data = {
                "id": str(uuid.uuid4()),
                "rumah_tangga_id": kk_uuid,
                "rt_id": rt_id,
                "no_reg": str(record.get('id')),
                "nik": record.get('nik'),
                "nama_lengkap": record.get('nama_lengkap'),
                "tempat_lahir": record.get('tempat_lahir'),
                "tanggal_lahir": record.get('tanggal_lahir'),
                "jenis_kelamin": 'L' if record.get('jenis_kelamin') in ['L', 'Laki-laki'] else 'P',
                "agama": record.get('agama'),
                "pendidikan": record.get('pendidikan_terakhir'),
                "pekerjaan": record.get('pekerjaan'),
                "jabatan": record.get('jabatan'),
                "status_perkawinan": map_perkawinan(record.get('status_perkawinan')),
                "status_dalam_keluarga": map_hubungan(record.get('hubungan_keluarga')),
                "status_warga": map_status_warga(record.get('status_hidup')),
                "berkebutuhan_khusus": bool(record.get('berkebutuhan_khusus')),
                "akseptor_kb": bool(record.get('akseptor_kb')),
                "aktif_posyandu": bool(record.get('aktif_posyandu')),
                "ikut_bkb": bool(record.get('ikut_bkb')),
                "ikut_paud": bool(record.get('ikut_paud')),
                "ikut_koperasi": bool(record.get('ikut_koperasi')),
                "memiliki_akte": bool(record.get('memiliki_akte'))
            }
            batch_data.append(data)
            
        supabase.table("wargas").insert(batch_data).execute()
        print(f"Migrated {i + len(chunk)} / {len(rows)} Wargas...")
        
    conn.close()

def map_perkawinan(val):
    v = str(val).lower()
    if 'belum' in v: return 'belum_kawin'
    if 'cerai hidup' in v: return 'cerai_hidup'
    if 'cerai mati' in v: return 'cerai_mati'
    if 'kawin' in v: return 'kawin'
    return 'belum_kawin'

def map_hubungan(val):
    v = str(val).lower()
    mapping = {
        'kepala keluarga': 'kepala_keluarga',
        'istri': 'istri',
        'anak': 'anak',
        'menantu': 'menantu',
        'cucu': 'cucu',
        'orang tua': 'orang_tua',
        'mertua': 'mertua',
        'famili lain': 'famili_lain',
    }
    return mapping.get(v, 'lainnya')

def map_status_warga(val):
    v = str(val).lower()
    if 'aktif' in v: return 'aktif'
    if 'meninggal' in v: return 'meninggal'
    if 'pindah' in v: return 'pindah_keluar'
    return 'aktif'

def migrate_pkk_partisipasi():
    print("\nMigrating PKK Participation...")
    conn = sqlite3.connect(SQLITE_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM partisipasi_kegiatan")
    records = cursor.fetchall()
    colnames = [d[0] for d in cursor.description]

    # Get mapping of old warga_id to new UUID via no_reg
    # We fetch wargas joined with rumah_tanggas to get the dasawisma_id
    res = supabase.table('wargas').select('id, no_reg, rumah_tanggas(dasawisma_id)').execute()
    warga_map = {}
    for w in res.data:
        if w['no_reg'] is not None:
            # Extract dasawisma_id from the joined rumah_tanggas object
            dw_id = w.get('rumah_tanggas', {}).get('dasawisma_id')
            warga_map[w['no_reg']] = (w['id'], dw_id)

    to_insert_map = {}
    for r in records:
        row = dict(zip(colnames, r))
        old_wid = row['warga_id'] # This is the original id from wargas table
        
        if old_wid in warga_map:
            new_id, dw_id = warga_map[old_wid]
            
            if dw_id:
                # Use new_id as key to ensure uniqueness per warga
                to_insert_map[new_id] = {
                    'warga_id': new_id,
                    'dasawisma_id': dw_id,
                    'tahun': 2025, # Default tahun
                    'penghayatan_pancasila': bool(row['penghayatan_pancasila']),
                    'gotong_royong': bool(row['gotong_royong']),
                    'pendidikan_keterampilan': bool(row['pendidikan_ketrampilan']),
                    'pengembangan_koperasi': bool(row['pengembangan_koperasi']),
                    'pangan': bool(row['pangan_beras']),
                    'sandang': bool(row['sandang']),
                    'kesehatan': bool(row['kesehatan']),
                    'perencanaan_sehat': bool(row['perencanaan_sehat']),
                    'kerja_bakti': bool(row['kerja_bakti']),
                    'rukun_kematian': bool(row['rukun_kematian']),
                    'kegiatan_keagamaan': bool(row['kegiatan_keagamaan']),
                    'jimpitan': bool(row['jimpitan']),
                    'arisan': bool(row['arisan']),
                }
            else:
                print(f"  Skipping warga {old_wid}: No Dasawisma ID found in KK")

    to_insert = list(to_insert_map.values())
    if to_insert:
        # Insert in batches
        for i in range(0, len(to_insert), 100):
            batch = to_insert[i:i+100]
            supabase.table('pkk_partisipasi').upsert(batch).execute()
            print(f"  Inserted batch {i//100 + 1}")
    
    print(f"Successfully migrated {len(to_insert)} PKK records.")

def main():
    try:
        sync_rts_and_dasawismas()
        migrate_kk()      
        migrate_wargas()  
        migrate_pkk_partisipasi()
        print("\n" + "="*30)
        print("PKK DATA RECOVERY COMPLETED!")
        print("="*30)
    except Exception as e:
        print(f"\nMigration failed: {e}")

if __name__ == "__main__":
    main()
