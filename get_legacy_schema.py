import sqlite3
import json

db_path = r'd:\smart-village\database_backup_20260430_205511.sqlite'

def get_full_schema():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [r[0] for r in cursor.fetchall()]
    
    schema = {}
    for table in tables:
        cursor.execute(f"PRAGMA table_info({table})")
        cols = cursor.fetchall()
        schema[table] = [{"name": c[1], "type": c[2]} for c in cols]
        
    print(json.dumps(schema, indent=2))
    conn.close()

if __name__ == "__main__":
    get_full_schema()
