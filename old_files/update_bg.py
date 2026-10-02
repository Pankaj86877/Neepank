import re

file_path = "/Users/pankaj.k/Documents/Digital Product/Creative Suite/index.html"
with open(file_path, "r") as f:
    content = f.read()

# We need to change --color-bg to dark black.
# We also need to change the logo text, top bar text, and nav btn hover text to white.

# 1. Update --color-bg
content = re.sub(r'--color-bg:\s*#[0-9A-Fa-f]+;', '--color-bg: #000000;', content)

# 2. Add an extra CSS block at the end to ensure text on the black background is white
dark_bg_text_overrides = """
        /* Text overrides for Dark Black Background */
        .logo-text h2, #top-bar-title {
            color: #FFFFFF !important;
        }
        .nav-btn:hover {
            color: #FFFFFF !important;
        }
        .nav-section-label, .logo-text p, #top-bar-subtitle, .nav-btn {
            color: #A1A1AA !important; /* Lighter gray for better contrast on black */
        }
        .top-bar-badge {
            background: #18181B !important; 
            color: #FFFFFF !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
        }
        /* Make sure the active pill has white background and black text */
        .nav-btn.active {
            background: #FFFFFF !important;
            color: #000000 !important;
        }
        .nav-btn.active .nav-icon {
            filter: none !important;
        }
"""

content = content.replace("</style>", dark_bg_text_overrides + "\n    </style>")

with open(file_path, "w") as f:
    f.write(content)
print("Dark background applied")
