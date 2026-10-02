import re

file_path = "/Users/pankaj.k/Documents/Digital Product/Creative Suite/index.html"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update :root
root_pattern = re.compile(r':root\s*\{[^}]+\}', re.MULTILINE)
new_root = """:root {
            --color-orange: #F95C15;
            --color-black: #111111;
            --color-dark-gray: #333333;
            --color-gray: #666666;
            --color-light-gray: #E0E0E0;
            --color-white: #FFFFFF;
            --color-beige: #F4F0EB;
            --color-lime: #A3FF33;

            --bg-main: var(--color-beige);
            --panel-bg: var(--color-white);
            --border-color: rgba(0, 0, 0, 0.08);
            --text-title: var(--color-black);
            --text-body: var(--color-gray);

            --nav-width: 240px;
            --nav-collapsed: 72px;
            --header-height: 60px;

            --accent: var(--color-orange);
            --custom-accent: var(--color-orange);
            --png-accent: var(--color-orange);
            --shape-image-accent: var(--color-orange);
            --ocr-accent: var(--color-orange);
            --extractor-accent: var(--color-orange); 

            --transition-fast: 0.18s cubic-bezier(0.4,0,0.2,1);
            --transition-med: 0.32s cubic-bezier(0.4,0,0.2,1);
        }"""
content = root_pattern.sub(new_root, content, count=1)

# 2. Update Body
body_pattern = re.compile(r'body\s*\{([^}]+)\}', re.MULTILINE)
new_body = """body {
            background-color: var(--bg-main);
            color: var(--text-title);
            font-family: 'Syne', -apple-system, sans-serif;
            height: 100vh;
            height: 100dvh;
            overflow: hidden;
        }"""
content = body_pattern.sub(new_body, content, count=1)

# 3. Update Sidebar
sidebar_pattern = re.compile(r'#sidebar\s*\{([^}]+)\}', re.MULTILINE)
new_sidebar = """#sidebar {
            width: var(--nav-width);
            height: 100vh;
            background: transparent;
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            position: fixed;
            left: 0; top: 0; bottom: 0;
            z-index: 100;
            transition: width var(--transition-med);
            overflow: hidden;
        }"""
content = sidebar_pattern.sub(new_sidebar, content, count=1)

# 4. Update Nav Section Label
nav_label_pattern = re.compile(r'\.nav-section-label\s*\{([^}]+)\}', re.MULTILINE)
new_nav_label = """.nav-section-label {
            font-size: 11px; font-weight: 600; letter-spacing: 1px;
            color: var(--color-gray);
            padding: 20px 20px 8px 30px;
            white-space: nowrap;
            overflow: hidden;
            transition: opacity var(--transition-fast);
        }"""
content = nav_label_pattern.sub(new_nav_label, content, count=1)

# 5. Remove Accent Pips Per Section
# Delete from /* Accent pips per section */ down to .shape-img-palette-row
pips_pattern = re.compile(r'/\*\s*Accent pips per section\s*\*/.*?/\*\s*──\s*Shape Your Image', re.DOTALL)
content = pips_pattern.sub('/* ── Shape Your Image', content)

# 6. Update .nav-btn styles
nav_btn_pattern = re.compile(r'\.nav-btn\s*\{([^}]+)\}.*?\.nav-btn\.active \.nav-icon\s*\{[^}]+\}', re.DOTALL)
new_nav_btns = """.nav-btn {
            display: flex; align-items: center; gap: 12px;
            padding: 12px 16px;
            border-radius: 20px;
            background: transparent;
            border: none;
            cursor: pointer;
            color: var(--color-gray);
            font-family: 'Syne', sans-serif;
            font-size: 14px; font-weight: 600;
            text-align: left;
            transition: all var(--transition-fast);
            white-space: nowrap;
            position: relative;
            overflow: hidden;
            margin: 4px 16px;
        }

        .nav-btn .nav-icon {
            font-size: 18px;
            flex-shrink: 0;
            width: 24px;
            text-align: center;
            transition: transform var(--transition-fast);
        }

        .nav-btn .nav-label {
            overflow: hidden;
            white-space: nowrap;
            transition: opacity var(--transition-fast);
            flex: 1;
        }

        #sidebar.collapsed .nav-label { opacity: 0; pointer-events: none; }

        .nav-btn .nav-pip {
            width: 20px; height: 20px; border-radius: 50%;
            margin-left: auto; flex-shrink: 0;
            background: rgba(0,0,0,0.05);
            display: flex; align-items: center; justify-content: center;
            font-size: 10px; color: var(--color-black);
            opacity: 1;
        }

        #sidebar.collapsed .nav-pip { display: none; }

        .nav-btn:hover {
            color: var(--color-black);
        }

        .nav-btn.active {
            background: var(--color-black);
            color: var(--color-white);
        }

        .nav-btn.active .nav-pip { background: var(--color-white); color: var(--color-black); }"""
content = nav_btn_pattern.sub(new_nav_btns, content, count=1)

with open(file_path, "w") as f:
    f.write(content)
print("Updated CSS")
