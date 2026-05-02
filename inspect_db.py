import sqlite3
import json

db_path = r'd:\smart-village\database_backup_20260430_205511.sqlite'

def inspect_db():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        
        results = {}
        for table in tables:
            # Get column info
            cursor.execute(f"PRAGMA table_info({table})")
            columns = [{"name": col[1], "type": col[2]} for col in cursor.fetchall()]
            
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            
            results[table] = {
                "columns": columns,
                "count": count
            }
            
        print(json.dumps(results, indent=2))
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_db()
