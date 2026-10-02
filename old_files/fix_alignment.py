import re

file_path = "/Users/pankaj.k/Documents/Digital Product/Creative Suite/index.html"
with open(file_path, "r") as f:
    content = f.read()

# Fix logo text color (it was still dark-blue from a previous missed replace maybe? Actually the python script updated it to black, wait I need to make sure the logo text is black).
content = re.sub(r'\.logo-text h2\s*\{[^}]+\}', """.logo-text h2 {
            font-size: 18px; font-weight: 800; letter-spacing: -0.5px;
            text-transform: none; color: var(--color-black);
        }""", content)

# Fix nav-section-label padding
content = re.sub(r'\.nav-section-label\s*\{([^}]+)padding:\s*[^;]+;([^}]+)\}', r'.nav-section-label {\1padding: 20px 20px 8px 20px;\2}', content)

# Fix nav padding
content = re.sub(r'nav\s*\{\s*flex:\s*1;\s*padding:\s*[^;]+;', r'nav { flex: 1; padding: 12px 0;', content)

# Fix nav-btn margin
content = re.sub(r'\.nav-btn\s*\{([^}]+)margin:\s*[^;]+;([^}]+)\}', r'.nav-btn {\1margin: 4px 20px;\2}', content)

with open(file_path, "w") as f:
    f.write(content)
print("Alignment fixed")
