import sqlite3
import os
import uuid
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Configuration
URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SQLITE_PATH = os.getenv("SQLITE_DB_PATH", r"d:\smart-village\database_backup_20260430_205511.sqlite")

supabase: Client = create_client(URL, KEY)

def patch_warga_pkk_data():
    print("Patching Warga with Pregnancy and Breastfeeding status...")
    conn = sqlite3.connect(SQLITE_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, status_kehamilan, status_menyusui FROM wargas")
    rows = cursor.fetchall()
    
    # Get mapping of no_reg -> Supabase ID
    res = supabase.table('wargas').select('id, no_reg').execute()
    warga_map = {str(w['no_reg']): w['id'] for w in res.data if w['no_reg']}
    
    count = 0
    for row in rows:
        old_id = str(row[0])
        if old_id in warga_map:
            new_id = warga_map[old_id]
            is_hamil = row[1] == 'Hamil'
            is_menyusui = bool(row[2])
            
            if is_hamil or is_menyusui:
                supabase.table('wargas').update({
                    'status_kehamilan': is_hamil,
                    'status_menyusui': is_menyusui
                }).eq('id', new_id).execute()
                count += 1
                
    print(f"Updated {count} wargas with PKK flags.")
    conn.close()

def patch_rumah_tangga_pkk_data():
    print("Patching Rumah Tangga with '3 Buta' data...")
    conn = sqlite3.connect(SQLITE_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT no_kk, jumlah_buta FROM rumah_tanggas")
    rows = cursor.fetchall()
    
    count = 0
    for row in rows:
        no_kk, jml_buta = row
        if jml_buta > 0:
            supabase.table('rumah_tanggas').update({
                'jumlah_buta': jml_buta
            }).eq('no_kk', no_kk).execute()
            count += 1
            
    print(f"Updated {count} rumah tanggas with '3 Buta' count.")
    conn.close()

def migrate_historical_mutations():
    print("Migrating historical mutations (Kelahiran, Kematian, Kehamilan)...")
    conn = sqlite3.connect(SQLITE_PATH)
    cursor = conn.cursor()
    
    # Get mapping for IDs
    res = supabase.table('wargas').select('id, no_reg, rt_id').execute()
    warga_map = {str(w['no_reg']): {'id': w['id'], 'rt_id': w['rt_id']} for w in res.data if w['no_reg']}
    
    # 1. Migrasi Kematian
    cursor.execute("SELECT * FROM kematians")
    cols = [d[0] for d in cursor.description]
    for r in cursor.fetchall():
        row = dict(zip(cols, r))
        wid = str(row['warga_id'])
        if wid in warga_map:
            w = warga_map[wid]
            supabase.table('mutasi_penduduk').insert({
                'warga_id': w['id'],
                'rt_id': w['rt_id'],
                'jenis_mutasi': 'kematian',
                'tanggal_mutasi': row['tanggal_meninggal'],
                'sebab_meninggal': row['sebab_kematian'],
                'keterangan': row['keterangan']
            }).execute()
            
    # 2. Migrasi Kelahiran
    cursor.execute("SELECT * FROM kelahirans")
    cols = [d[0] for d in cursor.description]
    for r in cursor.fetchall():
        row = dict(zip(cols, r))
        wid = str(row['warga_id'])
        if wid in warga_map:
            w = warga_map[wid]
            supabase.table('mutasi_penduduk').insert({
                'warga_id': w['id'],
                'rt_id': w['rt_id'],
                'jenis_mutasi': 'kelahiran',
                'tanggal_mutasi': row['tanggal_lahir'],
                'nama_bayi': row.get('nama_bayi', ''), # If exists
                'nama_ibu': row['nama_ibu'],
                'nama_ayah': row['nama_ayah'],
                'ada_akte': bool(row['memiliki_akte']),
                'keterangan': row['keterangan']
            }).execute()

    # 3. Migrasi Kehamilan (History)
    cursor.execute("SELECT * FROM kehamilans")
    cols = [d[0] for d in cursor.description]
    for r in cursor.fetchall():
        row = dict(zip(cols, r))
        wid = str(row['warga_id'])
        if wid in warga_map:
            w = warga_map[wid]
            supabase.table('mutasi_penduduk').insert({
                'warga_id': w['id'],
                'rt_id': w['rt_id'],
                'jenis_mutasi': 'kehamilan',
                'tanggal_mutasi': row['created_at'].split(' ')[0] if row['created_at'] else None,
                'hpht': row['hpht'],
                'hpl': row['hpl'],
                'status_kehamilan': row['status'].lower(),
                'tanggal_melahirkan': row['tanggal_melahirkan'],
                'keterangan': row['keterangan']
            }).execute()
            
    print("Historical mutations migration completed.")
    conn.close()

if __name__ == "__main__":
    patch_warga_pkk_data()
    patch_rumah_tangga_pkk_data()
    migrate_historical_mutations()
    print("\nPATCH MIGRATION DONE!")
