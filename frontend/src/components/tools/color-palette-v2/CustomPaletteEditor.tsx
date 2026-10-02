"use client";

import React from "react";

type Props = {
  globalPalette: string[];
  setGlobalPalette: (colors: string[]) => void;
  onSavePalette?: (name: string, group: string, colors: string[]) => void;
};

export const CustomPaletteEditor: React.FC<Props> = ({ globalPalette, setGlobalPalette, onSavePalette }) => {
  const [saveName, setSaveName] = React.useState("My Custom Palette");
  const [saveGroup, setSaveGroup] = React.useState("Favorites");
  
  const updateColor = (index: number, newHex: string) => {
    const newPal = [...globalPalette];
    newPal[index] = newHex;
    setGlobalPalette(newPal);
  };

  const removeColor = (index: number) => {
    if (globalPalette.length <= 2) return alert("Palette must have at least 2 colors");
    const newPal = [...globalPalette];
    newPal.splice(index, 1);
    setGlobalPalette(newPal);
  };

  const addColor = () => {
    if (globalPalette.length >= 10) return alert("Maximum 10 colors allowed");
    const newPal = [...globalPalette, "#E8682F"];
    setGlobalPalette(newPal);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(globalPalette.join(", ")).then(() => alert("Palette copied!"));
  };

  if (!globalPalette.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg)', padding: '32px', borderRadius: '16px', border: '1px solid var(--line)', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Custom Palette Editor</h2>
        <p className="dim-badge" style={{ margin: '0 auto' }}>Upload an image or apply a palette from the library to start editing.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg)', padding: '32px', borderRadius: '16px', border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Custom Palette Editor</h2>
          <p className="dim-badge" style={{ margin: 0 }}>Fine-tune your palette manually.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="pb" onClick={addColor}>+ Add Color</button>
          <button className="chip" style={{ background: 'var(--text)', color: 'var(--bg)' }} onClick={copyToClipboard}>Copy Full Palette</button>
        </div>
      </div>
      
      {onSavePalette && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Name:</label>
            <input type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px', width: '160px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 600 }}>Group:</label>
            <input type="text" value={saveGroup} onChange={(e) => setSaveGroup(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px', width: '140px' }} placeholder="e.g. Project X" />
          </div>
          <button className="chip" style={{ background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' }} onClick={() => { onSavePalette(saveName, saveGroup, globalPalette); alert("Saved to " + saveGroup + "!"); }}>Save Palette</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {globalPalette.map((hex, i) => (
          <div key={i} style={{ flex: '1 1 120px', minWidth: '120px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ height: '80px', background: hex, position: 'relative' }}>
              <input 
                type="color" 
                value={hex} 
                onChange={(e) => updateColor(i, e.target.value.toUpperCase())}
                style={{ opacity: 0, width: '100%', height: '100%', position: 'absolute', inset: 0, cursor: 'pointer' }}
              />
            </div>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: 'var(--muted)', fontSize: '14px' }}>#</span>
                <input 
                  type="text" 
                  value={hex.replace('#', '')} 
                  onChange={(e) => updateColor(i, '#' + e.target.value.toUpperCase())}
                  style={{ width: '100%', border: 'none', background: 'transparent', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: 'var(--text)', outline: 'none' }}
                  maxLength={6}
                />
              </div>
              <button 
                className="pb" 
                style={{ padding: '4px', fontSize: '11px', color: 'var(--muted)', border: '1px solid transparent' }} 
                onClick={() => removeColor(i)}
                onMouseOver={(e) => e.currentTarget.style.color = 'red'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--muted)'}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
