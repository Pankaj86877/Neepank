"use client";

import React, { useMemo, useState } from "react";

export type SavedPalette = {
  id: string;
  name: string;
  group: string;
  colors: string[];
};

type Props = {
  savedPalettes: SavedPalette[];
  setGlobalPalette: (colors: string[]) => void;
  onDeletePalette: (id: string) => void;
};

export const SavedPalettesSection: React.FC<Props> = ({ savedPalettes, setGlobalPalette, onDeletePalette }) => {
  const [activeGroup, setActiveGroup] = useState<string>("All");

  const copyToClipboard = (hexList: string[]) => {
    navigator.clipboard.writeText(hexList.join(", ")).then(() => alert("Palette copied!"));
  };

  const groups = useMemo(() => {
    const allGroups = new Set(savedPalettes.map(p => p.group));
    return ["All", ...Array.from(allGroups)];
  }, [savedPalettes]);

  const displayedPalettes = useMemo(() => {
    if (activeGroup === "All") return savedPalettes;
    return savedPalettes.filter(p => p.group === activeGroup);
  }, [savedPalettes, activeGroup]);

  if (!savedPalettes.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--card)', padding: '32px', borderRadius: '16px', border: '1px solid var(--line)' }}>
      <div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>My Saved Palettes</h2>
        <p className="dim-badge" style={{ margin: 0 }}>Palettes you have saved from the editor.</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', WebkitOverflowScrolling: 'touch' }}>
        {groups.map(g => (
          <button
            key={g}
            className="chip"
            style={{ 
              background: activeGroup === g ? 'var(--text)' : 'var(--bg)', 
              color: activeGroup === g ? 'var(--bg)' : 'var(--text)',
              whiteSpace: 'nowrap'
            }}
            onClick={() => setActiveGroup(g)}
          >
            {g}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {displayedPalettes.map((palette) => (
          <div key={palette.id} style={{ background: 'var(--bg)', border: '1px solid var(--line)', padding: '16px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{palette.name}</h4>
                <div style={{ fontSize: '11px', color: 'var(--muted)', background: 'var(--card)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>{palette.group}</div>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button className="pb" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => copyToClipboard(palette.colors)}>Copy</button>
                <button className="pb" style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--text)', color: 'var(--bg)', borderColor: 'var(--text)' }} onClick={() => setGlobalPalette(palette.colors)}>Apply</button>
                <button className="pb" style={{ padding: '4px 8px', fontSize: '12px', color: 'red' }} onClick={() => { if(window.confirm('Delete this palette?')) onDeletePalette(palette.id) }}>Delete</button>
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
