"use client";

import React, { useEffect } from "react";
import { useAppContext } from "@/store/AppContext";

export const Sidebar = () => {
  const { 
    activeSection, 
    setActiveSection, 
    openTabs, 
    setOpenTabs, 
    isSidebarCollapsed, 
    setSidebarCollapsed, 
    isMobileMenuOpen, 
    setMobileMenuOpen,
    theme
  } = useAppContext();

  useEffect(() => {
    if (isSidebarCollapsed) {
      document.body.classList.add("col");
    } else {
      document.body.classList.remove("col");
    }
  }, [isSidebarCollapsed]);

  const navItems = [
    { id: "home", label: "Home Workspace", icon: "⌂", color: "#8d8d96", category: "home" },
    { id: "presets", label: "Shape Presets", icon: "◧", color: "#e8682f", category: "Images" },
    { id: "custom", label: "Custom Shapes", icon: "⬡", color: "#3b82f6", category: "Images" },
    { id: "shape-image", label: "Shape Your Image", icon: "◈", color: "#f59e0b", category: "Images" },
    { id: "extractor", label: "Image Extractor", icon: "📥", color: "#10b981", category: "Images" },
    { id: "png-overlay", label: "PNG Color Overlay", icon: "◐", color: "#ec4899", category: "Images" },
    { id: "format-converter", label: "Format Converter", icon: "⇄", color: "#f43f5e", category: "Images" },
    { id: "color-palette", label: "Color Palette", icon: "🎨", color: "#f43f5e", category: "Images" },
    { id: "svg-optimizer", label: "SVG Optimizer", icon: "⚡️", color: "#eab308", category: "Images" },
    { id: "photo-resizer", label: "Photo & Sig Resizer", icon: "📸", color: "#3b82f6", category: "Images" },

    { id: "mp4-to-gif", label: "MP4 to GIF", icon: "🎬", color: "#8b5cf6", category: "Video" },

    { id: "ocr", label: "Image to Text / OCR", icon: "⎘", color: "#6366f1", category: "Data" },
    { id: "qr-generator", label: "QR Generator", icon: "📱", color: "#06b6d4", category: "Data" },
    { id: "data-transfer", label: "Data Transfer", icon: "📡", color: "#84cc16", category: "Data" },

    { id: "pdf-converter", label: "PDF Converter", icon: "⬚", color: "#14b8a6", category: "Document" },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    if (id !== "home" && !openTabs.includes(id)) {
      setOpenTabs([...openTabs, id]);
    }
    setMobileMenuOpen(false);
  };

  const renderGroup = (title: string, category: string) => {
    const items = navItems.filter(i => i.category === category);
    if (items.length === 0) return null;
    return (
      <div key={title} style={{ marginBottom: '16px' }}>
        <div className="sl mono" style={{ marginTop: '0', display: isSidebarCollapsed ? 'none' : 'block' }}>{title.toUpperCase()}</div>
        <nav>
          {items.map((item) => (
            <button
              key={item.id}
              aria-current={activeSection === item.id}
              onClick={() => handleNavClick(item.id)}
              title={item.label}
            >
              <div className="mini" style={{ "--c": item.color } as React.CSSProperties}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    );
  };

  return (
    <aside style={isMobileMenuOpen ? { position: 'absolute', zIndex: 100, height: '100%' } : {}}>
      <div className="brand" onClick={() => handleNavClick("home")} style={{ cursor: 'pointer', padding: '16px 20px', display: 'flex', justifyContent: 'center' }}>
        <img 
          src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"} 
          alt="Neepank Toolbox" 
          style={{ width: isSidebarCollapsed ? '40px' : '140px', height: 'auto', transition: 'width 0.2s', objectFit: 'contain' }} 
        />
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderGroup("Images", "Images")}
        {renderGroup("Video", "Video")}
        {renderGroup("Data", "Data")}
        {renderGroup("Document", "Document")}
      </div>

      <div id="col" style={{ display: 'flex', alignItems: 'center' }}>
        <span>Collapse panel</span>
        <button 
          className="mini" 
          style={{ "--c": "#6b7280", marginLeft: "auto", width: "22px", height: "22px" } as React.CSSProperties}
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? "→" : "←"}
        </button>
      </div>
    </aside>
  );
};

