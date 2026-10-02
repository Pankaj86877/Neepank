import re

file_path = "/Users/pankaj.k/Documents/Digital Product/Creative Suite/index.html"
with open(file_path, "r") as f:
    content = f.read()

# Remove my previous failed injections
content = re.sub(r'/\* ================= LIGHT THEME OVERRIDES ================= \*/.*?</style>', '</style>', content, flags=re.DOTALL)
content = re.sub(r'/\* Extra Color Overrides for Hardcoded Values \*/.*?</style>', '</style>', content, flags=re.DOTALL)
content = re.sub(r'/\* Text overrides for Dark Black Background \*/.*?</style>', '</style>', content, flags=re.DOTALL)

# Now apply the perfect, high-contrast dark background with white cards theme
final_css = """
        /* ================= PREMIUM THEME OVERRIDES ================= */
        :root {
            --color-bg: #09090B;          /* Dark Black Background */
            --color-surface: #FFFFFF;     /* Pure White for Cards */
            --color-border-light: rgba(255,255,255,0.08); /* Border on dark bg */
            --color-border-dark: rgba(0,0,0,0.08);        /* Border on light cards */
            
            --text-on-dark: #FFFFFF;
            --text-on-dark-muted: #A1A1AA;
            
            --text-on-light: #09090B;
            --text-on-light-muted: #71717A;
            
            --color-orange: #F95C15;
            --color-accent: #10B981;
        }

        /* 1. Global Backgrounds & Text */
        body, #main-content, #sidebar, #top-bar {
            background-color: var(--color-bg) !important;
            background-image: none !important;
            color: var(--text-on-dark) !important;
        }
        
        #sidebar { border-right: 1px solid var(--color-border-light) !important; box-shadow: none !important; }
        #top-bar { border-bottom: 1px solid var(--color-border-light) !important; }
        
        .sidebar-logo { border-bottom: 1px solid var(--color-border-light) !important; padding: 24px !important; gap: 16px !important; }
        .logo-text h2 { color: var(--text-on-dark) !important; font-size: 18px !important; letter-spacing: -0.5px !important; text-transform: none !important; }
        .logo-text p { color: var(--text-on-dark-muted) !important; }
        .logo-icon { background: var(--text-on-dark) !important; color: var(--color-orange) !important; width: 24px !important; height: 24px !important; font-size: 12px !important; box-shadow: none !important; }
        
        .nav-section-label { color: var(--text-on-dark-muted) !important; padding: 24px 24px 12px 24px !important; }
        .nav-btn { color: var(--text-on-dark-muted) !important; margin: 4px 24px !important; padding: 10px 16px 10px 12px !important; }
        .nav-btn:hover { color: var(--text-on-dark) !important; background: rgba(255,255,255,0.03) !important; }
        .nav-btn.active { background: var(--text-on-dark) !important; color: var(--color-bg) !important; }
        .nav-btn .nav-pip { display: none !important; }
        .nav-btn .nav-icon { filter: none !important; width: 16px !important; font-size: 16px !important; }
        
        #top-bar-title { color: var(--text-on-dark) !important; }
        #top-bar-subtitle { color: var(--text-on-dark-muted) !important; }
        
        /* 2. White Cards on Dark Background */
        .shape-card, .ocr-preview-container-pane, .qr-preview-box, .settings-panel {
            background: var(--color-surface) !important;
            border: 1px solid var(--color-border-dark) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
            color: var(--text-on-light) !important;
        }
        .shape-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        
        .section-page-header h1 { color: var(--text-on-dark) !important; text-shadow: none !important; }
        .section-page-header p { color: var(--text-on-dark-muted) !important; }
        
        /* Elements ON the white cards */
        .shape-card *, .settings-panel * { color: var(--text-on-light); }
        .shape-card p, .settings-panel-title, .settings-row-desc { color: var(--text-on-light-muted) !important; }
        .settings-row-label, .shape-card h3, .shape-card h4 { color: var(--text-on-light) !important; }
        
        .btn-toggle-action { background: #F4F4F5 !important; border: 1px solid var(--color-border-dark) !important; color: var(--text-on-light-muted) !important; }
        .btn-toggle-action.active { background: var(--text-on-light) !important; color: var(--color-surface) !important; }
        
        .btn-upload-placeholder, .dz-upload-zone { background: #F4F4F5 !important; border: 2px dashed #D4D4D8 !important; }
        .btn-upload-placeholder:hover, .dz-upload-zone:hover { border-color: var(--color-orange) !important; background: rgba(249,92,21,0.03) !important; }
        .btn-upload-placeholder h4, .dz-label { color: var(--text-on-light) !important; }
        .btn-upload-placeholder p, .dz-sublabel { color: var(--text-on-light-muted) !important; }
        
        /* 3. Inputs & Forms */
        input, select, textarea, .custom-select, .qr-input-field, .ocr-textbox {
            background: #FFFFFF !important;
            border: 1px solid #D4D4D8 !important;
            color: #09090B !important;
            box-shadow: none !important;
        }
        .qr-input-field:focus, .ocr-textbox:focus, input:focus, select:focus { border-color: var(--color-orange) !important; }
        
        /* 4. Oranges & Primary Buttons */
        .btn-export { background: var(--color-orange) !important; color: #FFFFFF !important; box-shadow: 0 4px 12px rgba(249, 92, 21, 0.2) !important; }
        .btn-export:hover { box-shadow: 0 6px 16px rgba(249, 92, 21, 0.3) !important; }
        .btn-rotate-reset { color: var(--color-orange) !important; background: rgba(249,92,21,0.1) !important; }
        
        /* 5. Fix remaining hardcoded dark texts */
        .file-item { background: #FFFFFF !important; border: 1px solid #E4E4E7 !important; }
        .file-item-name { color: #09090B !important; }
        .file-item-size { color: #71717A !important; }
        .file-item-order { color: #09090B !important; }
        
        .rot-label, .qr-input-group label, .png-stat-lbl, .format-preview-meta { color: var(--text-on-dark-muted) !important; }
        .rotation-angle-display { color: var(--text-on-dark) !important; }
        .btn-rotate-quick { background: rgba(255,255,255,0.05) !important; color: var(--text-on-dark-muted) !important; border: 1px solid var(--color-border-light) !important; }
        
        /* Empty States */
        #ocr-empty-state { color: var(--text-on-light-muted) !important; }
        .qr-placeholder { color: var(--text-on-light-muted) !important; }
        .tool-empty-banner p { color: var(--text-on-dark-muted) !important; }
        .interaction-helper-tip { color: var(--text-on-dark-muted) !important; }
        .collapse-text { color: var(--text-on-dark-muted) !important; }
        
        .extractor-item { background: var(--color-surface) !important; border: 1px solid var(--color-border-dark) !important; }
        .extractor-item .meta { color: var(--text-on-light-muted) !important; }
        .extractor-item img { background: #F4F4F5 !important; border: none !important; }
"""

content = content.replace("</style>", final_css + "\n    </style>")

with open(file_path, "w") as f:
    f.write(content)
print("Perfect dark theme with white cards applied")
