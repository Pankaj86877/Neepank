"use client";

import React, { useEffect, useState } from "react";
import { useAppContext } from "@/store/AppContext";

const sectionData: Record<string, { label: string; icon: string; color: string }> = {
  "presets": { label: "Shape Presets", icon: "◧", color: "#e8682f" },
  "custom": { label: "Custom Shapes", icon: "⬡", color: "#3b82f6" },
  "shape-image": { label: "Shape Your Image", icon: "◈", color: "#f59e0b" },
  "extractor": { label: "Image Extractor", icon: "📥", color: "#10b981" },
  "ocr": { label: "Image to Text / OCR", icon: "⎘", color: "#6366f1" },
  "png-overlay": { label: "PNG Color Overlay", icon: "◐", color: "#ec4899" },
  "pdf-converter": { label: "PDF Converter", icon: "⬚", color: "#14b8a6" },
  "format-converter": { label: "Image Converter", icon: "⇄", color: "#f43f5e" },
  "mp4-to-gif": { label: "MP4 to GIF", icon: "🎬", color: "#8b5cf6" },
  "qr-generator": { label: "QR Generator", icon: "📱", color: "#06b6d4" },
  "data-transfer": { label: "Data Transfer", icon: "📡", color: "#84cc16" },
  "json-date": { label: "JSON Data Converter", icon: "Jd", color: "#7CFFB2" },
  "color-palette": { label: "Color Palette", icon: "🎨", color: "#f43f5e" },
  "svg-optimizer": { label: "SVG Optimizer", icon: "✨", color: "#10b981" },
  "photo-resizer": { label: "Photo & Sig Resizer", icon: "📐", color: "#3b82f6" },
  "image-to-css": { label: "Image to CSS", icon: "✂️", color: "#8b5cf6" },
};

export const TopBar = () => {
  const { activeSection, setActiveSection, openTabs, setOpenTabs, theme, setTheme } = useAppContext();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(t => t !== id);
    setOpenTabs(newTabs);
    if (activeSection === id) {
      setActiveSection("home");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="bar" style={{ overflowX: 'hidden', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: '16px' }}>
      <div style={{ display: 'flex', flex: 1, overflowX: 'auto', alignItems: 'flex-end', gap: '4px', paddingBottom: '0' }}>
        <button 
          className="tab" 
          aria-selected={activeSection === "home"} 
          onClick={() => setActiveSection("home")}
          style={{ flexShrink: 0 }}
        >
          <div className="mini" style={{ "--c": "#8d8d96" } as React.CSSProperties}>⌂</div> 
          Home Workspace
        </button>

        {openTabs.map(tabId => {
          const data = sectionData[tabId];
          if (!data) return null;
          return (
            <button 
              key={tabId}
              className="tab" 
              aria-selected={activeSection === tabId}
              onClick={() => setActiveSection(tabId)}
              style={{ flexShrink: 0 }}
            >
              <div className="mini" style={{ "--c": data.color } as React.CSSProperties}>{data.icon}</div> 
              {data.label}
              <span className="x" onClick={(e) => closeTab(e, tabId)}>×</span>
            </button>
          );
        })}
      </div>
      
      <div className="sp" style={{ flexShrink: 0, marginLeft: '16px', paddingBottom: '8px' }}>
        <div className="pill" style={!isOnline ? { background: '#2a1515', borderColor: '#7f1d1d', color: '#f87171' } : {}}>
          <i style={!isOnline ? { background: '#f87171' } : {}}></i> {isOnline ? "Online" : "Offline"}
        </div>
        <button className="chip" onClick={toggleTheme} title="Toggle Theme" style={{ padding: '4px 10px' }}>
          {theme === "dark" ? "◐" : "◑"}
        </button>
      </div>
    </div>
  );
};

