"use client";

import React, { useRef, useState } from "react";
import JSZip from "jszip";

type FileObj = {
  id: string;
  file: File;
  img: HTMLImageElement;
  url: string;
  width: number;
  height: number;
};

export const FormatConverterSection = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileObj[]>([]);
  const [outFormat, setOutFormat] = useState("image/png");
  const [outExt, setOutExt] = useState("png");
  const [compMode, setCompMode] = useState<"quality" | "target">("quality");
  const [targetKb, setTargetKb] = useState<number | "">(500);
  const [quality, setQuality] = useState(92);
  const [resizeW, setResizeW] = useState<number | "">("");
  const [resizeH, setResizeH] = useState<number | "">("");
  const [lockAR, setLockAR] = useState(true);
  const [bgColor, setBgColor] = useState("#FFFFFF");

  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusChip, setStatusChip] = useState<"Ready" | "Processing..." | "Done" | "Error">("Ready");

  const handleFiles = async (fileList: FileList | File[]) => {
    setStatusChip("Processing...");
    setIsProcessing(true);
    const loadPromises: Promise<void>[] = [];
    const newFiles: FileObj[] = [];

    for (let i = 0; i < fileList.length; i++) {
      let file = fileList[i];
      const isHeic = file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif") || file.type === "image/heic" || file.type === "image/heif";
      
      if (!file.type.startsWith("image/") && !isHeic) continue;

      const promise = new Promise<void>(async (resolve) => {
        try {
          if (isHeic) {
            const heicModule = await import("heic-to");
            const heicTo = heicModule.heicTo || (heicModule as any).default?.heicTo;
            
            const convertedBlob = await (heicTo as any)({ blob: file, toType: "image/jpeg", quality: 0.9 });
            const blobArray = Array.isArray(convertedBlob) ? convertedBlob : [convertedBlob];
            
            if (!blobArray[0]) throw new Error("HEIC conversion returned empty blob");
            
            file = new File([blobArray[0]], file.name.replace(/\.heic$|\.heif$/i, ".jpg"), { type: "image/jpeg" });
          }

          const url = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
            newFiles.push({
              id: Date.now().toString() + Math.random().toString().slice(2, 6),
              file: file,
              img: img,
              url: url,
              width: img.width,
              height: img.height,
            });
            resolve();
          };
          img.onerror = (e) => {
            console.error("Image load error on canvas:", e);
            resolve();
          };
          img.src = url;
        } catch (e: any) {
          console.error("Image loading/conversion failed:", e?.message || e);
          alert(`Failed to process ${file.name}. ${e?.message || "It might be corrupted or unsupported."}`);
          resolve();
        }
      });
      loadPromises.push(promise);
    }

    await Promise.all(loadPromises);

    setFiles((prev) => {
      const combined = [...prev, ...newFiles];
      if (prev.length === 0 && combined.length > 0) {
        if (!resizeW) setResizeW(combined[0].width);
        if (!resizeH) setResizeH(combined[0].height);
      }
      return combined;
    });
    
    setIsProcessing(false);
    setStatusChip("Ready");
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    files.forEach((f) => URL.revokeObjectURL(f.url));
    setFiles([]);
    setResizeW("");
    setResizeH("");
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset this tool? All unsaved work will be lost.")) {
      clearAll();
      setOutFormat("image/png");
      setOutExt("png");
      setCompMode("quality");
      setTargetKb(500);
      setQuality(92);
      setLockAR(true);
      setBgColor("#FFFFFF");
      setIsProcessing(false);
      setProgress(0);
      setStatusChip("Ready");
    }
  };

  const handleResizeWChange = (val: string) => {
    const w = val === "" ? "" : parseInt(val);
    setResizeW(w);
    if (lockAR && files.length > 0 && typeof w === "number") {
      const aspect = files[0].height / files[0].width;
      setResizeH(Math.round(w * aspect));
    }
  };

  const handleResizeHChange = (val: string) => {
    const h = val === "" ? "" : parseInt(val);
    setResizeH(h);
    if (lockAR && files.length > 0 && typeof h === "number") {
      const aspect = files[0].width / files[0].height;
      setResizeW(Math.round(h * aspect));
    }
  };

  const processSingleFile = async (fileObj: FileObj, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const targetW = typeof resizeW === "number" ? resizeW : fileObj.width;
    const targetH = typeof resizeH === "number" ? resizeH : fileObj.height;

    canvas.width = targetW;
    canvas.height = targetH;

    if (outFormat === "image/jpeg") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(fileObj.img, 0, 0, targetW, targetH);

    let finalDataUrl = "";
    
    if (compMode === "target" && (outFormat === "image/jpeg" || outFormat === "image/webp")) {
       let minQ = 0.1;
       let maxQ = 0.95;
       let currentQ = 0.95;
       let bestUrl = "";
       let bestSize = Infinity;
       let closestValidUrl = "";
       let iters = 0;
       const targetBytes = (typeof targetKb === "number" ? targetKb : 500) * 1024;
       
       while (iters < 8 && minQ <= maxQ) {
         iters++;
         const testUrl = canvas.toDataURL(outFormat, currentQ);
         const base64Length = testUrl.length - (testUrl.indexOf(",") + 1);
         const sizeBytes = base64Length * 0.75;
         
         if (sizeBytes <= targetBytes) {
           closestValidUrl = testUrl;
           minQ = currentQ + 0.05;
         } else {
           maxQ = currentQ - 0.05;
         }
         
         if (sizeBytes < bestSize) {
           bestSize = sizeBytes;
           bestUrl = testUrl;
         }
         currentQ = (minQ + maxQ) / 2;
         await new Promise(r => setTimeout(r, 0)); // Yield to prevent UI freeze during batch processing
       }
       
       finalDataUrl = closestValidUrl || bestUrl;
    } else {
       const q = quality / 100;
       finalDataUrl = canvas.toDataURL(outFormat, q);
    }

    const res = await fetch(finalDataUrl);
    const blob = await res.blob();

    return { blob, dataUrl: finalDataUrl, targetW, targetH };
  };

  const convertAndDownload = async () => {
    if (files.length === 0) return;

    setStatusChip("Processing...");
    setIsProcessing(true);
    setProgress(5);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      if (files.length === 1) {
        const result = await processSingleFile(files[0], canvas, ctx);
        setProgress(100);

        const safeName = files[0].file.name.split(".")[0];
        const link = document.createElement("a");
        link.download = `${safeName}_converted.${outExt}`;
        link.href = result.dataUrl;
        link.click();
      } else {
        const zip = new JSZip();
        const folder = zip.folder("batch-converted");
        
        for (let i = 0; i < files.length; i++) {
          const fileObj = files[i];
          const result = await processSingleFile(fileObj, canvas, ctx);
          const safeName = fileObj.file.name.split(".")[0];
          folder?.file(`${safeName}_converted.${outExt}`, result.blob);

          setProgress(5 + ((i + 1) / files.length) * 80);
        }

        setStatusChip("Processing...");
        const zipBlob = await zip.generateAsync({ type: "blob" });
        setProgress(100);

        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.download = `batch-converted.zip`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }

      setStatusChip("Done");
    } catch (err) {
      console.error(err);
      setStatusChip("Error");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
        setStatusChip("Ready");
      }, 3000);
    }
  };

  return (
    <div className="ws">
      <div className="stage" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', justifyContent: 'flex-start', alignItems: 'stretch' }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
          <h3>Source Images</h3>
          <span style={{ fontSize: '12px', color: 'var(--muted)', background: 'var(--card)', border: '1px solid var(--line)', padding: '4px 8px', borderRadius: '4px' }}>
            {files.length > 0 ? `${files.length} Image(s)` : "—"}
          </span>
        </div>

        <div
          className={`dz-upload-zone ${isDragOver ? "drag-over" : ""}`}
          style={{ 
            border: `2px dashed ${isDragOver ? 'var(--brand)' : 'var(--line)'}`, 
            borderRadius: '12px', 
            padding: '40px', 
            textAlign: 'center', 
            cursor: 'pointer',
            background: isDragOver ? 'rgba(232, 104, 47, 0.05)' : 'var(--card)',
            transition: 'all 0.2s'
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🖼</div>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>Drop image(s) or click to browse</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>HEIC · JPG · PNG · WEBP · GIF · BMP</div>
          <input type="file" ref={fileInputRef} accept="image/*,.heic,.heif" multiple style={{ display: "none" }} onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {files.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--muted)", fontSize: "14px" }}>No images uploaded</div>
          ) : (
            files.map((fileObj, idx) => (
              <div key={fileObj.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--card)', border: '1px solid var(--line)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--muted)', width: '20px' }}>{idx + 1}</div>
                <img src={fileObj.url} alt={fileObj.file.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--line)' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileObj.file.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{(fileObj.file.size / 1024).toFixed(1)} KB • {fileObj.width}×{fileObj.height}</div>
                </div>
                <button onClick={() => removeFile(fileObj.id)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '16px', padding: '4px 8px' }}>✕</button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Conversion Options</h3>
          <button className="chip" onClick={handleReset}>Reset</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div className="lb">Output Format</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              <button className="pb" style={outFormat === "image/jpeg" ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : {}} onClick={() => { setOutFormat("image/jpeg"); setOutExt("jpg"); }}>JPG</button>
              <button className="pb" style={outFormat === "image/png" ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : {}} onClick={() => { setOutFormat("image/png"); setOutExt("png"); }}>PNG</button>
              <button className="pb" style={outFormat === "image/webp" ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : {}} onClick={() => { setOutFormat("image/webp"); setOutExt("webp"); }}>WEBP</button>
            </div>
          </div>

          {outFormat !== "image/png" && (
            <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px' }}>
              <div className="lb" style={{ marginBottom: '12px' }}>Quality & Compression</div>
              
              <div style={{ display: 'flex', gap: '8px', background: 'var(--card)', padding: '4px', borderRadius: '8px', border: '1px solid var(--line)', marginBottom: '12px' }}>
                  <button style={{ flex: 1, padding: '6px', border: 'none', background: compMode === 'quality' ? 'var(--bg)' : 'transparent', color: 'var(--text)', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: compMode === 'quality' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }} onClick={() => setCompMode('quality')}>Manual Quality</button>
                  <button style={{ flex: 1, padding: '6px', border: 'none', background: compMode === 'target' ? 'var(--bg)' : 'transparent', color: 'var(--text)', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: compMode === 'target' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }} onClick={() => { setCompMode('target'); if (outFormat === 'image/png') { setOutFormat('image/jpeg'); setOutExt('jpg'); } }}>Target Size</button>
              </div>

              {compMode === 'quality' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <input type="range" min="1" max="100" value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} style={{ flex: 1, accentColor: 'var(--brand)' }} />
                  <div style={{ width: '40px', textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '14px' }}>{quality}%</div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                  <input type="number" min="1" value={targetKb} onChange={(e) => setTargetKb(e.target.value === "" ? "" : parseInt(e.target.value) || 0)} style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--text)', padding: '10px', borderRadius: '6px', fontSize: '14px' }} placeholder="Target size in KB" />
                  <div style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--text)', padding: '10px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', fontWeight: 600 }}>KB</div>
                </div>
              )}
              
              <div style={{ fontSize: "11px", color: "var(--muted)" }}>{compMode === 'quality' ? "Quality affects JPG & WEBP output size." : "Target size is approximate and only applies to JPG & WEBP outputs."}</div>
            </div>
          )}

          <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px' }}>
            <div className="lb" style={{ marginBottom: '12px' }}>Resize (optional)</div>
            <div className="two">
              <div>
                <div style={{ fontSize: '12px', marginBottom: '4px', color: 'var(--muted)' }}>Width (px)</div>
                <input type="number" placeholder="Auto" min="1" max="8000" value={resizeW} onChange={(e) => handleResizeWChange(e.target.value)} style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--line)', padding: '8px', borderRadius: '6px', color: 'var(--text)' }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', marginBottom: '4px', color: 'var(--muted)' }}>Height (px)</div>
                <input type="number" placeholder="Auto" min="1" max="8000" value={resizeH} onChange={(e) => handleResizeHChange(e.target.value)} style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--line)', padding: '8px', borderRadius: '6px', color: 'var(--text)' }} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
              <input type="checkbox" checked={lockAR} onChange={(e) => setLockAR(e.target.checked)} style={{ accentColor: "var(--brand)", width: "16px", height: "16px", cursor: "pointer" }} />
              <label style={{ fontSize: "12px", color: "var(--text)", cursor: "pointer" }} onClick={() => setLockAR(!lockAR)}>Lock aspect ratio</label>
            </div>
          </div>

          {outFormat === "image/jpeg" && (
            <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px' }}>
              <div className="lb" style={{ marginBottom: '12px' }}>Background (for JPG)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ height: "36px", width: '100px', borderRadius: "6px", cursor: "pointer", padding: 0, border: '1px solid var(--line)' }} />
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>Fills transparency</span>
              </div>
            </div>
          )}

          <div style={{ marginTop: "auto", paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="lb" style={{ margin: 0 }}>Status</span>
              <span style={{ 
                fontSize: '11px', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                background: statusChip === "Processing..." ? 'rgba(232, 104, 47, 0.2)' : (statusChip === "Done" ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg)'),
                color: statusChip === "Processing..." ? 'var(--brand)' : (statusChip === "Done" ? '#10b981' : 'var(--muted)'),
                border: '1px solid',
                borderColor: statusChip === "Processing..." ? 'var(--brand)' : (statusChip === "Done" ? '#10b981' : 'var(--line)')
              }}>
                {statusChip}
              </span>
            </div>
            
            {isProcessing && (
              <div style={{ height: '4px', background: 'var(--line)', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ height: '100%', background: 'var(--brand)', width: `${progress}%`, transition: 'width 0.2s' }}></div>
              </div>
            )}
            
            <button className="dl" disabled={files.length === 0 || isProcessing} onClick={convertAndDownload} style={{ width: '100%', background: "var(--brand)", color: '#fff', border: 'none', opacity: (files.length === 0 || isProcessing) ? 0.5 : 1 }}>
              ⬇ Convert & Download
            </button>
            <button className="pb" onClick={clearAll} style={{ width: "100%", marginTop: "8px", border: 'none', background: 'transparent', color: 'var(--muted)' }}>
              ✕ Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
