"use client";

import React, { useRef, useState, useEffect } from "react";
import qrcode from "qrcode-generator";

export const QRGeneratorSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iconUploadRef = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconDataUrl, setIconDataUrl] = useState("");
  const [iconImage, setIconImage] = useState<HTMLImageElement | null>(null);

  const [isGenerated, setIsGenerated] = useState(false);
  const [moduleCount, setModuleCount] = useState(0);
  const [estimatedSize, setEstimatedSize] = useState(0);
  const [fgColor, setFgColor] = useState("#000000");
  const [libError, setLibError] = useState("");

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match("image.*")) {
      alert("Please upload a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setIconFile(file);
        setIconDataUrl(data);
        setIconImage(img);
      };
      img.src = data;
    };
    reader.readAsDataURL(file);
    if (iconUploadRef.current) iconUploadRef.current.value = "";
  };

  const removeIcon = () => {
    setIconFile(null);
    setIconDataUrl("");
    setIconImage(null);
    if (iconUploadRef.current) iconUploadRef.current.value = "";
  };

  useEffect(() => {
    const generateQR = async () => {
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        setIsGenerated(false);
        setModuleCount(0);
        setEstimatedSize(0);
        return;
      }
      try {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        // generate QR at H error correction level
        const qr = qrcode(0, 'H');
        qr.addData(trimmedUrl);
        qr.make();

        const count = qr.getModuleCount();
        setModuleCount(count);

        const canvasSize = 1024;
        canvasRef.current.width = canvasSize;
        canvasRef.current.height = canvasSize;

        const quietZone = 4;
        const totalModules = count + quietZone * 2;
        const cellSize = canvasSize / totalModules;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        ctx.fillStyle = fgColor;
        for (let r = 0; r < count; r++) {
          for (let c = 0; c < count; c++) {
            if (qr.isDark(r, c)) {
              ctx.fillRect(
                (c + quietZone) * cellSize,
                (r + quietZone) * cellSize,
                cellSize,
                cellSize
              );
            }
          }
        }

        if (iconImage) {
          const maxIconSize = canvasSize * 0.22;
          let iconW = iconImage.width;
          let iconH = iconImage.height;
          const ratio = iconW / iconH;
          if (iconW > iconH) {
            iconW = maxIconSize;
            iconH = maxIconSize / ratio;
          } else {
            iconH = maxIconSize;
            iconW = maxIconSize * ratio;
          }
          const x = (canvasSize - iconW) / 2;
          const y = (canvasSize - iconH) / 2;
          const padding = canvasSize * 0.02;

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x - padding, y - padding, iconW + padding * 2, iconH + padding * 2);
          ctx.drawImage(iconImage, x, y, iconW, iconH);
        }

        setIsGenerated(true);
        setLibError("");
        
        // Estimate size
        canvasRef.current.toBlob((blob) => {
          if (blob) setEstimatedSize(blob.size);
        }, "image/png");

      } catch (err: unknown) {
        setIsGenerated(false);
        setLibError("Error generating QR code.");
        console.error(err);
      }
    };
    generateQR();
  }, [url, iconImage, fgColor]);

  const download = (type: "png" | "jpeg") => {
    if (!canvasRef.current || !isGenerated) return;
    const mime = type === "jpeg" ? "image/jpeg" : "image/png";
    const quality = type === "jpeg" ? 0.95 : undefined;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.download = `qrcode_${Date.now()}.${type === "jpeg" ? "jpg" : "png"}`;
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    }, mime, quality);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  return (
    <div className="ws" style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
      <div className="stage" style={{ 
        flex: 2,
        padding: '24px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'repeating-conic-gradient(var(--card) 0% 25%, var(--bg) 0% 50%) 50% / 20px 20px',
        overflowY: 'auto'
      }}>
        {libError && (
          <div style={{ background: 'var(--card)', color: 'var(--brand)', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--line)' }}>
            {libError}
          </div>
        )}
        <div style={{ 
          background: '#ffffff', 
          padding: isGenerated ? '0' : '40px', 
          borderRadius: '16px', 
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '320px',
          minHeight: '320px',
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          {!isGenerated && (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#cbd5e1' }}>
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '48px', height: '48px', marginBottom: '12px' }}>
                 <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect>
                 <rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
               </svg>
             </div>
          )}
          <canvas ref={canvasRef} style={{ display: isGenerated ? 'block' : 'none', width: '100%', maxWidth: '320px', height: 'auto', aspectRatio: '1/1' }}></canvas>
        </div>
        <div style={{ color: 'var(--text)', fontSize: '13px', background: 'var(--card)', padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--line)', fontWeight: 500 }}>
          {isGenerated ? (
            <span>{moduleCount}×{moduleCount} modules • ~{formatSize(estimatedSize)}</span>
          ) : (
            <span>Enter a URL to generate a QR code</span>
          )}
        </div>
      </div>

      <div className="panel" style={{ flex: 1, borderLeft: '1px solid var(--line)' }}>
        <div style={{ marginBottom: '24px' }}>
          <h3>QR Generator</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
          <div>
            <label className="lb">Target URL / Content</label>
            <input
              type="text"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--line)", borderRadius: "8px", padding: "12px", fontFamily: "var(--font-mono)", fontSize: "13px", outline: "none", color: "var(--text)" }}
            />
          </div>
          <div>
            <label className="lb">Foreground Color</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg)', padding: '8px', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <input 
                type="color" 
                value={fgColor} 
                onChange={(e) => setFgColor(e.target.value)}
                style={{ width: '32px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0, background: 'transparent' }}
              />
              <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{fgColor.toUpperCase()}</span>
            </div>
          </div>
          <div>
            <label className="lb">Center Logo</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => iconUploadRef.current?.click()} 
                style={{ flex: 1, padding: '12px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, transition: '0.2s' }}
              >
                Center Logo…
              </button>
              <button 
                onClick={removeIcon} 
                disabled={!iconFile}
                style={{ flex: 1, padding: '12px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '8px', color: iconFile ? 'var(--brand)' : 'var(--muted)', cursor: iconFile ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: 600, transition: '0.2s' }}
              >
                Remove Logo
              </button>
            </div>
            <input type="file" ref={iconUploadRef} accept="image/png, image/jpeg, image/svg+xml" style={{ display: "none" }} onChange={handleIconUpload} />
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
            <button 
              className="dl" 
              onClick={() => download('png')} 
              disabled={!isGenerated}
              style={{ flex: 1, padding: '14px', background: isGenerated ? 'var(--brand)' : 'var(--bg)', color: isGenerated ? '#fff' : 'var(--muted)', border: isGenerated ? 'none' : '1px solid var(--line)', borderRadius: '12px', cursor: isGenerated ? 'pointer' : 'not-allowed', fontWeight: 800, fontSize: '13px', transition: '0.2s' }}
            >
              ↓ PNG
            </button>
            <button 
              className="dl" 
              onClick={() => download('jpeg')} 
              disabled={!isGenerated}
              style={{ flex: 1, padding: '14px', background: isGenerated ? 'var(--brand)' : 'var(--bg)', color: isGenerated ? '#fff' : 'var(--muted)', border: isGenerated ? 'none' : '1px solid var(--line)', borderRadius: '12px', cursor: isGenerated ? 'pointer' : 'not-allowed', fontWeight: 800, fontSize: '13px', transition: '0.2s' }}
            >
              ↓ JPG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
