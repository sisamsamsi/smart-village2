import os
from supabase import create_client, Client

url = "https://ouvkmlfbvhtpqqrtcesn.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91dmttbGZidmh0cHFxcnRjZXNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY4MjczNCwiZXhwIjoyMDkzMjU4NzM0fQ.0B-aU9V4G2NIqvM4-TcFO-FUlSWKuPC3g0Pgp3rUoZM"

supabase: Client = create_client(url, key)

email = "admin@mandingan.id"
password = "adminmandingan"

try:
    # Create Auth User
    user = supabase.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True
    })
    
    user_id = user.user.id
    print(f"User created: {user_id}")
    
    # Create Profile
    profile_data = {
        "id": user_id,
        "nama_lengkap": "Admin Mandingan",
        "role": "dukuh",
        "aktif": True
    }
    
    res = supabase.table("user_profiles").upsert(profile_data).execute()
    print("Profile created/updated")
    
except Exception as e:
    print(f"Error: {e}")
