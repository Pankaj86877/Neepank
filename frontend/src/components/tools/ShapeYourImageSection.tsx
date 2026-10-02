"use client";

import React, { useEffect, useRef, useState } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { UploadOverlay } from "./UploadOverlay";

export const ShapeYourImageSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [w, setW] = useState(1000);
  const [h, setH] = useState(1000);
  const [r, setR] = useState(0);
  const [color, setColor] = useState("#2DBFF9");
  
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string>("image");
  const [scale, setScale] = useState(1.0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [imageOpacity, setImageOpacity] = useState(1.0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [imageRotation, setImageRotation] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const hasDragged = useRef(false);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset this tool? All unsaved work will be lost.")) {
      setUploadedImage(null);
      setOriginalFilename("image");
      setScale(1.0);
      setOffsetX(0);
      setOffsetY(0);
      setImageOpacity(1.0);
      setFlipH(false);
      setFlipV(false);
      setImageRotation(0);
      setW(1000);
      setH(1000);
      setR(0);
      setColor("#2DBFF9");
    }
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = color;

    const drawPath = () => {
      const safeR = Math.min(r, Math.min(w, h) / 2);
      ctx.beginPath();
      ctx.moveTo(safeR, 0);
      ctx.lineTo(w - safeR, 0);
      ctx.arcTo(w, 0, w, safeR, safeR);
      ctx.lineTo(w, h - safeR);
      ctx.arcTo(w, h, w - safeR, h, safeR);
      ctx.lineTo(safeR, h);
      ctx.arcTo(0, h, 0, h - safeR, safeR);
      ctx.lineTo(0, safeR);
      ctx.arcTo(0, 0, safeR, 0, safeR);
      ctx.closePath();
    };

    drawPath();
    ctx.fill();

    if (!uploadedImage) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 64px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Click to upload", w / 2, h / 2);
    }

    if (uploadedImage) {
      ctx.save();
      drawPath();
      ctx.clip();
      ctx.translate(w / 2 + offsetX, h / 2 + offsetY);
      ctx.rotate((imageRotation * Math.PI) / 180);
      ctx.scale(flipH ? -scale : scale, flipV ? -scale : scale);
      ctx.globalAlpha = imageOpacity;
      ctx.drawImage(uploadedImage, -uploadedImage.width / 2, -uploadedImage.height / 2);
      ctx.restore();
    }
  };

  useEffect(() => {
    renderCanvas();
  }, [uploadedImage, scale, offsetX, offsetY, imageOpacity, flipH, flipV, imageRotation, w, h, r, color]);

  const onUploadSuccess = (img: HTMLImageElement, filename: string) => {
    setOriginalFilename(filename);
    setUploadedImage(img);
    setScale(Math.max(w / img.width, h / img.height));
    setOffsetX(0);
    setOffsetY(0);
    setImageRotation(0);
  };

  const { handleImageUpload, processFile } = useImageUpload(onUploadSuccess);

  const handleMouseDown = (e: React.MouseEvent) => {
    hasDragged.current = false;
    if (!uploadedImage || !canvasRef.current) return;
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX * (w / rect.width) - offsetX,
      y: e.clientY * (h / rect.height) - offsetY,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;
    hasDragged.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    setOffsetX(e.clientX * (w / rect.width) - dragStart.x);
    setOffsetY(e.clientY * (h / rect.height) - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleContainerClick = () => {
    if (!hasDragged.current && !uploadedImage) {
      fileInputRef.current?.click();
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, w, h]);

  const handleWheel = (e: React.WheelEvent) => {
    if (!uploadedImage) return;
    let newScale = scale * (e.deltaY < 0 ? 1.04 : 0.96);
    newScale = Math.max(0.05, Math.min(newScale, 15));
    setScale(newScale);
  };

  const exportImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    const safeName = originalFilename.split(".")[0] || "image";
    link.download = `${safeName}_adaptive.png`;
    link.href = canvasRef.current.toDataURL("image/png", 1.0);
    link.click();
  };

  const handleRot = (deg: number) => {
    setImageRotation(((deg % 360) + 360) % 360);
  };

  const colors = ["#2DBFF9", "#072942", "#43E098", "#DDFFEA", "#286070", "#F95C15", "#9D4EDD", "#E8F0F2", "#FFFFFF", "transparent"];

  return (
    <div className="ws">
      <div 
        className="stage checkered-bg"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        onClick={handleContainerClick}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
          }
        }}
        style={{ position: 'relative', cursor: !uploadedImage ? 'pointer' : 'default', background: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYNgfQMQMNIDx/8nO/8eLh4ENGI0CUcOIAXQxE+MDBw0ZNQzUgNEDCgAABh8Yt+r4R0YAAAAASUVORK5CYII=') repeat" }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          onChange={handleImageUpload} 
          style={{ display: 'none' }} 
        />
        <canvas ref={canvasRef} width={w} height={h}></canvas>
        <div className="hint" style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'var(--card)', padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--line)', pointerEvents: 'none' }}>
          💡 Drag to reposition · Scroll to zoom
        </div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Shape Your Image</h3>
          <button className="chip" onClick={handleReset}>Reset</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="two">
            <div>
              <div className="lb">Width <b>{w}px</b></div>
              <input
                type="range"
                min="300"
                max="2000"
                step="1"
                value={w}
                onChange={(e) => setW(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--brand)' }}
              />
            </div>
            <div>
              <div className="lb">Height <b>{h}px</b></div>
              <input
                type="range"
                min="300"
                max="2000"
                step="1"
                value={h}
                onChange={(e) => setH(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--brand)' }}
              />
            </div>
          </div>

          <div>
            <div className="lb">Roundness <b>{r}px</b></div>
            <input
              type="range"
              min="0"
              max="500"
              step="1"
              value={r}
              onChange={(e) => setR(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--brand)' }}
            />
          </div>

          <div>
            <div className="lb">Transformations</div>
            <div className="two">
              <button
                className="pb"
                style={flipH ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : {}}
                onClick={() => setFlipH(!flipH)}
              >
                ↔ Flip H
              </button>
              <button
                className="pb"
                style={flipV ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : {}}
                onClick={() => setFlipV(!flipV)}
              >
                ↕ Flip V
              </button>
            </div>
          </div>

          <div>
            <div className="lb">Zoom <b>{scale.toFixed(2)}x</b></div>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.01"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              disabled={!uploadedImage}
              style={{ width: '100%', accentColor: 'var(--brand)' }}
            />
          </div>
          
          <div className="two">
            <div>
              <div className="lb">X <b>{Math.round(offsetX)}px</b></div>
              <input
                type="range"
                min="-1500"
                max="1500"
                step="1"
                value={offsetX}
                onChange={(e) => setOffsetX(parseInt(e.target.value))}
                disabled={!uploadedImage}
                style={{ width: '100%', accentColor: 'var(--brand)' }}
              />
            </div>
            <div>
              <div className="lb">Y <b>{Math.round(offsetY)}px</b></div>
              <input
                type="range"
                min="-1500"
                max="1500"
                step="1"
                value={offsetY}
                onChange={(e) => setOffsetY(parseInt(e.target.value))}
                disabled={!uploadedImage}
                style={{ width: '100%', accentColor: 'var(--brand)' }}
              />
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--line)', margin: '10px 0' }}></div>

          <div>
            <div className="lb">Background Shape Color</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '10px' }}>
              {colors.map((c) => (
                <button
                  key={c}
                  style={{ 
                    background: c, 
                    height: '28px', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    border: c === "transparent" ? '1px dashed var(--muted)' : (color === c ? '2px solid var(--text)' : '1px solid var(--line)'),
                    position: 'relative'
                  }}
                  onClick={() => setColor(c)}
                >
                  {c === "transparent" && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--muted)' }}>0%</span>}
                </button>
              ))}
            </div>
            <input 
              type="color" 
              value={color !== "transparent" ? color : "#ffffff"} 
              onChange={(e) => setColor(e.target.value)} 
              style={{ width: "100%", height: "40px", cursor: 'pointer', border: '1px solid var(--line)', borderRadius: '8px', padding: 0 }}
            />
          </div>

          <div style={{ height: '1px', background: 'var(--line)', margin: '10px 0' }}></div>

          <div>
            <div className="lb">Import Image</div>
            <div style={{ position: 'relative' }}>
              <div className="pb" style={{ textAlign: 'center', cursor: 'pointer' }}>Choose Source File...</div>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
            </div>
          </div>
          
          <div>
            <div className="lb">Mask Opacity <b>{Math.round(imageOpacity * 100)}%</b></div>
            <input
              type="range"
              min="0"
              max="100"
              value={imageOpacity * 100}
              onChange={(e) => setImageOpacity(parseFloat(e.target.value) / 100)}
              style={{ width: '100%', accentColor: 'var(--brand)' }}
            />
          </div>
          
          <button className="dl" style={{ background: "var(--brand)", color: '#fff', border: 'none' }} onClick={exportImage}>
            Download Adaptive Image (PNG)
          </button>
        </div>
      </div>
    </div>
  );
};
