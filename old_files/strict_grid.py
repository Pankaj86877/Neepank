import re

file_path = "/Users/pankaj.k/Documents/Digital Product/Creative Suite/index.html"
with open(file_path, "r") as f:
    content = f.read()

# 1. Standardize Sidebar Logo
# We want the icon at x=24, text at x=64
# Padding left: 24px. Icon width: 24px. Gap: 16px. -> Text at 24+24+16 = 64px
logo_pattern = re.compile(r'\.sidebar-logo\s*\{([^}]+)\}', re.MULTILINE)
content = logo_pattern.sub(r'.sidebar-logo {\n            padding: 24px 24px 24px 24px;\n            display: flex;\n            align-items: center;\n            gap: 16px;\n            border-bottom: 1px solid var(--border-color);\n            flex-shrink: 0;\n        }', content, count=1)

icon_pattern = re.compile(r'\.logo-icon\s*\{([^}]+)\}', re.MULTILINE)
content = icon_pattern.sub(r'.logo-icon {\n            width: 24px; height: 24px;\n            border-radius: 50%;\n            background: var(--color-black);\n            display: flex; align-items: center; justify-content: center;\n            font-size: 12px; flex-shrink: 0;\n            color: var(--color-orange);\n        }', content, count=1)

# 2. Standardize Nav Section Label
# Label at x=24 (to align with logo icon and pill edge)
label_pattern = re.compile(r'\.nav-section-label\s*\{([^}]+)\}', re.MULTILINE)
content = label_pattern.sub(r'.nav-section-label {\n            font-size: 11px; font-weight: 600; letter-spacing: 1px;\n            color: var(--color-gray);\n            padding: 24px 24px 12px 24px;\n            white-space: nowrap;\n            overflow: hidden;\n            transition: opacity var(--transition-fast);\n            text-transform: uppercase;\n        }', content, count=1)

# 3. Standardize Nav Button
# Pill edge at x=24, icon at x=40 (24+16 padding), text at x=64 (40+24(icon)-something wait...)
# If text must be at x=64:
# Nav btn margin left: 24px.
# Pill padding left: 12px. -> Icon at 24+12 = 36px.
# Icon width: 16px. -> Icon right edge at 52px.
# Gap: 12px. -> Text at 64px.
# Perfect! 24 (margin) + 12 (padding) + 16 (icon) + 12 (gap) = 64!

btn_pattern = re.compile(r'\.nav-btn\s*\{([^}]+)\}', re.MULTILINE)
new_btn = """.nav-btn {
            display: flex; align-items: center; gap: 12px;
            padding: 12px 16px 12px 12px;
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
            margin: 4px 24px;
        }"""
content = btn_pattern.sub(new_btn, content, count=1)

btn_icon_pattern = re.compile(r'\.nav-btn \.nav-icon\s*\{([^}]+)\}', re.MULTILINE)
new_btn_icon = """.nav-btn .nav-icon {
            font-size: 16px;
            flex-shrink: 0;
            width: 16px;
            text-align: center;
            transition: transform var(--transition-fast);
        }"""
content = btn_icon_pattern.sub(new_btn_icon, content, count=1)

with open(file_path, "w") as f:
    f.write(content)
print("Strict grid applied")
