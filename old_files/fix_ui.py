import re
import shutil

backup_path = "/Users/pankaj.k/Documents/Digital Product/Creative Suite/index_dark_theme_backup.html"
file_path = "/Users/pankaj.k/Documents/Digital Product/Creative Suite/index.html"

# 1. Restore from backup
shutil.copy2(backup_path, file_path)

with open(file_path, "r") as f:
    content = f.read()

# 2. Modify the :root variables
root_replacement = """        :root {
            /* Light Theme Overrides */
            --color-bg: #F4F0EB;
            --color-surface: #FFFFFF;
            --border-color: rgba(0, 0, 0, 0.08);
            
            --color-dark-blue: #F4F0EB; /* Re-mapped to light background */
            --color-black: #FFFFFF;     /* Pure white for cards */
            --color-white: #09090B;     /* Almost black for primary text */
            
            --color-gray: #71717A;      /* Medium gray for secondary text */
            --color-light-gray: #E4E4E7; /* Light gray for borders/dividers */
            --color-gray-blue: #D4D4D8;
            
            --color-orange: #F95C15;    /* Keep vibrant orange */
            --color-light-blue: #09090B; /* Mapped to black for accents */
            
            --color-green: #10B981;
            --color-pale-green: #059669;
            --color-teal: #0D9488;
            --color-purple: #8B5CF6;
            --color-pink: #EC4899;
            
            --nav-width: 260px;
            --nav-collapsed: 80px;
            --header-height: 72px;
            
            --transition-fast: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            --transition-med: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            --transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }"""
content = re.sub(r':root\s*\{[^}]+--transition-slow[^}]+\}', root_replacement, content, count=1)

# 3. Add override CSS just before </style>
override_css = """
        /* ================= LIGHT THEME OVERRIDES ================= */
        body {
            background-color: var(--color-bg);
            background-image: none;
            color: var(--color-white);
        }

        /* Sidebar overrides */
        #sidebar {
            background: var(--color-bg);
            border-right: 1px solid var(--border-color);
            box-shadow: none;
        }

        .sidebar-logo {
            padding: 24px 24px 24px 24px;
            gap: 16px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .logo-icon {
            width: 24px; height: 24px; border-radius: 50%;
            background: var(--color-white);
            color: var(--color-orange);
            box-shadow: none; font-size: 12px;
        }

        .logo-text h2 {
            color: var(--color-white); text-transform: none; font-size: 18px; letter-spacing: -0.5px;
        }
        .logo-text p {
            color: var(--color-gray); letter-spacing: 0.5px;
        }

        .nav-section-label {
            padding: 24px 24px 12px 24px; color: var(--color-gray); text-transform: uppercase;
        }

        nav { padding: 12px 0; }

        .nav-btn {
            margin: 4px 24px; padding: 10px 16px 10px 12px;
            border-radius: 20px; color: var(--color-gray);
            font-weight: 600;
        }
        .nav-btn:hover { color: var(--color-white); }
        .nav-btn.active {
            background: var(--color-white); color: var(--color-black);
        }
        
        .nav-btn .nav-icon { width: 16px; font-size: 16px; filter: none !important; }
        .nav-btn.active .nav-icon { filter: none !important; }
        
        /* Main Content overrides */
        #main-content {
            background: var(--color-bg);
        }

        #top-bar {
            background: var(--color-bg);
            backdrop-filter: none;
            border-bottom: 1px solid var(--border-color);
        }

        #top-bar-title { color: var(--color-white); }
        #top-bar-subtitle { color: var(--color-gray); }
        .top-bar-badge {
            background: var(--color-surface); color: var(--color-white);
            border: 1px solid var(--border-color); box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        /* Cards overrides */
        .shape-card {
            background: var(--color-surface);
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            color: var(--color-white);
        }
        .shape-card:hover {
            border-color: rgba(0,0,0,0.1);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }

        .section-page-header h1 { color: var(--color-white); text-shadow: none; }
        .section-page-header p { color: var(--color-gray); }

        /* Buttons and Inputs */
        .btn-export {
            background: var(--color-orange); color: #FFFFFF;
            box-shadow: 0 4px 12px rgba(249, 92, 21, 0.2);
        }
        .btn-export:hover {
            box-shadow: 0 6px 16px rgba(249, 92, 21, 0.3);
        }
        .btn-toggle-action {
            background: var(--color-surface); color: var(--color-gray);
            border: 1px solid var(--border-color); box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .btn-toggle-action.active {
            background: var(--color-white); color: var(--color-black); border-color: var(--color-white);
        }

        .btn-upload-placeholder {
            background: var(--color-surface); border: 2px dashed var(--color-light-gray);
        }
        .btn-upload-placeholder:hover {
            border-color: var(--color-orange); background: rgba(249,92,21,0.02);
        }
        .btn-upload-placeholder h4 { color: var(--color-white); }
        .btn-upload-placeholder p { color: var(--color-gray); }

        input[type="number"], select, .custom-select {
            background: var(--color-surface); color: var(--color-white);
            border: 1px solid var(--border-color);
        }
        
        .preview-box {
            background: var(--color-surface); border: 1px solid var(--border-color);
        }
        
        .dz-upload-zone {
            background: var(--color-surface); border: 2px dashed var(--color-light-gray);
        }
        .dz-upload-zone:hover {
            border-color: var(--color-orange); background: rgba(249,92,21,0.02);
        }
        .dz-label { color: var(--color-white); }
        .dz-sublabel { color: var(--color-gray); }
        
        .file-item { background: var(--color-surface); border: 1px solid var(--border-color); box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .file-item-name { color: var(--color-white); }
        .file-item-size { color: var(--color-gray); }
        .file-item-order { color: var(--color-white); }

        .settings-panel { background: var(--color-surface); border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .settings-panel-title { color: var(--color-gray); }
        .settings-row-label { color: var(--color-white); }
        .settings-row-desc { color: var(--color-gray); }

        .app-section { padding: 40px 60px 80px; }
        
        /* Nav Pips visibility fix */
        .nav-btn .nav-pip { display: none; } /* Hide the weird pips from dark theme entirely */
        
        /* Revert Highspring to Creative Toolbox */
"""

content = content.replace("</style>", override_css + "\n    </style>")
content = content.replace("Highspring Creative Studio", "Creative Toolbox")
content = content.replace("Highspring", "Creative Toolbox")

with open(file_path, "w") as f:
    f.write(content)
print("UI Restored and Overridden")
