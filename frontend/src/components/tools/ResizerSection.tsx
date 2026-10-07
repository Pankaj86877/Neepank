"use client";

import React, { useRef, useState, useEffect } from "react";

type FileData = {
  url: string;
  name: string;
  size: number;
  type: string;
  imgElement: HTMLImageElement;
};

type ResultData = {
  url: string;
  size: number;
  width: number;
  height: number;
  type: string;
};

export const ResizerSection = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mode, setMode] = useState<"photo" | "signature">("photo");
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  
  // Settings
  const [targetKb, setTargetKb] = useState<number>(50);
  const [targetW, setTargetW] = useState<number | "">(200);
  const [targetH, setTargetH] = useState<number | "">(230);
  const [lockAr, setLockAr] = useState<boolean>(false);
  const [originalAr, setOriginalAr] = useState<number>(1);
  const [bgColor, setBgColor] = useState<"none" | "#FFFFFF" | "#ADD8E6" | "#FFB6C1">("none");
  
  // Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");
  const [isDragOver, setIsDragOver] = useState<false | "photo" | "signature">(false);

  // Switch modes
  useEffect(() => {
    if (mode === "photo") {
      setTargetKb(50);
      setTargetW("");
      setTargetH("");
      setBgColor("none");
    } else {
      setTargetKb(20);
      setTargetW("");
      setTargetH("");
      setBgColor("none");
    }
    
    // If a file is already uploaded when switching modes, instantly reset to its original dimensions
    if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files.length > 0) {
      // It will use the blank strings to fallback to imgElement.width/height during compression
    }
  }, [mode]);

  const handleFile = (file: File) => {
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      setWarningMsg("Please upload a valid JPG or PNG image.");
      return;
    }
    
    setWarningMsg("");
    setResultData(null);
    setStatusMsg("");
    
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setFileData({
        url,
        name: file.name,
        size: file.size,
        type: file.type,
        imgElement: img
      });
      setOriginalAr(img.width / img.height);
      
      // Auto-set dimensions if blank
      if (targetW === "" && targetH === "") {
        setTargetW(img.width);
        setTargetH(img.height);
      }
    };
    img.src = url;
  };

  const handleWChange = (val: string) => {
    const w = val === "" ? "" : parseInt(val);
    setTargetW(w);
    if (lockAr && typeof w === "number" && w > 0) {
      setTargetH(Math.round(w / originalAr));
    }
  };

  const handleHChange = (val: string) => {
    const h = val === "" ? "" : parseInt(val);
    setTargetH(h);
    if (lockAr && typeof h === "number" && h > 0) {
      setTargetW(Math.round(h * originalAr));
    }
  };

  // Basic posterize for PNG to reduce colors/size since canvas has no quality slider for PNG
  const posterizeCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number, levels: number) => {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const factor = 255 / (levels - 1);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.round(data[i] / factor) * factor;
      data[i + 1] = Math.round(data[i + 1] / factor) * factor;
      data[i + 2] = Math.round(data[i + 2] / factor) * factor;
      // leave alpha alone
    }
    ctx.putImageData(imgData, 0, 0);
  };

  const compressImage = async () => {
    if (!fileData) return;
    
    const targetBytes = targetKb * 1024;
    
    if (targetBytes > fileData.size) {
      setWarningMsg(`Target size (${targetKb} KB) is larger than original file (${(fileData.size/1024).toFixed(1)} KB).`);
      return;
    }
    
    if (typeof targetW === "number" && typeof targetH === "number") {
      if (targetW < 80 || targetH < 80) {
        setWarningMsg("Warning: Dimensions are very small and may be illegible.");
      } else {
        setWarningMsg("");
      }
    }

    setIsProcessing(true);
    setResultData(null);
    setStatusMsg("Initializing...");

    const w = typeof targetW === "number" ? targetW : fileData.imgElement.width;
    const h = typeof targetH === "number" ? targetH : fileData.imgElement.height;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // Determine output format
    // If original is PNG and bgColor is 'none', keep PNG. Otherwise JPEG.
    const isPngOutput = fileData.type === "image/png" && bgColor === "none";
    const mimeType = isPngOutput ? "image/png" : "image/jpeg";

    // Draw background if not 'none' and outputting JPEG (to prevent black bg on transparent areas)
    if (bgColor !== "none") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
    } else if (!isPngOutput) {
      ctx.fillStyle = "#FFFFFF"; // Default white bg for JPEGs with transparency
      ctx.fillRect(0, 0, w, h);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    
    // Calculate scaling to completely contain the image within the target canvas (object-fit: contain)
    // This ensures no parts of the face/image are cut off. Empty space will be filled by the background color.
    const scale = Math.min(w / fileData.imgElement.width, h / fileData.imgElement.height);
    const scaledW = fileData.imgElement.width * scale;
    const scaledH = fileData.imgElement.height * scale;
    const dx = (w - scaledW) / 2;
    const dy = (h - scaledH) / 2;
    
    ctx.drawImage(fileData.imgElement, dx, dy, scaledW, scaledH);

    let finalDataUrl = "";
    let finalSize = 0;

    const getDataUrlSize = (url: string) => {
      const base64Length = url.length - (url.indexOf(",") + 1);
      const padding = url.charAt(url.length - 2) === "=" ? 2 : url.charAt(url.length - 1) === "=" ? 1 : 0;
      return (base64Length * 0.75 - padding);
    };

    if (isPngOutput) {
      // PNG lacks a native quality slider. We do a couple passes of posterization to simulate size reduction.
      setStatusMsg("Optimizing PNG colors... (Note: PNG convergence is less precise)");
      await new Promise(r => setTimeout(r, 100)); // UI yield
      
      let bestUrl = canvas.toDataURL("image/png");
      let bestSize = getDataUrlSize(bestUrl);
      
      if (bestSize > targetBytes) {
        const levelsToTry = [16, 8, 4]; // Color levels to posterize
        for (const levels of levelsToTry) {
          if (bestSize <= targetBytes) break;
          
          setStatusMsg(`Reducing PNG palette (Level ${levels})...`);
          await new Promise(r => setTimeout(r, 50));
          
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = w;
          tempCanvas.height = h;
          const tempCtx = tempCanvas.getContext("2d");
          if (tempCtx) {
            tempCtx.drawImage(canvas, 0, 0);
            posterizeCanvas(tempCtx, w, h, levels);
            const testUrl = tempCanvas.toDataURL("image/png");
            const testSize = getDataUrlSize(testUrl);
            if (testSize < bestSize) {
              bestSize = testSize;
              bestUrl = testUrl;
            }
          }
        }
      }
      
      finalDataUrl = bestUrl;
      finalSize = bestSize;
      
    } else {
      // Binary Search for JPEG quality
      let minQ = 0.1;
      let maxQ = 0.95;
      let currentQ = 0.95;
      
      let bestUrl = "";
      let bestSize = Infinity;
      let closestValidUrl = "";
      let closestValidSize = 0;
      
      let iters = 0;
      const maxIters = 8;
      
      while (iters < maxIters && minQ <= maxQ) {
        iters++;
        const testUrl = canvas.toDataURL("image/jpeg", currentQ);
        const sizeBytes = getDataUrlSize(testUrl);
        
        setStatusMsg(`Trying quality ${(currentQ * 100).toFixed(0)}%... ${(sizeBytes / 1024).toFixed(1)} KB`);
        await new Promise(r => setTimeout(r, 100)); // UI yield
        
        if (sizeBytes <= targetBytes) {
          // Valid result! Try to push quality higher
          closestValidUrl = testUrl;
          closestValidSize = sizeBytes;
          minQ = currentQ + 0.05;
        } else {
          // Too big, push quality lower
          maxQ = currentQ - 0.05;
        }
        
        // Track the absolute smallest we achieved just in case we never hit the target
        if (sizeBytes < bestSize) {
          bestSize = sizeBytes;
          bestUrl = testUrl;
        }
        
        currentQ = (minQ + maxQ) / 2;
      }
      
      if (closestValidUrl) {
        finalDataUrl = closestValidUrl;
        finalSize = closestValidSize;
      } else {
        // Failed to reach target even at minimum quality
        finalDataUrl = bestUrl;
        finalSize = bestSize;
        setWarningMsg(`Could not reach ${targetKb} KB — smallest possible result is ${(finalSize / 1024).toFixed(1)} KB.`);
      }
    }

    setResultData({
      url: finalDataUrl,
      size: finalSize,
      width: w,
      height: h,
      type: mimeType
    });
    
    setStatusMsg("");
    setIsProcessing(false);
  };

  const handleDownload = () => {
    if (!resultData || !fileData) return;
    const a = document.createElement("a");
    a.href = resultData.url;
    const ext = resultData.type === "image/png" ? "png" : "jpg";
    const fname = fileData.name.split(".")[0];
    a.download = `${fname}_${targetKb}kb.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleReset = () => {
    setFileData(null);
    setResultData(null);
    setWarningMsg("");
    setStatusMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="ws">
      <div className="stage" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', overflowY: 'auto', justifyContent: 'flex-start', alignItems: 'stretch' }}>
        
        {!fileData ? (
          <div style={{ display: 'flex', gap: '32px', height: '100%', minHeight: '400px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div
              className={`dz-upload-zone ${isDragOver === 'photo' ? "drag-over" : ""}`}
              style={{
                width: '320px',
                aspectRatio: '1 / 1',
                border: '2px dashed var(--line)',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--card)',
                transition: 'all 0.2s ease',
                borderColor: isDragOver === 'photo' ? 'var(--brand)' : 'var(--line)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onClick={() => { setMode('photo'); fileInputRef.current?.click(); }}
              onDragEnter={(e) => { e.preventDefault(); setIsDragOver('photo'); }}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver('photo'); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                setMode('photo');
                if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧑‍💼</div>
              <div style={{ fontWeight: 600, fontSize: '18px', marginBottom: '8px' }}>Upload your Photo</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Supports JPG, JPEG, and PNG</div>
            </div>

            <div
              className={`dz-upload-zone ${isDragOver === 'signature' ? "drag-over" : ""}`}
              style={{
                width: '320px',
                aspectRatio: '1 / 1',
                border: '2px dashed var(--line)',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--card)',
                transition: 'all 0.2s ease',
                borderColor: isDragOver === 'signature' ? 'var(--brand)' : 'var(--line)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onClick={() => { setMode('signature'); fileInputRef.current?.click(); }}
              onDragEnter={(e) => { e.preventDefault(); setIsDragOver('signature'); }}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver('signature'); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                setMode('signature');
                if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✒️</div>
              <div style={{ fontWeight: 600, fontSize: '18px', marginBottom: '8px' }}>Upload your Signature</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Supports JPG, JPEG, and PNG</div>
            </div>
            
            <input type="file" ref={fileInputRef} accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', wordBreak: 'break-all' }}>{fileData.name}</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className="dim-badge">Original: {formatSize(fileData.size)}</span>
                  <span className="dim-badge">{fileData.imgElement.width} × {fileData.imgElement.height} px</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: '1 1 300px', minWidth: 0, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--line)', color: 'var(--muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                  Original
                </div>
                <div className="checkered-bg" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={fileData.url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Original" />
                </div>
              </div>

              <div style={{ flex: '1 1 300px', minWidth: 0, background: 'var(--card)', border: resultData && !warningMsg ? '1px solid var(--brand)' : '1px solid var(--line)', borderRadius: '12px', padding: '16px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--line)', color: 'var(--text)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                  <span>Compressed Result</span>
                  {resultData && (
                    <span style={{ color: resultData.size > targetKb * 1024 ? '#ff3b30' : 'var(--brand)' }}>
                      {formatSize(resultData.size)}
                    </span>
                  )}
                </div>
                <div className="checkered-bg" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', overflow: 'hidden' }}>
                  {resultData ? (
                    <img src={resultData.url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Result" />
                  ) : (
                    <div style={{ color: 'var(--muted)', fontSize: '13px' }}>
                      {isProcessing ? "Processing..." : "Ready to compress"}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {warningMsg && (
              <div style={{ padding: '16px', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', borderRadius: '8px', border: '1px solid rgba(255,59,48,0.2)' }}>
                {warningMsg}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px', borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
              <button className="chip" onClick={handleReset} style={{ padding: '12px 24px', fontSize: '14px' }}>Upload New Image</button>
            </div>
          </div>
        )}
      </div>

      <div className="panel" style={{ opacity: fileData ? 1 : 0.6, pointerEvents: fileData ? "auto" : "none", transition: 'opacity 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Resizer Settings</h3>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--bg)', padding: '4px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <button style={{ flex: 1, padding: '8px', border: 'none', background: mode === 'photo' ? 'var(--card)' : 'transparent', color: 'var(--text)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', boxShadow: mode === 'photo' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }} onClick={() => setMode('photo')}>
            Photo
          </button>
          <button style={{ flex: 1, padding: '8px', border: 'none', background: mode === 'signature' ? 'var(--card)' : 'transparent', color: 'var(--text)', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', boxShadow: mode === 'signature' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }} onClick={() => setMode('signature')}>
            Signature
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <div className="lb">🎯 Target File Size (Max)</div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <input type="number" min="1" max="5000" value={targetKb} onChange={(e) => setTargetKb(parseInt(e.target.value) || 0)} style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)', padding: '10px', borderRadius: '6px', fontSize: '16px' }} />
              <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)', padding: '10px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', fontWeight: 600 }}>KB</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[10, 20, 50, 100].map(kb => (
                <button key={kb} className="chip" style={{ background: targetKb === kb ? 'var(--text)' : 'var(--bg)', color: targetKb === kb ? 'var(--bg)' : 'var(--text)' }} onClick={() => setTargetKb(kb)}>{kb} KB</button>
              ))}
            </div>
          </div>

          <div>
            <div className="lb">↔ Target Dimensions (Pixels)</div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <div style={{ flex: '1 1 120px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--muted)' }}>Width</label>
                <input type="number" min="1" value={targetW} onChange={(e) => handleWChange(e.target.value)} style={{ background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)', padding: '10px', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }} placeholder="Auto" />
              </div>
              <div style={{ flex: '1 1 120px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--muted)' }}>Height</label>
                <input type="number" min="1" value={targetH} onChange={(e) => handleHChange(e.target.value)} style={{ background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)', padding: '10px', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }} placeholder="Auto" />
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <input type="checkbox" checked={lockAr} onChange={(e) => setLockAr(e.target.checked)} style={{ accentColor: "var(--brand)", width: "16px", height: "16px", cursor: "pointer" }} />
              <label style={{ fontSize: "13px", color: "var(--muted)", cursor: "pointer" }} onClick={() => setLockAr(!lockAr)}>Lock original aspect ratio</label>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="chip" onClick={() => { setTargetW(200); setTargetH(230); }}>Passport (200x230)</button>
              <button className="chip" onClick={() => { setTargetW(140); setTargetH(60); }}>Signature (140x60)</button>
              <button className="chip" onClick={() => { if(fileData) { setTargetW(fileData.imgElement.width); setTargetH(fileData.imgElement.height); } }}>Original Size</button>
            </div>
          </div>

          {mode === 'photo' && (
            <div>
              <div className="lb">Background Fill (For transparent PNGs)</div>
              <select value={bgColor} onChange={(e) => setBgColor(e.target.value as any)} style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--text)', outline: 'none' }}>
                <option value="none">None (Keep Transparent if PNG)</option>
                <option value="#FFFFFF">White</option>
                <option value="#ADD8E6">Light Blue</option>
                <option value="#FFB6C1">Light Red</option>
              </select>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>Note: Does not remove existing backgrounds.</div>
            </div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            {statusMsg && (
              <div style={{ marginBottom: "16px", fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--brand)", textAlign: "center" }}>
                {statusMsg}
              </div>
            )}
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button className="dl" onClick={compressImage} disabled={isProcessing || !targetKb} style={{ width: '100%', background: "var(--text)", color: 'var(--bg)', border: 'none', opacity: (isProcessing || !targetKb) ? 0.5 : 1 }}>
                ⚡ Compress
              </button>
              {resultData && (
                <button className="dl" onClick={handleDownload} style={{ width: '100%', background: "var(--brand)", color: '#fff', border: 'none' }}>
                  ⬇ Download Result
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
