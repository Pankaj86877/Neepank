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
    setMobileMenuOpen 
  } = useAppContext();

  useEffect(() => {
    if (isSidebarCollapsed) {
      document.body.classList.add("col");
    } else {
      document.body.classList.remove("col");
    }
  }, [isSidebarCollapsed]);

  const navItems = [
    { id: "home", label: "Home Workspace", icon: "⌂", color: "#8d8d96" },
    { id: "presets", label: "Shape Presets", icon: "◧", color: "#e8682f" },
    { id: "custom", label: "Custom Shapes", icon: "⬡", color: "#3b82f6" },
    { id: "shape-image", label: "Shape Your Image", icon: "◈", color: "#f59e0b" },
    { id: "extractor", label: "Image Extractor", icon: "📥", color: "#10b981" },
    { id: "ocr", label: "Image to Text / OCR", icon: "⎘", color: "#6366f1" },
    { id: "png-overlay", label: "PNG Color Overlay", icon: "◐", color: "#ec4899" },
    { id: "pdf-converter", label: "PDF Converter", icon: "⬚", color: "#14b8a6" },
    { id: "format-converter", label: "Format Converter", icon: "⇄", color: "#f43f5e" },
    { id: "mp4-to-gif", label: "MP4 to GIF", icon: "🎬", color: "#8b5cf6" },
    { id: "qr-generator", label: "QR Generator", icon: "📱", color: "#06b6d4" },
    { id: "data-transfer", label: "Data Transfer", icon: "📡", color: "#84cc16" },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    if (id !== "home" && !openTabs.includes(id)) {
      setOpenTabs([...openTabs, id]);
    }
    setMobileMenuOpen(false);
  };

  return (
    <aside style={isMobileMenuOpen ? { position: 'absolute', zIndex: 100, height: '100%' } : {}}>
      <div className="brand" onClick={() => handleNavClick("home")} style={{cursor: 'pointer'}}>
        <div className="logo">✦</div>
        <div><b>Creative</b><small className="mono" style={{display: 'block'}}>TOOLBOX</small></div>
      </div>
      
      <div className="sl mono">STUDIO TOOLS</div>
      
      <nav>
        {navItems.filter(i => i.id !== "home").map((item) => (
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

