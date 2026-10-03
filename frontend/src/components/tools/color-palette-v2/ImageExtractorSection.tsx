"use client";

import React, { useRef, useState } from "react";
import { generateComplementary, generateAnalogous, generateMonochromatic } from "./colorTheory";

type Props = {
  globalPalette: string[];
  setGlobalPalette: (colors: string[]) => void;
};

export const ImageExtractorSection: React.FC<Props> = ({ globalPalette, setGlobalPalette }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [colorCount, setColorCount] = useState(5);

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  const extractPalette = (imgElement: HTMLImageElement, count: number) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const maxSize = 200;
    let width = imgElement.width;
    let height = imgElement.height;
    
    if (width > height) {
      if (width > maxSize) { height *= maxSize / width; width = maxSize; }
    } else {
      if (height > maxSize) { width *= maxSize / height; height = maxSize; }
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imgElement, 0, 0, width, height);

    const data = ctx.getImageData(0, 0, width, height).data;
    const colorCounts: Record<string, number> = {};
    const colorRgb: Record<string, [number, number, number]> = {};

    for (let i = 0; i < data.length; i += 16) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 125) continue;
      if (r > 240 && g > 240 && b > 240) continue;
      if (r < 15 && g < 15 && b < 15) continue;

      const qR = Math.floor(r / 32) * 32;
      const qG = Math.floor(g / 32) * 32;
      const qB = Math.floor(b / 32) * 32;
      
      const key = `${qR},${qG},${qB}`;
      if (colorCounts[key]) {
        colorCounts[key]++;
      } else {
        colorCounts[key] = 1;
        colorRgb[key] = [r, g, b];
      }
    }

    const sortedKeys = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);
    const extractedHex = sortedKeys.slice(0, count).map(key => rgbToHex(...colorRgb[key]));

    while (extractedHex.length < count && extractedHex.length > 0) {
      extractedHex.push(extractedHex[0]);
    }
    
    setGlobalPalette(extractedHex);
    setIsProcessing(false);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return alert("Please upload an image file.");
    setIsProcessing(true);
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);
      const img = new Image();
      img.onload = () => extractPalette(img, colorCount);
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const reExtract = (count: number) => {
    setColorCount(count);
    if (imageSrc) {
      setIsProcessing(true);
      const img = new Image();
      img.onload = () => extractPalette(img, count);
      img.src = imageSrc;
    }
  };

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      const btn = document.getElementById(`btn-img-${hex}`);
      if (btn) {
        const orig = btn.innerText;
        btn.innerText = "Copied!";
        setTimeout(() => btn.innerText = orig, 1000);
      }
    });
  };

  const copyFullPalette = () => {
    navigator.clipboard.writeText(globalPalette.join(", ")).then(() => alert("Palette copied!"));
  };

  const applyTheory = (type: 'comp' | 'ana' | 'mono') => {
    if (!globalPalette.length) return;
    const base = globalPalette[0];
    let newPal: string[] = [];
    if (type === 'comp') newPal = generateComplementary(base, colorCount);
    if (type === 'ana') newPal = generateAnalogous(base, colorCount);
    if (type === 'mono') newPal = generateMonochromatic(base, colorCount);
    setGlobalPalette(newPal);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg)', padding: '32px', borderRadius: '16px', border: '1px solid var(--line)' }}>
      <div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>Image Extractor</h2>
        <p className="dim-badge" style={{ margin: 0 }}>Upload an image to extract its dominant colors.</p>
      </div>

      {!imageSrc ? (
        <div
          className={`dz-upload-zone ${isDragOver ? "drag-over" : ""}`}
          style={{
            border: `2px dashed ${isDragOver ? 'var(--brand)' : 'var(--line)'}`,
            borderRadius: '12px', padding: '60px 24px', textAlign: 'center', cursor: 'pointer',
            background: isDragOver ? 'rgba(232, 104, 47, 0.05)' : 'var(--card)', transition: 'all 0.2s'
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
          <div style={{ fontWeight: 600, fontSize: '18px', marginBottom: '8px' }}>Drop an image here or click to browse</div>
          <div style={{ fontSize: '14px', color: 'var(--muted)' }}>JPG, PNG, WEBP supported</div>
          <input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <img src={imageSrc} alt="Uploaded" style={{ width: '100%', maxHeight: '350px', objectFit: 'contain', borderRadius: '12px', background: 'var(--card)', border: '1px solid var(--line)' }} />
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontWeight: 600, fontSize: '14px' }}>{fileName}</span>
               <button className="pb" onClick={() => setImageSrc(null)}>Remove Image</button>
             </div>
          </div>
          
          <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
             {isProcessing ? (
                <div style={{ padding: '40px', textAlign: 'center', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)', color: 'var(--brand)' }}>
                  Analyzing colors...
                </div>
             ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${globalPalette.length}, 1fr)`, height: '180px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid var(--line)' }}>
                    {globalPalette.map((hex, i) => (
                      <div key={i} style={{ background: hex, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <div style={{ background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '12px', textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{hex.toUpperCase()}</div>
                          <button id={`btn-img-${hex}`} onClick={() => copyToClipboard(hex)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', marginTop: '4px', cursor: 'pointer', width: '100%' }}>Copy</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '14px', fontWeight: 600 }}>Colors:</label>
                      <input type="range" min="3" max="8" value={colorCount} onChange={(e) => reExtract(parseInt(e.target.value))} style={{ width: '100px', accentColor: 'var(--brand)' }} />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--brand)' }}>{colorCount}</span>
                    </div>
                    <button className="chip" style={{ background: 'var(--text)', color: 'var(--bg)' }} onClick={copyFullPalette}>Copy Full Palette</button>
                  </div>

                  <div style={{ padding: '16px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Color Theory Variations (Based on Dominant Color)</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="pb" onClick={() => applyTheory('comp')}>Complementary</button>
                      <button className="pb" onClick={() => applyTheory('ana')}>Analogous</button>
                      <button className="pb" onClick={() => applyTheory('mono')}>Monochromatic</button>
                    </div>
                  </div>
                </>
             )}
          </div>
        </div>
      )}
    </div>
  );
};
