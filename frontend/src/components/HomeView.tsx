"use client";

import React, { useState, useEffect } from "react";
import { useAppContext } from "@/store/AppContext";
import { toolIcons } from "@/components/icons/toolIcons";

export const sectionData: Record<string, { label: string; icon: string; color: string; desc: string; category: string }> = {
  "presets": { label: "Shape Presets", icon: "shapePresets", color: "#e8682f", desc: "Predefined output formats", category: "Crop & Resize" },
  "custom": { label: "Custom Shapes", icon: "customShapes", color: "#3b82f6", desc: "Advanced Geometries", category: "Crop & Resize" },
  "shape-image": { label: "Shape Your Image", icon: "shapeYourImage", color: "#f59e0b", desc: "Image Cropping & Transformation", category: "Crop & Resize" },
  "extractor": { label: "PDF/PPT/DOC to Image", icon: "imageExtractor", color: "#10b981", desc: "Extract images from PDF, PPT & DOC files.", category: "Formats" },
  "ocr": { label: "Image to Text / OCR", icon: "ocr", color: "#6366f1", desc: "Optical Character Recognition", category: "Extraction" },
  "png-overlay": { label: "Icon Recolor", icon: "pngColorOverlay", color: "#ec4899", desc: "Change the color of multiple icons at once", category: "Colors" },
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

  // Reordering states
  const [isEditMode, setIsEditMode] = useState(false);
  const [customOrder, setCustomOrder] = useState<string[]>([]);
  const [draggedToolId, setDraggedToolId] = useState<string | null>(null);
  const [dragOverToolId, setDragOverToolId] = useState<string | null>(null);
  const [activeHandleId, setActiveHandleId] = useState<string | null>(null);
  const [a11yMessage, setA11yMessage] = useState("");

  const canEdit = activeCategory === "All" && !searchQuery;

  useEffect(() => {
    if (!canEdit && isEditMode) {
      setIsEditMode(false);
    }
  }, [canEdit, isEditMode]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("neepank-tool-order");
      const defaultOrder = Object.keys(sectionData);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validOrder = parsed.filter(id => sectionData[id]);
          const missing = defaultOrder.filter(id => !validOrder.includes(id));
          setCustomOrder([...validOrder, ...missing]);
          return;
        }
      }
      setCustomOrder(defaultOrder);
    } catch (e) {
      setCustomOrder(Object.keys(sectionData));
    }
  }, []);

  const saveOrder = (newOrder: string[]) => {
    setCustomOrder(newOrder);
    try {
      localStorage.setItem("neepank-tool-order", JSON.stringify(newOrder));
    } catch (e) {
      console.error("Failed to save tool order", e);
    }
  };

  const handleResetOrder = () => {
    const defaultOrder = Object.keys(sectionData);
    saveOrder(defaultOrder);
    setA11yMessage("Tool order reset to default.");
  };

  const handleOpenTool = (id: string) => {
    if (!openTabs.includes(id)) {
      setOpenTabs([...openTabs, id]);
    }
    setActiveSection(id);
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedToolId(id);
    e.dataTransfer.effectAllowed = "move";
    // Required for Firefox
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragEnter = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedToolId && draggedToolId !== id) {
      setDragOverToolId(id);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnd = () => {
    setDraggedToolId(null);
    setDragOverToolId(null);
    setActiveHandleId(null);
  };

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedToolId && draggedToolId !== id) {
      const newOrder = [...customOrder];
      const draggedIndex = newOrder.indexOf(draggedToolId);
      const targetIndex = newOrder.indexOf(id);
      
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedToolId);
      
      saveOrder(newOrder);
      setA11yMessage(`Moved ${sectionData[draggedToolId].label} to position ${targetIndex + 1}.`);
    }
    setDraggedToolId(null);
    setDragOverToolId(null);
    setActiveHandleId(null);
  };

  const moveTool = (id: string, direction: -1 | 1) => {
    const newOrder = [...customOrder];
    const idx = newOrder.indexOf(id);
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= newOrder.length) return;
    
    newOrder.splice(idx, 1);
    newOrder.splice(newIdx, 0, id);
    saveOrder(newOrder);
    setA11yMessage(`Moved ${sectionData[id].label} to position ${newIdx + 1}.`);
  };

  const orderedTools = customOrder.length > 0 ? customOrder.map(id => [id, sectionData[id]] as const) : Object.entries(sectionData);

  const filteredTools = orderedTools.filter(([id, data]) => {
    if (!data) return false;
    const matchesSearch = data.label.toLowerCase().includes(searchQuery.toLowerCase()) || data.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || data.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pane home">
      <h1>Your tools</h1>
      <p className="sub">Welcome to your Neepank Toolbox.</p>
      
      <div className="tools" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search tools..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {canEdit ? (
          <button 
            className={`chip ${isEditMode ? 'active' : ''}`} 
            style={{ 
              background: isEditMode ? 'var(--brand)' : 'var(--card)', 
              color: isEditMode ? '#fff' : 'var(--text)',
              fontWeight: 600
            }}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? "Done" : "Customize"}
          </button>
        ) : (
          isEditMode && <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Switch to All to reorder.</span>
        )}
        
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
      
      {isEditMode && canEdit && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
           <button className="pb" onClick={handleResetOrder} style={{ fontSize: '13px', background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
             ⟲ Reset order
           </button>
        </div>
      )}

      <div className="grid">
        {filteredTools.map(([id, data]) => {
          const isDragging = draggedToolId === id;
          const isDragOver = dragOverToolId === id;
          const isDraggable = isEditMode && activeHandleId === id;
          
          return (
          <div 
            key={id} 
            className={`tile ${isEditMode ? 'edit-mode' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`} 
            style={{ "--c": data.color } as React.CSSProperties}
            onClick={() => {
              if (!isEditMode) handleOpenTool(id);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!isEditMode) handleOpenTool(id);
              }
            }}
            draggable={isDraggable}
            onDragStart={(e) => handleDragStart(e, id)}
            onDragEnter={(e) => handleDragEnter(e, id)}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, id)}
          >
            {isEditMode && (
              <div 
                className="drag-handle" 
                aria-hidden="true" 
                title="Drag to reorder" 
                onPointerDown={(e) => setActiveHandleId(id)}
                onPointerUp={() => setActiveHandleId(null)}
                onPointerCancel={() => setActiveHandleId(null)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                  <circle cx="9" cy="5" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="15" cy="5" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="9" cy="19" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="15" cy="19" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </div>
            )}
            
            <div className="ico" style={{ "--c": data.color } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: toolIcons[data.icon] || data.icon }} />
            <div>
              <h2>{data.label}</h2>
              <p>{data.desc}</p>
            </div>
            
            {isEditMode && (
              <div className="a11y-controls" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="reorder-btn" 
                  aria-label={`Move ${data.label} earlier`} 
                  onClick={() => moveTool(id, -1)}
                  disabled={customOrder.indexOf(id) === 0}
                >↑</button>
                <button 
                  className="reorder-btn" 
                  aria-label={`Move ${data.label} later`} 
                  onClick={() => moveTool(id, 1)}
                  disabled={customOrder.indexOf(id) === customOrder.length - 1}
                >↓</button>
              </div>
            )}
          </div>
        )})}
      </div>
      
      <div aria-live="polite" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>
        {a11yMessage}
      </div>
    </div>
  );
};
