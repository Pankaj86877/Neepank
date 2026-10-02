"use client";

import React, { useState } from "react";
import { STYLE_CATEGORIES, Palette } from "./paletteData";

type Props = {
  setGlobalPalette: (colors: string[]) => void;
};

export const PaletteLibrarySection: React.FC<Props> = ({ setGlobalPalette }) => {
  const [activeCategory, setActiveCategory] = useState(STYLE_CATEGORIES[0].id);

  const copyToClipboard = (hexList: string[]) => {
    navigator.clipboard.writeText(hexList.join(", ")).then(() => alert("Palette copied!"));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Curated Palette Library</h2>
        <p className="dim-badge" style={{ margin: 0 }}>Explore our massive collection of professionally designed color palettes.</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', WebkitOverflowScrolling: 'touch' }}>
        {STYLE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className="chip"
            style={{ 
              background: activeCategory === cat.id ? 'var(--text)' : 'var(--card)', 
              color: activeCategory === cat.id ? 'var(--bg)' : 'var(--text)',
              whiteSpace: 'nowrap'
            }}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {STYLE_CATEGORIES.find(c => c.id === activeCategory)?.palettes.map((palette: Palette, idx: number) => (
          <div key={idx} style={{ background: 'var(--card)', border: '1px solid var(--line)', padding: '16px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontSize: '15px' }}>{palette.name}</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="pb" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => copyToClipboard(palette.colors)}>Copy</button>
                <button className="pb" style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' }} onClick={() => setGlobalPalette(palette.colors)}>Apply</button>
              </div>
            </div>
            
            <div style={{ display: 'flex', height: '60px', borderRadius: '8px', overflow: 'hidden' }}>
              {palette.colors.map((c, i) => (
                <div key={i} style={{ background: c, flex: 1 }} title={c.toUpperCase()}></div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
              {palette.colors.map((c, i) => (
                <span key={i} style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{c.toUpperCase()}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
