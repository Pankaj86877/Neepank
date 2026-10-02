import re

file_path = "/Users/pankaj.k/Documents/Digital Product/Creative Suite/index.html"
with open(file_path, "r") as f:
    content = f.read()

# Preview Box
preview_pattern = re.compile(r'\.preview-box\s*\{([^}]+)\}.*?\.preview-box:active\s*\{([^}]+)\}', re.DOTALL)
new_preview = """.preview-box {
            background-color: #FAFAFA;
            border: 1px solid var(--border-color);
            border-radius: 16px; height: 320px;
            display: flex; align-items: center; justify-content: center;
            position: relative; overflow: hidden; margin-bottom: 18px;
            cursor: grab; user-select: none;
        }

        .preview-box:active { cursor: grabbing; }"""
content = preview_pattern.sub(new_preview, content, count=1)

# Toggle Action
toggle_pattern = re.compile(r'\.btn-toggle-action\s*\{([^}]+)\}.*?\.btn-toggle-action\.active\s*\{([^}]+)\}', re.DOTALL)
new_toggle = """.btn-toggle-action {
            background: var(--color-light-gray); color: var(--color-gray);
            border: none; padding: 10px;
            font-size: 12px; font-weight: 700; border-radius: 8px;
            cursor: pointer; transition: all var(--transition-fast);
            text-transform: none; letter-spacing: 0px;
            font-family: 'Syne', sans-serif;
        }

        .btn-toggle-action:hover {
            background: #D0D0D0; color: var(--color-black);
        }

        .btn-toggle-action.active {
            background: var(--color-black); color: var(--color-white);
            font-weight: 800;
        }"""
content = toggle_pattern.sub(new_toggle, content, count=1)

# Upload Placeholder
upload_pattern = re.compile(r'\.btn-upload-placeholder\s*\{([^}]+)\}.*?\.btn-upload-placeholder:hover\s*\{([^}]+)\}', re.DOTALL)
new_upload = """.btn-upload-placeholder {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            width: 100%; padding: 16px; background: var(--color-beige);
            border: 2px dashed #CCCCCC; border-radius: 12px;
            font-size: 13px; font-weight: 700; color: var(--color-gray);
            cursor: pointer; transition: all var(--transition-fast);
            text-transform: none; letter-spacing: 0px;
            font-family: 'Syne', sans-serif;
        }

        .btn-upload-placeholder:hover {
            background: #EAE5DE; border-color: var(--color-orange);
            color: var(--color-black);
        }"""
content = upload_pattern.sub(new_upload, content, count=1)

# Base inputs
input_pattern = re.compile(r'input\[type="text"\], input\[type="number"\], select\s*\{([^}]+)\}.*?select:focus\s*\{([^}]+)\}', re.DOTALL)
new_input = """input[type="text"], input[type="number"], select {
            width: 100%; padding: 10px 12px;
            background: #FAFAFA;
            border: 1px solid var(--border-color);
            color: var(--color-black); border-radius: 8px;
            font-family: 'Syne', sans-serif;
            font-size: 13px; transition: border-color var(--transition-fast);
        }

        input[type="text"]:focus, input[type="number"]:focus, select:focus {
            outline: none; border-color: var(--color-orange);
            box-shadow: 0 0 10px rgba(249, 92, 21, 0.1);
        }"""
content = input_pattern.sub(new_input, content, count=1)

# Range inputs
range_pattern = re.compile(r'input\[type="range"\]\s*\{([^}]+)\}.*?input\[type="range"\]::-webkit-slider-thumb:hover\s*\{([^}]+)\}', re.DOTALL)
new_range = """input[type="range"] {
            -webkit-appearance: none; width: 100%; height: 6px;
            background: var(--color-light-gray); border-radius: 3px; outline: none;
        }

        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none; appearance: none;
            width: 16px; height: 16px; border-radius: 50%;
            background: var(--color-black); cursor: pointer;
            transition: transform var(--transition-fast);
        }

        input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.2);
        }"""
content = range_pattern.sub(new_range, content, count=1)

with open(file_path, "w") as f:
    f.write(content)
print("Updated inputs")
