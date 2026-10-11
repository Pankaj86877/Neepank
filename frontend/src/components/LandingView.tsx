"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

export interface ToolItem {
  id: string;
  num: string;
  title: string;
  desc: string;
  category: "Formats" | "Crop & Resize" | "Extraction" | "Sharing" | "Colors" | "Code";
  color: string;
  rgb: string;
  icon: React.ReactNode;
}

const TOOLS_DATA: ToolItem[] = [
  {
    id: "pdf-converter",
    num: "01",
    title: "PDF Converter",
    desc: "Convert PDFs to PNG, JPEG, or WebP. Extract high-res pages instantly right in your browser.",
    category: "Formats",
    color: "#14b8a6",
    rgb: "20, 184, 166",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: "custom",
    num: "02",
    title: "Custom Shapes",
    desc: "Freehand vector masking. Draw organic curves and polygon cutouts to mask images freely.",
    category: "Crop & Resize",
    color: "#3b82f6",
    rgb: "59, 130, 246",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 1 9 9" />
        <path d="M12 7a5 5 0 0 1 5 5" />
      </svg>
    ),
  },
  {
    id: "presets",
    num: "03",
    title: "Shape Presets",
    desc: "100+ geometric mask presets. Circle, star, badge, heart, and polygon image cropping in one click.",
    category: "Crop & Resize",
    color: "#e8682f",
    rgb: "232, 104, 47",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "shape-image",
    num: "04",
    title: "Shape Your Image",
    desc: "Combine photos with decorative silhouette masks and export with transparent backgrounds.",
    category: "Crop & Resize",
    color: "#f59e0b",
    rgb: "245, 158, 11",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: "extractor",
    num: "05",
    title: "PDF/PPT/DOC to Image",
    desc: "Extract all embedded images and slides from Office documents and PDF presentations effortlessly.",
    category: "Formats",
    color: "#10b981",
    rgb: "16, 185, 129",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    id: "ocr",
    num: "06",
    title: "Image to Text / OCR",
    desc: "Extract editable text from scanned documents, receipts, and photos in 50+ languages.",
    category: "Extraction",
    color: "#6366f1",
    rgb: "99, 102, 241",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M7 8h10" />
        <path d="M12 8v8" />
        <path d="M9 16h6" />
      </svg>
    ),
  },
  {
    id: "png-overlay",
    num: "07",
    title: "Icon Recolor",
    desc: "Tint transparent PNG icons and logos with solid colors, dual gradients, or custom brand hues.",
    category: "Colors",
    color: "#ec4899",
    rgb: "236, 72, 153",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
  },
  {
    id: "format-converter",
    num: "08",
    title: "Image Converter",
    desc: "Batch convert PNG, JPG, WebP, AVIF, BMP, and SVG files with fine quality and compression controls.",
    category: "Formats",
    color: "#f43f5e",
    rgb: "244, 63, 94",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
  {
    id: "mp4-to-gif",
    num: "09",
    title: "MP4 to GIF",
    desc: "Turn MP4 and WebM video clips into lightweight, looping GIFs with customizable frame rates.",
    category: "Formats",
    color: "#8b5cf6",
    rgb: "139, 92, 246",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="3" />
        <polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
  },
  {
    id: "qr-generator",
    num: "10",
    title: "QR Generator",
    desc: "Generate clean QR codes for URLs, contacts, and text with custom colors and center logos.",
    category: "Sharing",
    color: "#06b6d4",
    rgb: "6, 182, 212",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3" />
        <line x1="17.01" y1="7" x2="17.02" y2="7" strokeWidth="3" />
        <line x1="7" y1="17" x2="7.01" y2="17" strokeWidth="3" />
        <line x1="17.01" y1="17" x2="17.02" y2="17" strokeWidth="3" />
      </svg>
    ),
  },
  {
    id: "data-transfer",
    num: "11",
    title: "Data Transfer",
    desc: "P2P file sharing. Send files directly between devices securely via WebRTC without any cloud uploads.",
    category: "Sharing",
    color: "#84cc16",
    rgb: "132, 204, 22",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5" cy="12" r="2.5" />
        <circle cx="19" cy="12" r="2.5" />
        <path d="M8 12h8" />
        <path d="M13 9l3 3-3 3" />
      </svg>
    ),
  },
  {
    id: "json-date",
    num: "12",
    title: "JSON Data Converter",
    desc: "Format, convert, and parse JSON data to CSV, TSV, or YAML with live syntax validation.",
    category: "Formats",
    color: "#7CFFB2",
    rgb: "124, 255, 178",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1" />
        <path d="M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1" />
      </svg>
    ),
  },
  {
    id: "color-palette",
    num: "13",
    title: "Color Palette",
    desc: "Extract colors from images. Generate aesthetic palettes, copy HEX/RGB codes, and test contrast.",
    category: "Colors",
    color: "#f43f5e",
    rgb: "244, 63, 94",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    ),
  },
  {
    id: "svg-optimizer",
    num: "14",
    title: "SVG Optimizer",
    desc: "Compress & clean SVGs. Strip redundant metadata, minify paths, and reduce file weights for lightning-fast loads.",
    category: "Code",
    color: "#10b981",
    rgb: "16, 185, 129",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    id: "photo-resizer",
    num: "15",
    title: "Photo & Sig Resizer",
    desc: "Resize and crop precisely. Fit portrait photos and signature scans to exact government or portal requirements.",
    category: "Crop & Resize",
    color: "#3b82f6",
    rgb: "59, 130, 246",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h6v6" />
        <path d="M9 21H3v-6" />
        <path d="M21 3l-7 7" />
        <path d="M3 21l7-7" />
      </svg>
    ),
  },
  {
    id: "image-to-css",
    num: "16",
    title: "Image to CSS",
    desc: "Convert images to CSS shapes. Turn artwork and icons into pure CSS box-shadows or clip-paths with zero assets.",
    category: "Code",
    color: "#8b5cf6",
    rgb: "139, 92, 246",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 8l-4 4 4 4" />
        <path d="M16 8l4 4-4 4" />
        <path d="M13.5 6l-3 12" />
      </svg>
    ),
  },
];

