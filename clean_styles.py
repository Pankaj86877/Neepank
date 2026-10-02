import os
import re

tools_dir = "/Users/pankaj.k/Documents/Toolkit /frontend/src/components/tools"

def clean_inline_styles(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Remove color: "white", color: "#fff", color: "var(--color-white)" etc.
    # We can use regex to replace specific problematic inline styles.
    # Or more simply, since we want DDesign to handle colors, we can strip:
    # color: "white", color: "#fff", color: "var(--color-white)", color: "rgba(255,255,255,...)"
    
    # Regex for color properties
    content = re.sub(r'color:\s*"(white|#fff|#ffffff|var\(--color-white\)|rgba\(255,255,255,[^\)]+\))"\s*,?\s*', '', content)
    
    # Also fix background colors that are dark or translucent white since cards are white now
    content = re.sub(r'background:\s*"(rgba\(0,0,0,[^\)]+\)|rgba\(255,255,255,[^\)]+\))"\s*,?\s*', '', content)
    
    # Some borders might be hardcoded white/black
    content = re.sub(r'border:\s*"[^"]*(rgba\(255,255,255,[^\)]+\)|rgba\(0,0,0,[^\)]+\))"\s*,?\s*', '', content)

    # Clean up empty style objects style={{ }}
    content = re.sub(r'style=\{\{\s*\}\}', '', content)

    with open(file_path, 'w') as f:
        f.write(content)

for filename in os.listdir(tools_dir):
    if filename.endswith(".tsx"):
        clean_inline_styles(os.path.join(tools_dir, filename))

print("Cleaned inline styles from tools")
