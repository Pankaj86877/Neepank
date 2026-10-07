"use client";

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/store/AppContext";
import { toolIcons } from "@/components/icons/toolIcons";

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
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("neepank-sidebar-collapsed");
      if (saved) setCollapsedCategories(JSON.parse(saved));
    } catch(e) {}
  }, []);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = { ...prev, [cat]: !prev[cat] };
      localStorage.setItem("neepank-sidebar-collapsed", JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    if (isSidebarCollapsed) {
      document.body.classList.add("col");
    } else {
      document.body.classList.remove("col");
    }
  }, [isSidebarCollapsed]);

  const navItems = [
    { id: "home", label: "Home Workspace", icon: "home", color: "#8d8d96", category: "home" },
    
    { id: "format-converter", label: "Image Converter", icon: "imageConverter", color: "#f43f5e", category: "Formats" },
    { id: "pdf-converter", label: "PDF Converter", icon: "pdfConverter", color: "#14b8a6", light: "#0d9488", category: "Formats" },
    { id: "mp4-to-gif", label: "MP4 to GIF", icon: "mp4ToGif", color: "#8b5cf6", category: "Formats" },
    { id: "json-date", label: "JSON Data Converter", icon: "jsonConverter", color: "#7CFFB2", light: "#16a34a", category: "Formats" },
    { id: "extractor", label: "PDF/PPT/DOC to Image", icon: "imageExtractor", color: "#10b981", light: "#059669", category: "Formats" },
    
    { id: "photo-resizer", label: "Photo & Sig Resizer", icon: "photoSigResizer", color: "#3b82f6", category: "Crop & Resize" },
    { id: "shape-image", label: "Shape Your Image", icon: "shapeYourImage", color: "#f59e0b", light: "#d97706", category: "Crop & Resize" },
    { id: "presets", label: "Shape Presets", icon: "shapePresets", color: "#e8682f", category: "Crop & Resize" },
    { id: "custom", label: "Custom Shapes", icon: "customShapes", color: "#3b82f6", category: "Crop & Resize" },
    
    { id: "ocr", label: "Image to Text / OCR", icon: "ocr", color: "#6366f1", category: "Extraction" },
    
    { id: "qr-generator", label: "QR Generator", icon: "qrGenerator", color: "#06b6d4", light: "#0891b2", category: "Sharing" },
    { id: "data-transfer", label: "Data Transfer", icon: "dataTransfer", color: "#84cc16", light: "#65a30d", category: "Sharing" },
    
    { id: "color-palette", label: "Color Palette", icon: "colorPalette", color: "#f43f5e", category: "Colors" },
    { id: "png-overlay", label: "Icon Recolor", icon: "pngColorOverlay", color: "#ec4899", category: "Colors" },
    
    { id: "svg-optimizer", label: "SVG Optimizer", icon: "svgOptimizer", color: "#10b981", light: "#059669", category: "Code" },
    { id: "image-to-css", label: "Image to CSS", icon: "imageToCss", color: "#8b5cf6", category: "Code" },
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
                <div className="mini" style={{ "--c": item.color, ...(item.light ? { "--cl": item.light } : {}) } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: toolIcons[item.icon] || item.icon }} />
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
    
    const isCollapsed = collapsedCategories[category] || false;
    const hasActiveChild = items.some(i => i.id === activeSection);
    const visuallyCollapsed = isSidebarCollapsed ? false : isCollapsed;
    
    return (
      <div key={title} className="nav-group" style={{ marginBottom: '16px' }}>
        <button 
          className="sl mono" 
          onClick={() => toggleCategory(category)}
          aria-expanded={!isCollapsed}
          aria-controls={`group-${category.replace(/[^a-z0-9]/gi, '')}`}
          style={{ 
            marginTop: '0', 
            display: isSidebarCollapsed ? 'none' : 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%',
            background: 'none',
            border: 'none',
            textAlign: 'left',
            paddingRight: '12px',
            cursor: 'pointer',
            color: (hasActiveChild && isCollapsed) ? 'var(--text)' : 'var(--muted)',
            fontWeight: (hasActiveChild && isCollapsed) ? '900' : '700',
          }}
        >
          <span>{title.toUpperCase()}</span>
          <span style={{ 
             transition: 'transform 0.2s', 
             transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
             fontSize: '10px'
          }}>▼</span>
        </button>
        
        <div 
          id={`group-${category.replace(/[^a-z0-9]/gi, '')}`}
          style={{ 
            display: 'grid', 
            gridTemplateRows: visuallyCollapsed ? '0fr' : '1fr',
            transition: 'grid-template-rows 0.25s ease-in-out'
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <nav style={{ overflowY: 'visible', overflowX: 'hidden' }}>
              {items.map((item) => (
                <button
                  key={item.id}
                  aria-current={activeSection === item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={item.label}
                >
                  <div className="mini" style={{ "--c": item.color, ...(item.light ? { "--cl": item.light } : {}) } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: toolIcons[item.icon] || item.icon }} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
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
        {renderCustomGroup("My Tools", myTools, true)}
        {renderGroup("Formats", "Formats")}
        {renderGroup("Crop & Resize", "Crop & Resize")}
        {renderGroup("Extraction", "Extraction")}
        {renderGroup("Sharing", "Sharing")}
        {renderGroup("Colors", "Colors")}
        {renderGroup("Code", "Code")}
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
