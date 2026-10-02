"use client";

import React, { useState } from "react";
import { ImageExtractorSection } from "./ImageExtractorSection";
import { PaletteLibrarySection } from "./PaletteLibrarySection";
import { IndustryRecommendationsSection } from "./IndustryRecommendationsSection";
import { CustomPaletteEditor } from "./CustomPaletteEditor";
import { LivePreviewSection } from "./LivePreviewSection";
import { SavedPalettesSection, SavedPalette } from "./SavedPalettesSection";

export const ColorPaletteV2: React.FC = () => {
  const [globalPalette, setGlobalPalette] = useState<string[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem("neepank-saved-palettes");
    if (saved) {
      try {
        setSavedPalettes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved palettes", e);
      }
    }
  }, []);

  const handleSavePalette = (name: string, group: string, colors: string[]) => {
    const newPalette: SavedPalette = {
      id: Date.now().toString(),
      name: name.trim() || "Untitled Palette",
      group: group.trim() || "Uncategorized",
      colors: [...colors]
    };
    const newPalettes = [...savedPalettes, newPalette];
    setSavedPalettes(newPalettes);
    localStorage.setItem("neepank-saved-palettes", JSON.stringify(newPalettes));
  };

  const handleDeletePalette = (id: string) => {
    const newPalettes = savedPalettes.filter(p => p.id !== id);
    setSavedPalettes(newPalettes);
    localStorage.setItem("neepank-saved-palettes", JSON.stringify(newPalettes));
  };

  return (
    <div className="ws" style={{ display: 'block', overflowY: 'auto', padding: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* 1. Image Upload & Extracted Color Palette (Priority) */}
        <ImageExtractorSection globalPalette={globalPalette} setGlobalPalette={setGlobalPalette} />
        
        {/* 2. Predefined Color Palette Library */}
        <PaletteLibrarySection setGlobalPalette={setGlobalPalette} />
        
        {/* 3. Industry-Specific Color Recommendations */}
        <IndustryRecommendationsSection setGlobalPalette={setGlobalPalette} />
        
        {/* 4. Custom Palette Editor */}
        <CustomPaletteEditor globalPalette={globalPalette} setGlobalPalette={setGlobalPalette} onSavePalette={handleSavePalette} />
        
        {/* Saved Palettes */}
        <SavedPalettesSection savedPalettes={savedPalettes} setGlobalPalette={setGlobalPalette} onDeletePalette={handleDeletePalette} />
        
        {/* 5. Live Design Preview */}
        <LivePreviewSection globalPalette={globalPalette} savedPalettes={savedPalettes} setGlobalPalette={setGlobalPalette} />
        
      </div>
    </div>
  );
};