const CATEGORIES = ["All", "Formats", "Crop & Resize", "Extraction", "Sharing", "Colors", "Code"] as const;

interface LandingViewProps {
  onOpenTool: (toolId?: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onOpenTool }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [scrolled, setScrolled] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const heroMockupRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Initialize theme
  useEffect(() => {
    try {
      const saved = localStorage.getItem("neepank-theme");
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
        return;
      }
    } catch (e) {}

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("neepank-theme", next);
    } catch (e) {}
  };

  // Sticky nav scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global hotkey '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && searchInputRef.current && document.activeElement !== searchInputRef.current) {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
        if (activeTag !== "input" && activeTag !== "textarea") {
          e.preventDefault();
          searchInputRef.current.focus();
          searchInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter tools
  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TOOLS_DATA.filter((tool) => {
      const matchesCat = activeCategory === "All" || tool.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch =
        !q ||
        tool.title.toLowerCase().includes(q) ||
        tool.desc.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  // Card mouse spotlight handler
  const handleCardMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--mouse-x", `${x.toFixed(1)}%`);
    e.currentTarget.style.setProperty("--mouse-y", `${y.toFixed(1)}%`);
  };

  // Hero parallax tilt
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroMockupRef.current || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normX = (e.clientX - centerX) / (rect.width / 2);
    const normY = (e.clientY - centerY) / (rect.height / 2);

    const rotY = (normX * 5.5).toFixed(2);
    const rotX = (-normY * 4).toFixed(2);
    heroMockupRef.current.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  };

  const handleHeroMouseLeave = () => {
    if (heroMockupRef.current) {
      heroMockupRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    }
  };

  return (
    <div className="nk-landing" data-theme={theme} id="top">
      {/* A) STICKY TOP NAVIGATION */}
      <header className={`nk-header ${scrolled ? "nk-scrolled" : ""}`} role="banner">
        <div className="nk-container">
          <div className="nk-nav-inner">
            <a href="#top" className="nk-brand" aria-label="Neepank Toolbox Home">
              <img src="/landing/assets/neepank-logo.png" alt="Neepank Toolbox" className="nk-brand-logo-img" />
            </a>

            <nav className="nk-nav-links" aria-label="Main Navigation">
              <a href="#tools" className="nk-nav-link">Tools</a>
              <a href="#how-it-works" className="nk-nav-link">How it works</a>

              <button
                type="button"
                className="nk-theme-toggle nk-nav-theme-btn"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                <svg className="nk-theme-svg nk-theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                <svg className="nk-theme-svg nk-theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => onOpenTool()}
                className="nk-nav-cta"
              >
                Explore the tools <span className="nk-arrow-icon" aria-hidden="true">→</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* B) HERO SECTION */}
        <section
          className="nk-hero"
          ref={heroRef}
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
          aria-labelledby="hero-heading"
        >
          <div className="nk-hero-glow-wave" aria-hidden="true">
            <div className="nk-glow-orb-1"></div>
            <div className="nk-glow-orb-2"></div>
            <svg className="nk-hero-wave-svg" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M-100 480C220 360 480 580 820 410C1160 240 1340 380 1540 320" stroke="url(#hero-wave-grad)" strokeWidth="4" strokeOpacity="0.6" />
              <path d="M-100 520C280 410 540 600 880 440C1220 280 1380 400 1540 350" stroke="url(#hero-wave-grad)" strokeWidth="2" strokeOpacity="0.35" />
              <defs>
                <linearGradient id="hero-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#D946EF" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="nk-container">
            <div className="nk-hero-grid">
              <div className="nk-hero-content">
                <div className="nk-eyebrow">
                  <span className="nk-eyebrow-dot" aria-hidden="true"></span>
                  <span>Neepank Toolbox</span>
                </div>
                <h1 id="hero-heading" className="nk-hero-title">YOUR DIGITAL TOOLBOX</h1>
                <p className="nk-hero-sub">Create, convert and manage digital content with ease.</p>

                <div className="nk-hero-actions">
                  <button
                    type="button"
                    onClick={() => onOpenTool()}
                    className="nk-btn nk-btn-primary"
                  >
                    Explore the tools <span className="nk-arrow-icon" aria-hidden="true">→</span>
                  </button>
                  <a href="#tools" className="nk-btn nk-btn-ghost">
                    See all tools <span className="nk-arrow-down-icon" aria-hidden="true">↓</span>
                  </a>
                </div>

                <div className="nk-trust-row" aria-label="Key Highlights">
                  <div className="nk-trust-item">
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Runs in your browser</span>
                  </div>
                  <span className="nk-trust-dot" aria-hidden="true">·</span>
                  <div className="nk-trust-item">
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Files stay on your device</span>
                  </div>
                  <span className="nk-trust-dot" aria-hidden="true">·</span>
                  <div className="nk-trust-item">
                    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm-1 5a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" clipRule="evenodd" />
                    </svg>
                    <span>No account required</span>
                  </div>
                  <span className="nk-trust-dot" aria-hidden="true">·</span>
                  <div className="nk-trust-item">
                    <span className="nk-trust-badge">100% Free</span>
                  </div>
                </div>
              </div>

              {/* Right: Mockup with Parallax */}
              <div className="nk-hero-visual">
                <div className="nk-hero-mockup-container" ref={heroMockupRef}>
                  <img
                    src="/landing/assets/hero.webp"
                    alt="Neepank Toolbox Interface Preview"
                    className="nk-hero-mockup-img"
                    width="1024"
                    height="576"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Transition */}
        <div className="nk-section-transition" aria-hidden="true"></div>

        {/* C) TOOLS SECTION */}
        <section className="nk-tools-section" id="tools" aria-labelledby="tools-heading">
          <div className="nk-container">
            <div className="nk-section-header">
              <div className="nk-section-label-row">
                <span id="tools-heading" className="nk-section-label">NEEPANK TOOLBOX — EXPLORE OUR TOOLS</span>
                <div className="nk-header-controls-right">
                  <button
                    type="button"
                    className="nk-theme-toggle nk-section-theme-btn"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                  >
                    <svg className="nk-theme-svg nk-theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                    <svg className="nk-theme-svg nk-theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                    <span className="nk-theme-btn-label">{theme === "dark" ? "Dark" : "Light"}</span>
                  </button>
                  <span id="nk-tool-count" className="nk-tool-count-badge">
                    {searchQuery.trim()
                      ? `${filteredTools.length} ${filteredTools.length === 1 ? "Match" : "Matches"}`
                      : activeCategory !== "All"
                      ? `${filteredTools.length} of ${TOOLS_DATA.length} Tools`
                      : `${TOOLS_DATA.length} Tools`}
                  </span>
                </div>
              </div>

              {/* Search Bar & Categories */}
              <div className="nk-controls-bar">
                <div className="nk-search-box">
                  <svg className="nk-search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="8.5" cy="8.5" r="5.5" />
                    <path d="M13 13L17.5 17.5" strokeLinecap="round" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="search"
                    id="nk-tool-search"
                    className="nk-search-input"
                    placeholder="Search all 16 tools (e.g. PDF, crop, SVG, OCR...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setSearchQuery("");
                        searchInputRef.current?.blur();
                      }
                    }}
                    autoComplete="off"
                    aria-label="Search tools"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      id="nk-search-clear"
                      className="nk-search-clear-btn"
                      onClick={() => {
                        setSearchQuery("");
                        searchInputRef.current?.focus();
                      }}
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                  <kbd className="nk-search-kbd" title="Press / to focus search">/</kbd>
                </div>

                <div className="nk-filter-row" role="group" aria-label="Filter tools by category">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`nk-filter-chip ${activeCategory === cat ? "nk-active" : ""}`}
                      onClick={() => setActiveCategory(cat)}
                      aria-pressed={activeCategory === cat}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="nk-tools-grid">
              {filteredTools.map((tool) => (
                <article
                  key={tool.id}
                  className="nk-tool-card"
                  onMouseMove={handleCardMouseMove}
                  style={
                    {
                      "--tool-color": tool.color,
                      "--tool-rgb": tool.rgb,
                    } as React.CSSProperties
                  }
                >
                  <div className="nk-card-thumb-wrap">
                    <div className="nk-thumb-badge-row">
                      <span className="nk-card-num">{tool.num}</span>
                      <span className="nk-card-category">{tool.category}</span>
                    </div>
                    <div className="nk-card-thumb-fallback" aria-hidden="true">
                      <div className="nk-thumb-pattern"></div>
                      <div className="nk-thumb-icon-box">
                        <span className="nk-thumb-svg-icon">{tool.icon}</span>
                      </div>
                    </div>
                  </div>
                  <div className="nk-card-body">
                    <h3 className="nk-card-title">{tool.title}</h3>
                    <p className="nk-card-desc">{tool.desc}</p>
                    <button
                      type="button"
                      onClick={() => onOpenTool(tool.id)}
                      className="nk-card-btn"
                      aria-label={`Explore ${tool.title}`}
                    >
                      Explore the tool <span className="nk-arrow-icon" aria-hidden="true">→</span>
                    </button>
                  </div>
                </article>
              ))}

              {/* Empty Search State */}
              {filteredTools.length === 0 && (
                <div id="nk-tools-empty-state" className="nk-empty-state" style={{ display: "flex" }}>
                  <div className="nk-empty-icon" aria-hidden="true">🔍</div>
                  <h3 className="nk-empty-title">
                    No tools found matching &ldquo;{searchQuery || activeCategory}&rdquo;
                  </h3>
                  <p className="nk-empty-sub">
                    Try searching for &ldquo;PDF&rdquo;, &ldquo;image&rdquo;, &ldquo;resize&rdquo;, &ldquo;extract&rdquo;, or clear the search to see all tools.
                  </p>
                  <button
                    type="button"
                    className="nk-empty-btn"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("All");
                      searchInputRef.current?.focus();
                    }}
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* D) HOW IT WORKS */}
        <section className="nk-how-section" id="how-it-works" aria-labelledby="how-heading">
          <div className="nk-container">
            <div className="nk-how-header">
              <span className="nk-section-label">SIMPLE WORKFLOW</span>
              <h2 id="how-heading" className="nk-how-title">How Neepank Toolbox Works</h2>
              <p className="nk-how-sub">No setup, no software downloads, and no server uploads. Work directly in your browser.</p>
            </div>

            <div className="nk-how-grid">
              <div className="nk-how-card">
                <span className="nk-how-step-num">01</span>
                <h3 className="nk-how-step-title">Select your tool</h3>
                <p className="nk-how-step-desc">Pick from our 16 curated utilities — PDF converter, image masks, OCR reader, QR generator, and more.</p>
              </div>

              <div className="nk-how-card">
                <span className="nk-how-step-num">02</span>
                <h3 className="nk-how-step-title">Process on-device</h3>
                <p className="nk-how-step-desc">All computation happens locally via WebAssembly and WebRTC. Your sensitive files never leave your computer.</p>
              </div>

              <div className="nk-how-card">
                <span className="nk-how-step-num">03</span>
                <h3 className="nk-how-step-title">Export instantly</h3>
                <p className="nk-how-step-desc">Download crisp results in high-resolution WebP, PNG, SVG, or text with zero watermarks or quality loss.</p>
              </div>
            </div>
          </div>
        </section>

        {/* E) CTA SECTION */}
        <section className="nk-cta-section" aria-label="Get Started">
          <div className="nk-container">
            <div className="nk-cta-box">
              <div className="nk-cta-bg-glow" aria-hidden="true"></div>
              <h2 className="nk-cta-title">CREATE, CONVERT &amp; EDIT ON DEMAND</h2>
              <p className="nk-cta-sub">Join thousands of creators and professionals using Neepank Toolbox every day.</p>
              <button
                type="button"
                onClick={() => onOpenTool()}
                className="nk-btn nk-btn-primary"
              >
                Explore the tools <span className="nk-arrow-icon" aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* F) FOOTER */}
      <footer className="nk-footer" role="contentinfo">
        <div className="nk-container">
          <div className="nk-footer-inner">
            <div className="nk-footer-brand">
              <img src="/landing/assets/neepank-logo.png" alt="Neepank Toolbox" height="26" style={{ objectFit: "contain", display: "block" }} />
            </div>
            <p className="nk-footer-line">Built for creators, designers and teams.</p>
            <a href="#top" className="nk-back-top" aria-label="Back to top">
              Back to top ↑
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
