import re

file_path = "/Users/pankaj.k/Documents/Digital Product/Creative Suite/index.html"
with open(file_path, "r") as f:
    content = f.read()

color_overrides = """
        /* Extra Color Overrides for Hardcoded Values */
        .rot-label, .rotation-angle-display, .interaction-helper-tip, 
        .dz-label, .dz-sublabel, .file-item-name, .file-item-size, .file-item-order,
        .settings-row-label, .settings-row-desc, .settings-panel-title,
        .ocr-progress-text, .extractor-item .meta, .format-empty-state,
        .format-preview-meta, .resize-input-wrap label, .tool-empty-banner p,
        .qr-input-group label, .qr-input-field, .ocr-textbox, #ocr-empty-state,
        .png-stat-lbl, .collapse-text, .btn-rotate-quick, .qr-placeholder {
            color: var(--color-white) !important;
        }

        /* Secondary elements gray */
        .rot-label, .interaction-helper-tip, .dz-sublabel, .file-item-size, 
        .settings-row-desc, .settings-panel-title, .extractor-item .meta,
        .format-empty-state, .format-preview-meta, .resize-input-wrap label,
        .tool-empty-banner p, .qr-input-group label, .png-stat-lbl, .collapse-text,
        .btn-rotate-quick, .qr-placeholder {
            color: var(--color-gray) !important;
        }
        
        .qr-input-field, .ocr-textbox {
            background-color: var(--color-surface) !important;
            border-color: var(--color-border) !important;
        }

        .btn-rotate-quick {
            background: var(--color-surface) !important;
            border-color: var(--color-border) !important;
        }
"""

content = content.replace("</style>", color_overrides + "\n    </style>")

with open(file_path, "w") as f:
    f.write(content)
print("Hardcoded colors fixed")
