"use client";

import React from "react";
import { useAppContext } from "@/store/AppContext";

export const sectionData: Record<string, { label: string; icon: string; color: string; desc: string; category: string }> = {
  "presets": { label: "Shape Presets", icon: "◧", color: "#e8682f", desc: "Predefined output formats", category: "Images" },
  "custom": { label: "Custom Shapes", icon: "⬡", color: "#3b82f6", desc: "Advanced Geometries", category: "Images" },
  "shape-image": { label: "Shape Your Image", icon: "◈", color: "#f59e0b", desc: "Image Cropping & Transformation", category: "Images" },
  "extractor": { label: "Image Extractor", icon: "📥", color: "#10b981", desc: "Bulk Asset Extraction", category: "Images" },
  "ocr": { label: "Image to Text / OCR", icon: "⎘", color: "#6366f1", desc: "Optical Character Recognition", category: "Data" },
  "png-overlay": { label: "PNG Color Overlay", icon: "◐", color: "#ec4899", desc: "Tinting and Opacity", category: "Images" },
  "pdf-converter": { label: "PDF Converter", icon: "⬚", color: "#14b8a6", desc: "High-Quality Image to PDF", category: "Document" },
  "format-converter": { label: "Format Converter", icon: "⇄", color: "#f43f5e", desc: "Convert & Trace Images", category: "Images" },
  "mp4-to-gif": { label: "MP4 to GIF", icon: "🎬", color: "#8b5cf6", desc: "Video to GIF animation", category: "Video" },
  "qr-generator": { label: "QR Generator", icon: "📱", color: "#06b6d4", desc: "Generate QR codes", category: "Data" },
  "data-transfer": { label: "Data Transfer", icon: "📡", color: "#84cc16", desc: "P2P file sharing", category: "Data" },
  "color-palette": { label: "Color Palette", icon: "🎨", color: "#f43f5e", desc: "Extract and edit palettes", category: "Images" },
  "svg-optimizer": { label: "SVG Optimizer", icon: "✨", color: "#10b981", desc: "Compress & clean SVGs", category: "Images" },
  "photo-resizer": { label: "Photo & Sig Resizer", icon: "📐", color: "#3b82f6", desc: "Resize and crop precisely", category: "Images" },
};

const categories = ["All", "Images", "Video", "Data", "Document"];

export const HomeView = () => {
  const { searchQuery, setSearchQuery, activeCategory, setActiveCategory, setActiveSection, openTabs, setOpenTabs } = useAppContext();

  const handleOpenTool = (id: string) => {
    if (!openTabs.includes(id)) {
      setOpenTabs([...openTabs, id]);
    }
    setActiveSection(id);
  };

  const filteredTools = Object.entries(sectionData).filter(([id, data]) => {
    const matchesSearch = data.label.toLowerCase().includes(searchQuery.toLowerCase()) || data.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || data.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pane home">
      <h1>Your tools</h1>
      <p className="sub">Welcome to your Neepank Toolbox.</p>
      
      <div className="tools">
        <input 
          type="text" 
          placeholder="Search tools..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {categories.map(cat => (
          <button 
            key={cat} 
            className="chip" 
            aria-pressed={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid">
        {filteredTools.map(([id, data]) => (
          <button 
            key={id} 
            className="tile" 
            style={{ "--c": data.color } as React.CSSProperties}
            onClick={() => handleOpenTool(id)}
          >
            <div className="ico" style={{ "--c": data.color } as React.CSSProperties}>{data.icon}</div>
            <div>
              <h2>{data.label}</h2>
              <p>{data.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
