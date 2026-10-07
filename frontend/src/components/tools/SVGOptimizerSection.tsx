"use client";

import React, { useRef, useState } from "react";

export const SVGOptimizerSection = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [originalSvg, setOriginalSvg] = useState<string | null>(null);
  const [optimizedSvg, setOptimizedSvg] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [optimizedSize, setOptimizedSize] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const optimizeSVG = (svgText: string) => {
    let opt = svgText;
    
    // 1. Remove XML declaration & DOCTYPE
    opt = opt.replace(/<\?xml.*?\?>/gi, "");
    opt = opt.replace(/<!DOCTYPE.*?>/gi, "");
    
    // 2. Remove comments
    opt = opt.replace(/<!--[\s\S]*?-->/gi, "");
    
    // 3. Remove metadata, titles, and desc elements
    opt = opt.replace(/<metadata.*?>[\s\S]*?<\/metadata>/gi, "");
    opt = opt.replace(/<title.*?>[\s\S]*?<\/title>/gi, "");
    opt = opt.replace(/<desc.*?>[\s\S]*?<\/desc>/gi, "");
    
    // 4. Remove empty elements (e.g., <g></g> or <defs></defs>)
    let previous;
    do {
      previous = opt;
      opt = opt.replace(/<([a-z0-9-]+)[^>]*><\/\1>/gi, "");
    } while (opt !== previous);
    
    // 5. **AGGRESSIVE COMPRESSION**: Round floating point numbers to max 2 decimal places.
    // Design tools (Figma/Illustrator) export coordinates with 4-6 decimal places (e.g., 14.123456)
    // Rounding them to 2 decimal places (14.12) is visually identical but saves MASSIVE amounts of space.
    opt = opt.replace(/(\d+\.\d{3,})/g, (match) => {
      return parseFloat(match).toFixed(2).replace(/\.?0+$/, "");
    });
    
    // 6. Remove unnecessary whitespace and newlines
    opt = opt.replace(/>\s+</g, "><");
    opt = opt.replace(/\s{2,}/g, " ");
    opt = opt.trim();
    
    setOptimizedSvg(opt);
    setOptimizedSize(new Blob([opt]).size);
  };

  const handleFile = (file: File) => {
    if (file.type !== "image/svg+xml" && !file.name.toLowerCase().endsWith(".svg")) {
      alert("Please upload a valid SVG file.");
      return;
    }

    setFileName(file.name);
    setOriginalSize(file.size);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setOriginalSvg(text);
      optimizeSVG(text);
    };
    reader.readAsText(file);
  };

  const downloadOptimized = () => {
    if (!optimizedSvg) return;
    
    const blob = new Blob([optimizedSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(".svg", ".min.svg");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (optimizedSvg) {
      navigator.clipboard.writeText(optimizedSvg).then(() => {
        const btn = document.getElementById("copy-svg-btn");
        if (btn) {
          const orig = btn.innerText;
          btn.innerText = "Copied!";
          setTimeout(() => btn.innerText = orig, 1000);
        }
      });
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset this tool?")) {
      setOriginalSvg(null);
      setOptimizedSvg(null);
      setFileName("");
    }
  };

  const savedBytes = originalSize - optimizedSize;
  const savedPercent = originalSize > 0 ? ((savedBytes / originalSize) * 100).toFixed(1) : "0";

  return (
    <div className="ws">
      <div className="stage" style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', justifyContent: 'flex-start', alignItems: 'stretch' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0' }}>SVG Optimizer</h2>
          <p className="dim-badge" style={{ margin: 0 }}>Minify and clean up bulky SVG files for the web</p>
        </div>

        <div
          className={`dz-upload-zone ${isDragOver ? "drag-over" : ""}`}
          style={{
            border: '2px dashed var(--line)',
            borderRadius: '12px',
            padding: '40px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'var(--card)',
            transition: 'all 0.2s ease',
            borderColor: isDragOver ? 'var(--brand)' : 'var(--line)'
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡️</div>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>Drop an SVG file here or click to browse</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Only .svg files supported</div>
          <input type="file" ref={fileInputRef} accept=".svg,image/svg+xml" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        </div>

        {originalSvg && optimizedSvg && (
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ flex: 1, minWidth: 0, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                <span className="lb">Original ({formatSize(originalSize)})</span>
              </div>
              <div className="checkered-bg" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={`data:image/svg+xml;base64,${btoa(originalSvg)}`} style={{ maxWidth: '90%', maxHeight: '90%' }} alt="Original SVG" />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0, background: 'var(--card)', border: '1px solid var(--brand)', borderRadius: '12px', padding: '16px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--brand)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, boxShadow: '0 4px 12px rgba(67, 224, 152, 0.3)' }}>
                {savedPercent}% Smaller
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                <span className="lb">Optimized ({formatSize(optimizedSize)})</span>
              </div>
              <div className="checkered-bg" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={`data:image/svg+xml;base64,${btoa(optimizedSvg)}`} style={{ maxWidth: '90%', maxHeight: '90%' }} alt="Optimized SVG" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>SVG Optimizer</h3>
          <button className="chip" onClick={handleReset}>Reset</button>
        </div>
        
        {optimizedSvg ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#43E098', marginBottom: '4px' }}>-{formatSize(savedBytes)}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Saved by removing {savedPercent}% of unnecessary data</div>
            </div>
            
            <button className="pb" onClick={downloadOptimized} style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
              Download Optimized SVG
            </button>
            <button className="pb" id="copy-svg-btn" onClick={copyToClipboard} style={{ width: '100%', padding: '12px', fontSize: '15px', background: 'transparent', color: 'var(--brand)', border: '1px solid var(--brand)' }}>
              Copy SVG Code
            </button>
          </div>
        ) : (
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '8px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>How it works</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>
              Design tools like Illustrator and Figma often export SVGs with huge amounts of unnecessary metadata, comments, and empty tags. This tool strips all that away locally in your browser, drastically reducing file size without changing the visual appearance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
