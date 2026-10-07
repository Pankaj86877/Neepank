"use client";

import React from "react";
import { useAppContext } from "@/store/AppContext";
import { toolIcons } from "@/components/icons/toolIcons";

export const sectionData: Record<string, { label: string; icon: string; color: string; desc: string; category: string }> = {
  "presets": { label: "Shape Presets", icon: "shapePresets", color: "#e8682f", desc: "Predefined output formats", category: "Crop & Resize" },
  "custom": { label: "Custom Shapes", icon: "customShapes", color: "#3b82f6", desc: "Advanced Geometries", category: "Crop & Resize" },
  "shape-image": { label: "Shape Your Image", icon: "shapeYourImage", color: "#f59e0b", desc: "Image Cropping & Transformation", category: "Crop & Resize" },
  "extractor": { label: "PDF/PPT/DOC to Image", icon: "imageExtractor", color: "#10b981", desc: "Extract images from PDF, PPT & DOC files.", category: "Formats" },
  "ocr": { label: "Image to Text / OCR", icon: "ocr", color: "#6366f1", desc: "Optical Character Recognition", category: "Extraction" },
  "png-overlay": { label: "PNG Color Overlay", icon: "pngColorOverlay", color: "#ec4899", desc: "Tinting and Opacity", category: "Colors" },
  "pdf-converter": { label: "PDF Converter", icon: "pdfConverter", color: "#14b8a6", desc: "High-Quality Image to PDF", category: "Formats" },
  "format-converter": { label: "Image Converter", icon: "imageConverter", color: "#f43f5e", desc: "Convert & Trace Images", category: "Formats" },
  "mp4-to-gif": { label: "MP4 to GIF", icon: "mp4ToGif", color: "#8b5cf6", desc: "Video to GIF animation", category: "Formats" },
  "qr-generator": { label: "QR Generator", icon: "qrGenerator", color: "#06b6d4", desc: "Generate QR codes", category: "Sharing" },
  "data-transfer": { label: "Data Transfer", icon: "dataTransfer", color: "#84cc16", desc: "P2P file sharing", category: "Sharing" },
  "json-date": { label: "JSON Data Converter", icon: "jsonConverter", color: "#7CFFB2", desc: "Format dates and export JSON data", category: "Formats" },
  "color-palette": { label: "Color Palette", icon: "colorPalette", color: "#f43f5e", desc: "Extract and edit palettes", category: "Colors" },
  "svg-optimizer": { label: "SVG Optimizer", icon: "svgOptimizer", color: "#10b981", desc: "Compress & clean SVGs", category: "Code" },
  "photo-resizer": { label: "Photo & Sig Resizer", icon: "photoSigResizer", color: "#3b82f6", desc: "Resize and crop precisely", category: "Crop & Resize" },
  "image-to-css": { label: "Image to CSS", icon: "imageToCss", color: "#8b5cf6", desc: "Convert images to CSS shapes", category: "Code" },
};

const categories = ["All", "Formats", "Crop & Resize", "Extraction", "Sharing", "Colors", "Code"];

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
            <div className="ico" style={{ "--c": data.color } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: toolIcons[data.icon] || data.icon }} />
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
