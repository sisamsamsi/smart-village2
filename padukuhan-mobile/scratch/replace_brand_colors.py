import os

replacements = {
    # Main old dark green color to new soft medium green
    "'#1B5E20'": "'#67C090'",
    '"#1B5E20"': '"#67C090"',
    "'#1b5e20'": "'#67C090'",
    '"#1b5e20"': '"#67C090"',
    
    # Secondary old green to new soft medium green
    "'#2E7D32'": "'#67C090'",
    '"#2E7D32"': '"#67C090"',
    
    # Light green background to light mint green background
    "'#E8F5E9'": "'#DDF4E7'",
    '"#E8F5E9"': '"#DDF4E7"',
    
    # Subtle green border/badge colors
    "'#A5D6A7'": "'#67C090'",
    '"#A5D6A7"': '"#67C090"',
    
    # RGBA old dark green to RGBA new soft green
    "rgba(27, 94, 32, 0.05)": "rgba(103, 192, 144, 0.08)",
    "rgba(27,94,32,0.05)": "rgba(103, 192, 144, 0.08)",
    "rgba(27, 94, 32, 0.1)": "rgba(103, 192, 144, 0.15)",
    "rgba(27,94,32,0.1)": "rgba(103, 192, 144, 0.15)",
}

target_dirs = [
    r"d:\smart-village\padukuhan-mobile\app",
    r"d:\smart-village\padukuhan-mobile\components"
]

def run_replacements():
    count_files = 0
    count_replacements = 0
    
    for target_dir in target_dirs:
        for root, dirs, files in os.walk(target_dir):
            for file in files:
                if file.endswith(('.ts', '.tsx')):
                    file_path = os.path.join(root, file)
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
