"use client";

import React, { useEffect, useState } from "react";
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
    theme,
    recentTools,
    myTools,
    setMyTools
  } = useAppContext();

  const [isAddingTool, setIsAddingTool] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    if (isSidebarCollapsed) {
      document.body.classList.add("col");
    } else {
      document.body.classList.remove("col");
    }
  }, [isSidebarCollapsed]);

  const navItems = [
    { id: "home", label: "Home Workspace", icon: "⌂", color: "#8d8d96", category: "home" },
    { id: "presets", label: "Shape Presets", icon: "◧", color: "#e8682f", category: "Image" },
    { id: "custom", label: "Custom Shapes", icon: "⬡", color: "#3b82f6", category: "Image" },
    { id: "shape-image", label: "Shape Your Image", icon: "◈", color: "#f59e0b", category: "Image" },
    { id: "extractor", label: "Image Extractor", icon: "📥", color: "#10b981", category: "Image" },
    { id: "png-overlay", label: "PNG Color Overlay", icon: "◐", color: "#ec4899", category: "Image" },
    { id: "format-converter", label: "Format Converter", icon: "⇄", color: "#f43f5e", category: "Image" },
    { id: "color-palette", label: "Color Palette", icon: "🎨", color: "#f43f5e", category: "Image" },
    { id: "svg-optimizer", label: "SVG Optimizer", icon: "⚡️", color: "#eab308", category: "Image" },
    { id: "photo-resizer", label: "Photo & Sig Resizer", icon: "📸", color: "#3b82f6", category: "Image" },
    { id: "mp4-to-gif", label: "MP4 to GIF", icon: "🎬", color: "#8b5cf6", category: "Video" },
    { id: "ocr", label: "Image to Text / OCR", icon: "⎘", color: "#6366f1", category: "Data" },
    { id: "qr-generator", label: "QR Generator", icon: "📱", color: "#06b6d4", category: "Data" },
    { id: "data-transfer", label: "Data Transfer", icon: "📡", color: "#84cc16", category: "Data" },
    { id: "json-date", label: "JSON Date Converter", icon: "Jd", color: "#7CFFB2", category: "Data" },
    { id: "pdf-converter", label: "PDF Converter", icon: "⬚", color: "#14b8a6", category: "Document" },
    { id: "image-to-css", label: "Image to CSS", icon: "✂️", color: "#8b5cf6", category: "Developer" },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    if (id !== "home" && !openTabs.includes(id)) {
      setOpenTabs([...openTabs, id]);
    }
    setMobileMenuOpen(false);
  };

  const renderCustomGroup = (title: string, toolIds: string[], isMyTools = false) => {
    if (toolIds.length === 0 && !isMyTools) return null;
    return (
      <div key={title} className="nav-group" style={{ marginBottom: '16px' }}>
        <div className="sl mono" style={{ marginTop: '0', display: isSidebarCollapsed ? 'none' : 'block' }}>{title.toUpperCase()}</div>
        <nav>
          {toolIds.map((id, index) => {
            const item = navItems.find(i => i.id === id);
            if (!item) return null;
            return (
              <button
                key={item.id}
                aria-current={activeSection === item.id}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
                draggable={isMyTools}
                onDragStart={(e) => {
                  if (isMyTools) {
                    setDraggedItem(item.id);
                  }
                }}
                onDragOver={(e) => {
                  if (isMyTools) e.preventDefault();
                }}
                onDrop={(e) => {
                  if (isMyTools && draggedItem) {
                    e.preventDefault();
                    if (draggedItem === item.id) return;
                    const newMyTools = [...myTools];
                    const draggedIdx = newMyTools.indexOf(draggedItem);
                    const targetIdx = index;
                    newMyTools.splice(draggedIdx, 1);
                    newMyTools.splice(targetIdx, 0, draggedItem);
                    setMyTools(newMyTools);
                    setDraggedItem(null);
                  }
                }}
                className={isMyTools ? "dnd-item" : ""}
                style={{ position: 'relative' }}
              >
                <div className="mini" style={{ "--c": item.color } as React.CSSProperties}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
                {isMyTools && (
                  <div 
                    className="remove-btn" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setMyTools(myTools.filter(t => t !== item.id)); 
                    }}
                    style={{ marginLeft: 'auto', opacity: 0.5, fontSize: '12px' }}
                  >
                    ✕
                  </div>
                )}
              </button>
            );
          })}
          {isMyTools && (
            <div style={{ marginTop: '4px' }}>
              {!isAddingTool ? (
                <button onClick={() => setIsAddingTool(true)} style={{ color: 'var(--brand)', opacity: 0.8 }}>
                  <div className="mini" style={{ "--c": "transparent", border: '1px dashed var(--brand)', color: 'var(--brand)' } as React.CSSProperties}>
                    +
                  </div>
                  <span>Add Tool</span>
                </button>
              ) : (
                <div style={{ padding: '0 8px', marginTop: '4px' }}>
                  <select 
                    style={{ width: '100%', background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: '6px', padding: '6px', fontSize: '12px' }}
                    onChange={(e) => {
                      if (e.target.value) {
                        setMyTools([...myTools, e.target.value]);
                        setIsAddingTool(false);
                      }
                    }}
                    onBlur={() => setIsAddingTool(false)}
                    autoFocus
                  >
                    <option value="">Select a tool...</option>
                    {navItems.filter(i => i.id !== 'home' && !myTools.includes(i.id)).map(i => (
                      <option key={i.id} value={i.id}>{i.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    );
  };

  const renderGroup = (title: string, category: string) => {
    const items = navItems.filter(i => i.category === category);
    if (items.length === 0) return null;
    return (
      <div key={title} className="nav-group" style={{ marginBottom: '16px' }}>
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
      
      <div className="nav-scroll" style={{ flex: 1, overflowY: 'auto' }}>
        {renderCustomGroup("Recent", recentTools)}
        {renderCustomGroup("My Tools", myTools, true)}
        {renderGroup("Document", "Document")}
        {renderGroup("Image", "Image")}
        {renderGroup("Data", "Data")}
        {renderGroup("Video", "Video")}
        {renderGroup("Developer", "Developer")}
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
