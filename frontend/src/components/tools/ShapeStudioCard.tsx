import React, { useEffect, useRef, useState } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { UploadOverlay } from "./UploadOverlay";

export type ShapeConfig = {
  id: string;
  title: string;
  w: number;
  h: number;
  r: number;
  color: string;
  fileName: string;
  shapeType?: "circle" | "square" | "rectangle" | "oval" | "hexagon" | "rounded-rectangle" | "custom-diagonal";
  diagonalStrategy?: "primary" | "secondary";
};

export const ShapeStudioCard = ({ config }: { config: ShapeConfig }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
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
      setShowUploadOverlay(false);
    }
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h, r, color, diagonalStrategy } = config;

    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = color;

    const drawPath = () => {
      const { shapeType, diagonalStrategy } = config;
      const safeR = Math.min(r, Math.min(w, h) / 2);
      ctx.beginPath();

      switch (shapeType) {
        case "circle":
          ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
          break;
        case "square":
        case "rectangle":
          ctx.rect(0, 0, w, h);
          break;
        case "rounded-rectangle":
          ctx.moveTo(safeR, 0);
          ctx.lineTo(w - safeR, 0);
          ctx.arcTo(w, 0, w, h, safeR);
          ctx.lineTo(w, h - safeR);
          ctx.arcTo(w, h, 0, h, safeR);
          ctx.lineTo(safeR, h);
          ctx.arcTo(0, h, 0, 0, safeR);
          ctx.lineTo(0, safeR);
          ctx.arcTo(0, 0, w, 0, safeR);
          break;
        case "oval":
          ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
          break;
        case "hexagon":
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - (Math.PI / 6);
            const px = w / 2 + (w / 2) * Math.cos(angle);
            const py = h / 2 + (h / 2) * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          break;
        default:
          // custom-diagonal / legacy fallback
          if (diagonalStrategy === "secondary") {
            ctx.moveTo(0, 0);
            ctx.arcTo(w, 0, w, h, safeR);
            ctx.lineTo(w, h);
            ctx.arcTo(0, h, 0, 0, safeR);
          } else {
            ctx.moveTo(safeR, 0);
            ctx.lineTo(w, 0);
            ctx.lineTo(w, h - safeR);
            ctx.arcTo(w, h, w - safeR, h, safeR);
            ctx.lineTo(0, h);
            ctx.lineTo(0, safeR);
            ctx.arcTo(0, 0, safeR, 0, safeR);
          }
          break;
      }
      ctx.closePath();
    };

    drawPath();
    ctx.fill();

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
  }, [uploadedImage, scale, offsetX, offsetY, imageOpacity, flipH, flipV, imageRotation, config]);

  const onUploadSuccess = (img: HTMLImageElement, filename: string) => {
    setOriginalFilename(filename);
    setUploadedImage(img);
    setScale(Math.max(config.w / img.width, config.h / img.height));
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
      x: e.clientX * (config.w / rect.width) - offsetX,
      y: e.clientY * (config.h / rect.height) - offsetY,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;
    hasDragged.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    setOffsetX(e.clientX * (config.w / rect.width) - dragStart.x);
    setOffsetY(e.clientY * (config.h / rect.height) - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleContainerClick = () => {
    if (!hasDragged.current) {
      setShowUploadOverlay(true);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, config]);

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
    link.download = `${safeName}_shaped.png`;
    link.href = canvasRef.current.toDataURL("image/png", 1.0);
    link.click();
  };

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }} id={config.id}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
        <div>
          <span style={{ color: config.color, fontSize: '16px', fontWeight: 700 }}>
            {config.title}
          </span>
          <span style={{ fontSize: '11px', background: 'var(--bg)', border: '1px solid var(--line)', padding: '5px 10px', borderRadius: '7px', marginLeft: '10px', fontFamily: 'var(--font-mono)' }}>
            {config.w} × {config.h} px
          </span>
        </div>
        <button className="chip" onClick={handleReset}>🔄 Reset</button>
      </div>
      
      <div 
        className="stage" 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        onClick={handleContainerClick}
        style={{ position: 'relative', height: '240px', padding: 0, borderRadius: '12px', border: '1px solid var(--line)', overflow: 'hidden' }}
      >
        <UploadOverlay 
          show={showUploadOverlay || !uploadedImage} 
          onUpload={handleImageUpload} 
          onDropFile={processFile}
          onClose={() => setShowUploadOverlay(false)} 
        />
        <canvas ref={canvasRef} width={config.w} height={config.h} style={{ maxHeight: '100%', maxWidth: '100%' }}></canvas>
      </div>
      
      <div className="hint" style={{ textAlign: 'center' }}>💡 Drag to reposition · Scroll to zoom</div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
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
        
        <div>
          <div className="lb">Import Image</div>
          <div style={{ position: 'relative' }}>
            <div className="pb" style={{ textAlign: 'center', cursor: 'pointer' }}>Choose Source File...</div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
            />
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
        
        <button
          className="dl"
          style={{ background: config.color, filter: 'brightness(0.9)', border: 'none', color: '#fff' }}
          onClick={exportImage}
        >
          ⬇ Download Shape ({config.w}x{config.h})
        </button>
      </div>
    </div>
  );
};
