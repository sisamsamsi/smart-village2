import urllib.request
import json

url = "https://ouvkmlfbvhtpqqrtcesn.supabase.co/rest/v1/"
anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91dmttbGZidmh0cHFxcnRjZXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2ODI3MzQsImV4cCI6MjA5MzI1ODczNH0.wjUkc7ddhr9sE2mRwpZMcgTWfWFiO2e_SrivIZjsnek"

headers = {
    "apikey": anon_key,
    "Authorization": f"Bearer {anon_key}",
    "Content-Type": "application/json"
}

def query_endpoint(endpoint):
    req = urllib.request.Request(url + endpoint, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"Error querying {endpoint}: {e}")
        return None

def main():
    print("Fetching active warga count...")
    wargas_aktif = query_endpoint("wargas?status_warga=eq.aktif&select=count")
    print("Active wargas (count):", wargas_aktif)
    
    print("\nFetching total warga count...")
    wargas_total = query_endpoint("wargas?select=count")
    print("Total wargas (count):", wargas_total)
    
    print("\nFetching v_rekap_dasawisma sample:")
    rekap_dw = query_endpoint("v_rekap_dasawisma?limit=5")
    if rekap_dw:
        print(json.dumps(rekap_dw, indent=2))
        
    print("\nFetching v_rekap_rt sample:")
    rekap_rt = query_endpoint("v_rekap_rt?limit=5")
    if rekap_rt:
        print(json.dumps(rekap_rt, indent=2))
        
    print("\nFetching v_rekap_padukuhan sample:")
    rekap_padukuhan = query_endpoint("v_rekap_padukuhan?limit=5")
    if rekap_padukuhan:
        print(json.dumps(rekap_padukuhan, indent=2))

if __name__ == "__main__":
    main()
