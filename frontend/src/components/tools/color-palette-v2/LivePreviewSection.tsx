"use client";

import React, { useState } from "react";

import { SavedPalette } from "./SavedPalettesSection";

type Props = {
  globalPalette: string[];
  savedPalettes: SavedPalette[];
  setGlobalPalette: (colors: string[]) => void;
};

export const LivePreviewSection: React.FC<Props> = ({ globalPalette, savedPalettes, setGlobalPalette }) => {
  const [template, setTemplate] = useState<"website" | "cafe">("website");

  if (!globalPalette.length || globalPalette.length < 3) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--card)', padding: '32px', borderRadius: '16px', border: '1px solid var(--line)', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Live Design Preview</h2>
        <p className="dim-badge" style={{ margin: '0 auto' }}>Need at least 3 colors in the palette to generate a preview.</p>
      </div>
    );
  }

  // Map palette colors to functional roles
  const primary = globalPalette[0];
  const secondary = globalPalette[1];
  const accent = globalPalette[2];
  const bg1 = globalPalette.length > 3 ? globalPalette[3] : "#FFFFFF";
  const bg2 = globalPalette.length > 4 ? globalPalette[4] : "#F3F4F6";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--card)', padding: '32px', borderRadius: '16px', border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Live Design Preview</h2>
          <p className="dim-badge" style={{ margin: 0 }}>See your palette applied to real-world designs in real-time.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg)', padding: '4px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <button 
            className="pb" 
            style={{ background: template === "website" ? 'var(--text)' : 'transparent', color: template === "website" ? 'var(--bg)' : 'var(--text)', border: 'none' }}
            onClick={() => setTemplate("website")}
          >
            Website UI
          </button>
          <button 
            className="pb" 
            style={{ background: template === "cafe" ? 'var(--text)' : 'transparent', color: template === "cafe" ? 'var(--bg)' : 'var(--text)', border: 'none' }}
            onClick={() => setTemplate("cafe")}
          >
            Brand Identity
          </button>
        </div>
      </div>

      {savedPalettes.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginRight: '8px' }}>Test a Saved Palette:</span>
          {savedPalettes.map(p => (
            <button 
              key={p.id} 
              className="chip" 
              onClick={() => setGlobalPalette(p.colors)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'var(--bg)', border: '1px solid var(--line)' }}
            >
              <div style={{ display: 'flex', width: '24px', height: '12px', borderRadius: '2px', overflow: 'hidden' }}>
                {p.colors.slice(0, 3).map((c, i) => <div key={i} style={{ flex: 1, background: c }}></div>)}
              </div>
              <span style={{ fontSize: '12px' }}>{p.name}</span>
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: '32px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--line)', display: 'flex', justifyContent: 'center' }}>
        
        {template === "website" && (
          <div style={{ width: '100%', maxWidth: '800px', background: bg1, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: `1px solid ${bg2}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: primary }}></div>
                <span style={{ fontWeight: 700, color: primary }}>BrandName</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: secondary, fontWeight: 500 }}>
                <span>Features</span>
                <span>Pricing</span>
                <span>About</span>
              </div>
              <button style={{ background: accent, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>Get Started</button>
            </div>
            
            <div style={{ padding: '64px 24px', textAlign: 'center', background: `linear-gradient(135deg, ${bg1} 0%, ${bg2} 100%)` }}>
              <h1 style={{ margin: '0 0 16px 0', fontSize: '42px', color: primary, lineHeight: 1.2 }}>Build something amazing with this palette.</h1>
              <p style={{ margin: '0 auto 32px auto', fontSize: '18px', color: secondary, maxWidth: '500px', lineHeight: 1.5 }}>
                Your colors are dynamically mapped to this mockup. Try changing them in the editor above to see instant results!
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button style={{ background: primary, color: bg1, border: 'none', padding: '12px 24px', borderRadius: '6px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>Primary Action</button>
                <button style={{ background: 'transparent', color: primary, border: `2px solid ${primary}`, padding: '12px 24px', borderRadius: '6px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>Secondary Action</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', padding: '48px 24px', background: bg1 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ flex: 1, padding: '24px', background: bg2, borderRadius: '8px', border: `1px solid ${secondary}22` }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: accent, marginBottom: '16px', opacity: 0.8 }}></div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: primary }}>Feature {i}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: secondary, lineHeight: 1.6 }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {template === "cafe" && (
          <div style={{ width: '100%', maxWidth: '800px', display: 'flex', gap: '24px', fontFamily: 'serif' }}>
             <div style={{ flex: 1, background: primary, color: bg1, padding: '48px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '80px', height: '80px', border: `4px solid ${accent}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <span style={{ fontSize: '32px', color: accent }}>☕</span>
                </div>
                <h1 style={{ margin: '0 0 16px 0', fontSize: '36px', fontWeight: 400, letterSpacing: '2px', color: bg1 }}>THE ROASTERY</h1>
                <div style={{ width: '40px', height: '1px', background: accent, margin: '0 auto 16px auto' }}></div>
                <p style={{ fontSize: '14px', letterSpacing: '1px', color: bg2, textTransform: 'uppercase' }}>Est. 2026</p>
             </div>

             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: bg1, padding: '24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: `1px solid ${bg2}` }}>
                  <h3 style={{ margin: '0 0 16px 0', color: primary, fontSize: '20px', borderBottom: `1px solid ${bg2}`, paddingBottom: '8px' }}>Menu</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: secondary }}>
                    <span>Espresso</span>
                    <span style={{ color: accent }}>$3.50</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: secondary }}>
                    <span>Latte</span>
                    <span style={{ color: accent }}>$4.50</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: secondary }}>
                    <span>Pour Over</span>
                    <span style={{ color: accent }}>$5.00</span>
                  </div>
                </div>

                <div style={{ background: accent, padding: '32px', borderRadius: '8px', color: primary, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Join our club</h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '14px', opacity: 0.9 }}>Get 10% off your first bag of beans.</p>
                  <button style={{ background: primary, color: bg1, border: 'none', padding: '10px 20px', borderRadius: '4px', fontFamily: 'sans-serif', fontWeight: 600, cursor: 'pointer', width: '100%' }}>Subscribe</button>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
