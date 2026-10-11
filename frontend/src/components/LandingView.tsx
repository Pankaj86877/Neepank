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
    desc: "High-Quality Image to PDF. Turn images into polished PDFs with custom page sizes and ordering.",
    category: "Formats",
    color: "#14b8a6",
    rgb: "20, 184, 166",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </svg>
    ),
  },
  {
    id: "custom",
    num: "02",
    title: "Custom Shapes",
    desc: "Advanced Geometries. Build your own shapes with custom corners, diagonals, size and precision controls.",
    category: "Crop & Resize",
    color: "#3b82f6",
    rgb: "59, 130, 246",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z" />
        <circle cx="12" cy="3" r="1.4" fill="currentColor" />
        <circle cx="19.8" cy="16.5" r="1.4" fill="currentColor" />
        <circle cx="4.2" cy="16.5" r="1.4" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "presets",
    num: "03",
    title: "Shape Presets",
    desc: "Predefined output formats. Circles, squares, 16:9, stories, and YouTube presets ready for your creative layouts.",
    category: "Crop & Resize",
    color: "#e8682f",
    rgb: "232, 104, 47",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <circle cx="17" cy="7" r="4" />
        <path d="M7 14l4 7H3z" />
        <rect x="14" y="14" width="7" height="7" rx="3.5" />
      </svg>
    ),
  },
  {
    id: "shape-image",
    num: "04",
    title: "Shape Your Image",
    desc: "Image Cropping & Transformation. Place any photo inside custom shapes with adjustable zoom and position.",
    category: "Crop & Resize",
    color: "#f59e0b",
    rgb: "245, 158, 11",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2v14a2 2 0 0 0 2 2h14" />
        <path d="M2 6h14a2 2 0 0 1 2 2v14" />
      </svg>
    ),
  },
  {
    id: "extractor",
    num: "05",
    title: "PDF/PPT/DOC to Image",
    desc: "Extract images from PDF, PPT & DOC files. Download assets individually or together as a clean ZIP package.",
    category: "Formats",
    color: "#10b981",
    rgb: "16, 185, 129",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v11" />
        <path d="M8 10l4 4 4-4" />
        <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
      </svg>
    ),
  },
  {
    id: "ocr",
    num: "06",
    title: "Image to Text / OCR",
    desc: "Optical Character Recognition. Turn photos, scans, or screenshots into editable text with high accuracy.",
    category: "Extraction",
    color: "#6366f1",
    rgb: "99, 102, 241",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8V6a2 2 0 0 1 2-2h2" />
        <path d="M16 4h2a2 2 0 0 1 2 2v2" />
        <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
        <path d="M8 20H6a2 2 0 0 1-2-2v-2" />
        <path d="M8.5 9h7" />
        <path d="M12 9v7" />
      </svg>
    ),
  },
  {
    id: "png-overlay",
    num: "07",
    title: "Icon Recolor",
    desc: "Change the color of multiple icons at once. Tint transparent PNGs while preserving sharpness and alpha channels.",
    category: "Colors",
    color: "#ec4899",
    rgb: "236, 72, 153",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="12" r="6" />
        <circle cx="15" cy="12" r="6" />
      </svg>
    ),
  },
  {
    id: "format-converter",
    num: "08",
    title: "Image Converter",
    desc: "Convert & Trace Images. Switch between JPG, PNG, WEBP, SVG, and HEIC instantly right inside your browser.",
    category: "Formats",
    color: "#f43f5e",
    rgb: "244, 63, 94",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 4l3 3-3 3" />
        <path d="M20 7H8a4 4 0 0 0-4 4" />
        <path d="M7 20l-3-3 3-3" />
        <path d="M4 17h12a4 4 0 0 0 4-4" />
      </svg>
    ),
  },
  {
    id: "mp4-to-gif",
    num: "09",
    title: "MP4 to GIF",
    desc: "Video to GIF animation. Choose video segments, adjust frame rates, and render lightweight animated GIFs.",
    category: "Formats",
    color: "#8b5cf6",
    rgb: "139, 92, 246",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M8 5v14" />
        <path d="M16 5v14" />
        <path d="M3 9.5h5" />
        <path d="M3 14.5h5" />
        <path d="M16 9.5h5" />
        <path d="M16 14.5h5" />
      </svg>
    ),
  },
  {
    id: "qr-generator",
    num: "10",
    title: "QR Generator",
    desc: "Generate QR codes. Create clean QR codes for URLs, contacts, and text with custom colors and center logos.",
    category: "Sharing",
    color: "#06b6d4",
    rgb: "6, 182, 212",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3h-3z" />
        <path d="M20 14h1" />
        <path d="M14 20h1" />
        <path d="M18 20h3v-3" />
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
    desc: "Format dates and export JSON data. Parse, clean, transform, and beautify data structures with ease.",
    category: "Formats",
    color: "#7CFFB2",
    rgb: "124, 255, 178",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1" />
        <path d="M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1" />
      </svg>
    ),
  },
  {
    id: "color-palette",
    num: "13",
    title: "Color Palette",
    desc: "Extract and edit palettes. Sample colors from any image, generate harmonious palettes, and copy CSS values.",
    category: "Colors",
    color: "#f43f5e",
    rgb: "244, 63, 94",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3A3.7 3.7 0 0 0 21 11.7C21 6.9 17 3 12 3z" />
        <circle cx="7.5" cy="11" r="1" fill="currentColor" />
        <circle cx="11" cy="7" r="1" fill="currentColor" />
        <circle cx="16" cy="8" r="1" fill="currentColor" />
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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

                {/* Trust Row */}
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
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <span>Zero setup</span>
                  </div>
                </div>
              </div>

              {/* Right: Hero Visual (Monitor Mockup with 3D Parallax & Floating Badges) */}
              <div className="nk-hero-visual-wrap">
                {/* Floating Pill 1 (Top-Left) */}
                <div className="nk-hero-floating-badge nk-badge-top-left" aria-hidden="true">
                  <span className="nk-badge-pulse-dot"></span>
                  <span>100% Client-Side Engine</span>
                </div>

                {/* Floating Pill 2 (Bottom-Right) */}
                <div className="nk-hero-floating-badge nk-badge-bottom-right" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="nk-badge-icon">
                    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.351-.166-2.001A11.954 11.954 0 0110 1.944zM13.707 8.707a1 1 0 00-1.414-1.414L9 10.586 7.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Zero Cloud Uploads · 100% Private</span>
                </div>

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
              <h2 id="how-heading" className="nk-how-title">How It Works</h2>
              <p className="nk-how-sub">Fast, private, and effortless digital tools right inside your web browser.</p>
            </div>

            <div className="nk-how-grid">
              <div className="nk-how-card">
                <div className="nk-how-step-num">1</div>
                <h3 className="nk-how-step-title">Pick a tool</h3>
                <p className="nk-how-step-desc">Browse the toolbox and select the exact tool you need for your task.</p>
              </div>

              <div className="nk-how-card">
                <div className="nk-how-step-num">2</div>
                <h3 className="nk-how-step-title">Add your file</h3>
                <p className="nk-how-step-desc">Upload or drop your images, documents, or media straight into the browser.</p>
              </div>

              <div className="nk-how-card">
                <div className="nk-how-step-num">3</div>
                <h3 className="nk-how-step-title">Download your result</h3>
                <p className="nk-how-step-desc">Save high-quality output instantly without watermarks or waiting.</p>
              </div>
            </div>
          </div>
        </section>

        {/* E) FINAL CTA CONTAINER */}
        <section className="nk-cta-section" aria-label="Call to Action">
          <div className="nk-container">
            <div className="nk-cta-box">
              <div className="nk-cta-box-glow" aria-hidden="true"></div>
              <div className="nk-cta-text-wrap">
                <h2 className="nk-cta-headline">Your digital toolbox is ready.</h2>
                <p className="nk-cta-subtext">Convert, create, extract, edit, and more all in one place.</p>
              </div>
              <div className="nk-cta-btn-wrap">
                <button
                  type="button"
                  onClick={() => onOpenTool()}
                  className="nk-cta-large-btn"
                >
                  Explore the tools <span className="nk-arrow-icon" aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* F) FOOTER */}
      <footer className="nk-footer" role="contentinfo">
        <div className="nk-container">
          <div className="nk-footer-inner">
            <div className="nk-footer-brand">
              <img
                src="/landing/assets/neepank-logo.png"
                alt="Neepank Toolbox"
                className="nk-footer-logo-img"
                width={120}
                height={26}
                style={{ height: "26px", maxHeight: "26px", width: "auto", maxWidth: "130px", objectFit: "contain", display: "block" }}
              />
            </div>
            <p className="nk-footer-line">Built for creators, designers and teams.</p>
            <a href="#top" className="nk-back-top" aria-label="Back to top">
              <span>Back to top</span>
              <span aria-hidden="true">↑</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
