import re

file_path = "/Users/pankaj.k/Documents/Digital Product/Creative Suite/index.html"
with open(file_path, "r") as f:
    content = f.read()

# Top bar
topbar_pattern = re.compile(r'#top-bar\s*\{([^}]+)\}.*?\.top-bar-sep', re.DOTALL)
new_topbar = """#top-bar {
            position: sticky; top: 0; z-index: 50;
            height: var(--header-height);
            background: rgba(244, 240, 235, 0.9);
            backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border-color);
            display: flex; align-items: center;
            padding: 0 32px;
            gap: 16px;
            flex-shrink: 0;
        }

        #top-bar-title {
            font-size: 15px; font-weight: 700; letter-spacing: 0.5px;
            color: var(--color-black);
        }

        #top-bar-subtitle {
            font-size: 11px; color: var(--color-gray);
            font-family: 'JetBrains Mono', monospace;
            letter-spacing: 1px; opacity: 0.7;
        }

        .top-bar-sep"""
content = topbar_pattern.sub(new_topbar, content, count=1)

# Section page header
header_pattern = re.compile(r'\.section-page-header h1\s*\{([^}]+)\}.*?\.section-page-header p\s*\{([^}]+)\}', re.DOTALL)
new_header = """.section-page-header h1 {
            font-size: 32px; font-weight: 800;
            letter-spacing: -1px; color: var(--color-black);
            margin-bottom: 6px;
        }

        .section-page-header p {
            font-size: 14px; color: var(--color-gray);
            font-family: 'Syne', sans-serif; font-weight: 600;
        }"""
content = header_pattern.sub(new_header, content, count=1)

# Shape Card
card_pattern = re.compile(r'\.shape-card\s*\{([^}]+)\}.*?\.shape-card:hover\s*\{([^}]+)\}', re.DOTALL)
new_card = """.shape-card {
            background: var(--panel-bg);
            border-radius: 24px;
            border: 1px solid var(--border-color);
            padding: 26px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 8px 30px rgba(0,0,0,0.04);
            transition: box-shadow var(--transition-fast), transform var(--transition-fast);
        }

        .shape-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.08);
        }"""
content = card_pattern.sub(new_card, content, count=1)

# btn-export
export_pattern = re.compile(r'\.btn-export\s*\{([^}]+)\}.*?\.btn-export:disabled\s*\{([^}]+)\}', re.DOTALL)
new_export = """.btn-export {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            width: 100%; padding: 14px 20px;
            background: var(--color-orange);
            color: var(--color-white);
            border: none; border-radius: 12px;
            font-size: 14px; font-weight: 700;
            cursor: pointer; transition: all var(--transition-fast);
            text-transform: none; letter-spacing: 0px;
            font-family: 'Syne', sans-serif;
            position: relative; overflow: hidden; z-index: 1;
            box-shadow: 0 4px 14px rgba(249, 92, 21, 0.25);
        }

        .btn-export:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(249, 92, 21, 0.4); }
        .btn-export:disabled { filter: grayscale(1) opacity(0.4); cursor: not-allowed; box-shadow: none; transform: none; }"""
content = export_pattern.sub(new_export, content, count=1)

with open(file_path, "w") as f:
    f.write(content)
print("Updated Cards and Buttons")
