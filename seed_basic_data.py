import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not URL or not KEY:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
    exit(1)

supabase: Client = create_client(URL, KEY)

def seed():
    print("Seeding Profil Padukuhan...")
    supabase.table("padukuhan_profil").insert({
        "nama_padukuhan": "Mandingan",
        "nama_kalurahan": "Ringinharjo",
        "nama_kapanewon": "Bantul",
        "nama_kabupaten": "Bantul"
    }).execute()

    print("Seeding RTs...")
    rt_data = [
        {"nomor_rt": 1, "nama_ketua": "Sunarto"},
        {"nomor_rt": 2, "nama_ketua": "Agung Nugroho"},
        {"nomor_rt": 3, "nama_ketua": "Didit Suryana"},
        {"nomor_rt": 4, "nama_ketua": "Diki"},
        {"nomor_rt": 5, "nama_ketua": "Kelik Sugiharto"},
        {"nomor_rt": 6, "nama_ketua": "Puji Sukanto"},
        {"nomor_rt": 7, "nama_ketua": "Purwanto"},
    ]
    supabase.table("rts").insert(rt_data).execute()

    print("Syncing RT IDs for Dasawisma seeding...")
    rt_res = supabase.table("rts").select("id, nomor_rt").execute()
    rt_map = {item['nomor_rt']: item['id'] for item in rt_res.data}

    print("Seeding Dasawismas...")
    dw_data = []
    
    # RT 1: Melati 1, 2, 3
    for name in ['Melati 1', 'Melati 2', 'Melati 3']:
        dw_data.append({"rt_id": rt_map[1], "nama_dasawisma": name})
    
    # RT 2: Anggrek 1, 2, 3
    for name in ['Anggrek 1', 'Anggrek 2', 'Anggrek 3']:
        dw_data.append({"rt_id": rt_map[2], "nama_dasawisma": name})

    # RT 3: Mawar 1, 2, 3, 4
    for name in ['Mawar 1', 'Mawar 2', 'Mawar 3', 'Mawar 4']:
        dw_data.append({"rt_id": rt_map[3], "nama_dasawisma": name})

    # RT 4: Melati 9, 10
    for name in ['Melati 9', 'Melati 10']:
        dw_data.append({"rt_id": rt_map[4], "nama_dasawisma": name})

    # RT 5: Melati 11, 12
    for name in ['Melati 11', 'Melati 12']:
        dw_data.append({"rt_id": rt_map[5], "nama_dasawisma": name})

    # RT 6: Melati 14, 15, 16, 17
    for name in ['Melati 14', 'Melati 15', 'Melati 16', 'Melati 17']:
        dw_data.append({"rt_id": rt_map[6], "nama_dasawisma": name})

    # RT 7: Melati 18, 19
    for name in ['Melati 18', 'Melati 19']:
        dw_data.append({"rt_id": rt_map[7], "nama_dasawisma": name})

    supabase.table("dasawismas").insert(dw_data).execute()
    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed()
