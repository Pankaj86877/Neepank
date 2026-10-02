"use client";

import React, { useRef, useState, useEffect } from "react";
import JSZip from "jszip";

type PNGFile = {
  id: string;
  file: File;
  url: string;
  imgElement?: HTMLImageElement;
};

export const PNGOverlaySection = () => {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<PNGFile[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [color, setColor] = useState("#F95C15");

  const [scale, setScale] = useState(1.0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDropzoneHover, setIsDropzoneHover] = useState(false);
  
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  
  const hasDragged = useRef(false);

  const uploadedImage = activeIndex >= 0 && files[activeIndex]?.imgElement ? files[activeIndex].imgElement : null;

  useEffect(() => {
    function renderPreview() {
      if (!uploadedImage) return;
      
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = uploadedImage.width;
      canvas.height = uploadedImage.height;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.save();
      ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
      ctx.scale(flipH ? -scale : scale, flipV ? -scale : scale);
      
      // Draw image
      ctx.drawImage(uploadedImage, -uploadedImage.width / 2, -uploadedImage.height / 2);

      // Apply color overlay
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = color;
      ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
      
      ctx.restore();
    }

    renderPreview();
  }, [uploadedImage, color, scale, offsetX, offsetY, flipH, flipV]);

  const handleFiles = (fileList: FileList) => {
    const validFiles = Array.from(fileList).filter((f) => 
      f.type === "image/png" || f.type === "image/jpeg" || f.type === "image/webp" || f.name.toLowerCase().endsWith(".png")
    );
    
    if (validFiles.length === 0) return;

    // We process each file into an imgElement asynchronously
    const newFilesPromises = validFiles.map((f) => {
      return new Promise<PNGFile>((resolve) => {
        const url = URL.createObjectURL(f);
        const img = new Image();
        img.onload = () => {
          resolve({
            id: Math.random().toString(36).substring(7),
            file: f,
            url,
            imgElement: img
          });
        };
        img.src = url;
      });
    });

    Promise.all(newFilesPromises).then((newFiles) => {
      setFiles((prev) => {
        const combined = [...prev, ...newFiles];
        if (prev.length === 0 && combined.length > 0) {
          setActiveIndex(0);
        }
        return combined;
      });
    });
  };

  const removeFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      if (filtered.length === 0) {
        setActiveIndex(-1);
      } else if (activeIndex >= filtered.length) {
        setActiveIndex(filtered.length - 1);
      }
      return filtered;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    hasDragged.current = false;
    if (!uploadedImage || !previewCanvasRef.current) return;
    setIsDragging(true);
    const rect = previewCanvasRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX * (previewCanvasRef.current.width / rect.width) - offsetX,
      y: e.clientY * (previewCanvasRef.current.height / rect.height) - offsetY,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !previewCanvasRef.current) return;
    hasDragged.current = true;
    const rect = previewCanvasRef.current.getBoundingClientRect();
    setOffsetX(e.clientX * (previewCanvasRef.current.width / rect.width) - dragStart.x);
    setOffsetY(e.clientY * (previewCanvasRef.current.height / rect.height) - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleContainerClick = () => {
    if (!hasDragged.current && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleWheel = (e: React.WheelEvent) => {
    if (!uploadedImage) return;
    let newScale = scale * (e.deltaY < 0 ? 1.04 : 0.96);
    newScale = Math.max(0.05, Math.min(newScale, 15));
    setScale(newScale);
  };

  const downloadPreview = () => {
    if (!uploadedImage || !previewCanvasRef.current || activeIndex < 0) return;
    const a = document.createElement("a");
    a.href = previewCanvasRef.current.toDataURL("image/png", 1.0);
    const fname = files[activeIndex].file.name.split(".")[0];
    a.download = `${fname}_colored.png`;
    a.click();
  };

  const downloadAll = async () => {
    setIsProcessingAll(true);
    setProgress({ current: 0, total: files.length });

    const zip = new JSZip();
    
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.imgElement) {
        // Create an offline canvas to process this specific image
        const c = document.createElement("canvas");
        c.width = f.imgElement.width;
        c.height = f.imgElement.height;
        const cx = c.getContext("2d");
        if (cx) {
          cx.imageSmoothingEnabled = true;
          cx.imageSmoothingQuality = "high";
          
          cx.save();
          // Apply transforms
          cx.translate(c.width / 2 + offsetX, c.height / 2 + offsetY);
          cx.scale(flipH ? -scale : scale, flipV ? -scale : scale);
          
          cx.drawImage(f.imgElement, -f.imgElement.width / 2, -f.imgElement.height / 2);
          
          cx.globalCompositeOperation = "source-in";
          cx.fillStyle = color;
          cx.fillRect(-c.width, -c.height, c.width * 2, c.height * 2);
          cx.restore();

          const dataUrl = c.toDataURL("image/png", 1.0);
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
          const safeName = f.file.name.split(".")[0];
          zip.file(`${safeName}_colored.png`, base64Data, { base64: true });
        }
      }
      setProgress({ current: i + 1, total: files.length });
      // small delay to allow UI to update
      await new Promise(r => setTimeout(r, 10));
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `colored_pngs_batch.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setIsProcessingAll(false);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset this tool? All unsaved work will be lost.")) {
      setFiles([]);
      setActiveIndex(-1);
      setColor("#F95C15");
      setScale(1.0);
      setOffsetX(0);
      setOffsetY(0);
      setFlipH(false);
      setFlipV(false);
      setIsProcessingAll(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return (
    <div className="ws">
      <div className="stage" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', overflowY: 'auto' }}>
        <div 
          className={`checkered-bg ${isDropzoneHover ? "drag-over" : ""}`}
          style={{ 
            flex: 1,
            width: "100%", 
            background: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYNgfQMQMNIDx/8nO/8eLh4ENGI0CUcOIAXQxE+MDBw0ZNQzUgNEDCgAABh8Yt+r4R0YAAAAASUVORK5CYII=') repeat",
            borderRadius: "12px",
            border: isDropzoneHover ? "2px dashed var(--brand)" : "1px solid var(--line)",
            position: "relative",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            transition: "all 0.2s ease"
          }}
          ref={containerRef}
          onClick={handleContainerClick}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          onDragEnter={(e) => { e.preventDefault(); setIsDropzoneHover(true); }}
          onDragOver={(e) => { e.preventDefault(); setIsDropzoneHover(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDropzoneHover(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDropzoneHover(false);
            if (e.dataTransfer.files.length) {
              handleFiles(e.dataTransfer.files);
            }
          }}
        >
          {files.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none", color: 'var(--text)' }}>
              <span style={{ fontSize: "48px", marginBottom: "16px" }}>📤</span>
              <span style={{ fontSize: "16px", fontWeight: 600 }}>Click to Upload</span>
              <span style={{ fontSize: "13px", color: "var(--muted)", marginTop: "8px" }}>or drag & drop files here</span>
            </div>
          ) : (
            <canvas ref={previewCanvasRef} style={{ width: "100%", height: "100%", objectFit: "contain" }}></canvas>
          )}
          
          <input type="file" ref={fileInputRef} accept=".png,image/png,image/jpeg,image/webp" multiple style={{ display: "none" }} onChange={(e) => { if(e.target.files) handleFiles(e.target.files); }} />
        </div>
        
        <div className="hint" style={{ textAlign: 'center' }}>💡 Click to upload/add more · Drag to reposition · Scroll to zoom</div>
        
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={(e) => { e.preventDefault(); setIsDropzoneHover(true); }}
          onDragOver={(e) => { e.preventDefault(); setIsDropzoneHover(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDropzoneHover(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDropzoneHover(false);
            if (e.dataTransfer.files.length) {
              handleFiles(e.dataTransfer.files);
            }
          }}
          style={{ 
            border: '2px dashed var(--line)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'var(--card)',
            transition: 'all 0.2s ease',
            borderColor: isDropzoneHover ? 'var(--brand)' : 'var(--line)'
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🖼️</div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Drop PNG files here or click to browse</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Multiple files supported · .PNG only</div>
        </div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>PNG Color Overlay</h3>
          <button className="chip" onClick={handleReset}>Reset</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: '8px' }}>
              <span className="lb" style={{ margin: 0 }}>Upload Assets Preview</span>
              {files.length > 0 && (
                 <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} style={{ fontSize: "11px", background: "var(--bg)", border: "1px solid var(--line)", color: "var(--text)", padding: "4px 8px", borderRadius: "4px", cursor: "pointer" }}>+ ADD MORE</button>
              )}
            </div>
            
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", padding: "10px", minHeight: "80px", border: '1px dashed var(--line)', borderRadius: '8px', background: 'var(--bg)', alignItems: 'flex-start', alignContent: 'flex-start' }}>
              {files.length === 0 ? (
                <div style={{ width: "100%", textAlign: "center", color: "var(--muted)", fontSize: "12px", fontFamily: "var(--font-mono)", alignSelf: "center" }}>No files added yet</div>
              ) : (
                files.map((f, idx) => (
                  <div
                    key={f.id}
                    onClick={() => setActiveIndex(idx)}
                    className="checkered-bg"
                    style={{ position: "relative", width: "60px", height: "60px", borderRadius: "8px", overflow: "hidden", cursor: "pointer", border: idx === activeIndex ? "2px solid var(--brand)" : "1px solid var(--line)" }}
                  >
                    <img src={f.url} style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }} />
                    <button
                      onClick={(e) => removeFile(e, f.id)}
                      style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", color: "white", border: "none", borderRadius: "50%", width: "16px", height: "16px", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >✕</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="lb">Color Tint</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: "100%", height: "60px", cursor: "pointer", border: "1px solid var(--line)", borderRadius: "8px", padding: 0 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px' }}>
                {["#072942", "#286070", "#F95C15", "#2DBFF9", "#43E098", "#E8F0F2", "#DDFFEA", "#FFFFFF"].map((c) => (
                  <button
                    key={c}
                    style={{ background: c, border: c === "#FFFFFF" ? "1px solid var(--line)" : "none", height: '24px', borderRadius: '4px', cursor: 'pointer', outline: color === c ? '2px solid var(--text)' : 'none', outlineOffset: '2px' }}
                    onClick={() => setColor(c)}
                  ></button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="lb">Preview Transformations</div>
            <div className="two">
              <button className="pb" style={flipH ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : {}} onClick={() => setFlipH(!flipH)}>↔ Flip H</button>
              <button className="pb" style={flipV ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : {}} onClick={() => setFlipV(!flipV)}>↕ Flip V</button>
            </div>
          </div>

          <div>
            <div className="lb">Zoom <b>{scale.toFixed(2)}x</b></div>
            <input type="range" min="0.1" max="5" step="0.01" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} disabled={!uploadedImage} style={{ width: '100%', accentColor: 'var(--brand)' }} />
          </div>
          
          <div className="two">
            <div>
              <div className="lb">X <b>{Math.round(offsetX)}px</b></div>
              <input type="range" min="-1500" max="1500" step="1" value={offsetX} onChange={(e) => setOffsetX(parseInt(e.target.value))} disabled={!uploadedImage} style={{ width: '100%', accentColor: 'var(--brand)' }} />
            </div>
            <div>
              <div className="lb">Y <b>{Math.round(offsetY)}px</b></div>
              <input type="range" min="-1500" max="1500" step="1" value={offsetY} onChange={(e) => setOffsetY(parseInt(e.target.value))} disabled={!uploadedImage} style={{ width: '100%', accentColor: 'var(--brand)' }} />
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            {isProcessingAll && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--brand)", textAlign: "center", marginBottom: '8px' }}>Processing {progress.current} / {progress.total}…</div>
                <div style={{ height: "6px", background: "var(--line)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(progress.current / progress.total) * 100}%`, background: "var(--brand)", borderRadius: "4px", transition: "width 0.2s ease" }}></div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button className="dl" onClick={downloadAll} disabled={files.length === 0 || isProcessingAll} style={{ width: '100%', background: "var(--brand)", color: '#fff', border: 'none', opacity: (files.length === 0 || isProcessingAll) ? 0.5 : 1 }}>⬇ Download All (ZIP)</button>
              <button className="pb" onClick={downloadPreview} disabled={!uploadedImage} style={{ width: '100%', background: "var(--bg)", opacity: !uploadedImage ? 0.5 : 1 }}>⬇ Download Current Preview</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
