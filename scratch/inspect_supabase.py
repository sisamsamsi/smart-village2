import os
import requests
import json

url = "https://ouvkmlfbvhtpqqrtcesn.supabase.co/rest/v1/wargas?limit=1"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91dmttbGZidmh0cHFxcnRjZXNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY4MjczNCwiZXhwIjoyMDkzMjU4NzM0fQ.0B-aU9V4G2NIqvM4-TcFO-FUlSWKuPC3g0Pgp3rUoZM"

headers = {
    "apikey": service_key,
    "Authorization": f"Bearer {service_key}"
}

try:
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        if len(data) > 0:
            print("SUPABASE WARGAS COLUMNS:")
            print(json.dumps(list(data[0].keys()), indent=2))
            print("\nSAMPLE RECORD:")
            print(json.dumps(data[0], indent=2))
        else:
            print("No records found in wargas table")
    else:
        print(f"Error {response.status_code}: {response.text}")
except Exception as e:
    print(f"Failed to query Supabase: {e}")
