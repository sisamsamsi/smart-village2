import os

replacements = {
    # Hex codes
    "#67C090": "#124170",
    "#67c090": "#124170",
    "#DDF4E7": "#EFF6FF",
    "#ddf4e7": "#eff6ff",
    "#F0FDF4": "#EFF6FF",
    "#f0fdf4": "#eff6ff",
    "#ECFDF5": "#EFF6FF",
    "#ecfdf5": "#eff6ff",
    "#2E7D32": "#124170",
    "#2e7d32": "#124170",
    "#E8F5E9": "#EFF6FF",
    "#e8f5e9": "#eff6ff",
    "#A5D6A7": "#93C5FD",
    "#a5d6a7": "#93c5fd",
    "#15803D": "#124170",
    "#15803d": "#124170",
    "#16A34A": "#124170",
    "#16a34a": "#124170",
    "rgba(27, 94, 32, 0.08)": "rgba(18, 65, 112, 0.08)",
    "rgba(27,94,32,0.08)": "rgba(18, 65, 112, 0.08)",
    "rgba(103, 192, 144, 0.08)": "rgba(18, 65, 112, 0.08)",
    "rgba(103, 192, 144, 0.15)": "rgba(18, 65, 112, 0.15)",
}

target_dirs = [
    r"d:\smart-village\padukuhan-mobile\app",
    r"d:\smart-village\padukuhan-mobile\components",
    r"d:\smart-village\padukuhan-mobile\constants"
]

def run_replacements():
    count_files = 0
    count_replacements = 0
    
    for target_dir in target_dirs:
        for root, dirs, files in os.walk(target_dir):
            for file in files:
                if file.endswith(('.ts', '.tsx')):
                    file_path = os.path.join(root, file)
                    # Skip the script itself if it's in target
                    if "replace_greens_with_navy" in file_path:
                        continue
                        
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = content
                    file_replaced = False
                    for old, new in replacements.items():
                        if old in new_content:
                          new_content = new_content.replace(old, new)
                          file_replaced = True
                          count_replacements += 1
                    
                    if file_replaced:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Replaced colors in: {file_path}")
                        count_files += 1
                        
    print(f"Done! Updated {count_files} files with a total of {count_replacements} color replacements.")

if __name__ == "__main__":
    run_replacements()
