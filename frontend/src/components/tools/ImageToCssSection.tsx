"use client";

import React, { useRef, useState, useEffect } from "react";
// @ts-ignore
import ImageTracer from "imagetracerjs";

export const ImageToCssSection = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [uploadedImg, setUploadedImg] = useState<HTMLImageElement | null>(null);
  const [imgDataUrl, setImgDataUrl] = useState("");
  const [originalName, setOriginalName] = useState("shape");
  
  const [outputMode, setOutputMode] = useState<"css-polygon" | "css-path" | "css-mask" | "svg" | "html-css">("css-polygon");
  const [shapeColor, setShapeColor] = useState("#000000");
  const [shapeWidth, setShapeWidth] = useState(300);
  const [shapeHeight, setShapeHeight] = useState(300);
  const [complexity, setComplexity] = useState(50); // 1 to 100
  const [removeBg, setRemoveBg] = useState(true);
  
  const [generatedCode, setGeneratedCode] = useState("");
  const [polygonStr, setPolygonStr] = useState("");
  const [svgPathStr, setSvgPathStr] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Upload handler
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setOriginalName(file.name.split('.')[0] || "shape");
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setUploadedImg(img);
        setImgDataUrl(data);
      };
      img.src = data;
    };
    reader.readAsDataURL(file);
  };

  // Helper: Ramer-Douglas-Peucker algorithm for path simplification
  const rdp = (points: {x: number, y: number}[], epsilon: number): {x: number, y: number}[] => {
    if (points.length < 3) return points;
    const p0 = points[0];
    const pEnd = points[points.length - 1];
    
    let dmax = 0;
    let index = 0;
    
    for (let i = 1; i < points.length - 1; i++) {
      const p = points[i];
      // distance from p to line segment (p0, pEnd)
      const num = Math.abs((pEnd.y - p0.y)*p.x - (pEnd.x - p0.x)*p.y + pEnd.x*p0.y - pEnd.y*p0.x);
      const den = Math.sqrt(Math.pow(pEnd.y - p0.y, 2) + Math.pow(pEnd.x - p0.x, 2));
      const d = den === 0 ? 0 : num / den;
      
      if (d > dmax) {
        index = i;
        dmax = d;
      }
    }
    
    if (dmax > epsilon) {
      const recResults1 = rdp(points.slice(0, index + 1), epsilon);
      const recResults2 = rdp(points.slice(index), epsilon);
      return recResults1.slice(0, recResults1.length - 1).concat(recResults2);
    } else {
      return [p0, pEnd];
    }
  };

  // Tracing logic
  useEffect(() => {
    if (!uploadedImg) return;
    setIsProcessing(true);
    
    // Defer processing to prevent UI lock
    setTimeout(() => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      
      const W = uploadedImg.width;
      const H = uploadedImg.height;
      canvas.width = W;
      canvas.height = H;
      ctx.drawImage(uploadedImg, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, W, H);
      const data = imgData.data;
      
      // Determine background color (assume top-left pixel is bg if removeBg is true and it's opaque)
      const bgR = data[0], bgG = data[1], bgB = data[2], bgA = data[3];
      const isSolidBg = removeBg && bgA > 200;
      
      const isForeground = (idx: number) => {
        if (data[idx + 3] < 50) return false; // Transparent
        if (isSolidBg) {
          const r = data[idx], g = data[idx+1], b = data[idx+2];
          // simple color distance
          const dist = Math.abs(r-bgR) + Math.abs(g-bgG) + Math.abs(b-bgB);
          if (dist < 30) return false;
        }
        return true;
      };

      // Find first edge pixel
      let startX = -1, startY = -1;
      for(let y = 0; y < H; y++) {
        for(let x = 0; x < W; x++) {
          if(isForeground((y*W + x)*4)) {
            startX = x;
            startY = y;
            break;
          }
        }
        if(startX !== -1) break;
      }

      let poly = "";
      if (startX !== -1) {
        // Moore neighborhood tracing
        const dirs = [
          {dx:1, dy:0}, {dx:1, dy:1}, {dx:0, dy:1}, {dx:-1, dy:1},
          {dx:-1, dy:0}, {dx:-1, dy:-1}, {dx:0, dy:-1}, {dx:1, dy:-1}
        ];
        
        let contour = [];
        let curX = startX;
        let curY = startY;
        let dir = 7; 
        
        // Failsafe limit
        let limit = W * H; 
        
        while (limit-- > 0) {
          contour.push({x: curX, y: curY});
          let found = false;
          let nextDir = (dir + 6) % 8; // start checking relative to previous direction
          
          for (let i = 0; i < 8; i++) {
            const checkDir = (nextDir + i) % 8;
            const nx = curX + dirs[checkDir].dx;
            const ny = curY + dirs[checkDir].dy;
            if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
               if (isForeground((ny*W + nx)*4)) {
                 curX = nx;
                 curY = ny;
                 dir = checkDir;
                 found = true;
                 break;
               }
            }
          }
          
          if (!found || (curX === startX && curY === startY)) break;
        }

        // Simplify contour
        const tolerance = Math.max(0.1, (100 - complexity) / 10);
        let simplified = rdp(contour, tolerance);
        if (simplified.length < 3) simplified = contour.filter((_, i) => i % Math.max(1, Math.floor(contour.length/20)) === 0);

        poly = simplified.map(p => `${(p.x / W * 100).toFixed(1)}% ${(p.y / H * 100).toFixed(1)}%`).join(", ");
      }
      setPolygonStr(`polygon(${poly || '0% 0%, 100% 0%, 100% 100%, 0% 100%'})`);

      // 2. Generate SVG Path using ImageTracer
      try {
        const tracerOptions = {
          ltres: (100 - complexity) / 10,
          qtres: (100 - complexity) / 10,
          pathomit: 8,
          scale: 1,
          layering: 0
        };
        const svgStr = ImageTracer.imagedataToSVG(imgData, tracerOptions);
        // Extract main path data (crude but effective)
        const match = svgStr.match(/d="([^"]+)"/);
        if (match && match[1]) {
           setSvgPathStr(`path('${match[1]}')`);
        } else {
           setSvgPathStr(`path('M 0 0 L 100 0 L 100 100 L 0 100 Z')`);
        }
      } catch (e) {
        console.error("ImageTracer failed", e);
        setSvgPathStr(`path('M 0 0 L 100 0 L 100 100 L 0 100 Z')`);
      }
      
      setIsProcessing(false);
    }, 50);
  }, [uploadedImg, complexity, removeBg]);

  // Update Code output
  useEffect(() => {
    let code = "";
    if (outputMode === "css-polygon") {
      code = `.shape {\n  width: ${shapeWidth}px;\n  height: ${shapeHeight}px;\n  background: ${shapeColor};\n  clip-path: ${polygonStr};\n}`;
    } else if (outputMode === "css-path") {
      code = `.shape {\n  width: ${shapeWidth}px;\n  height: ${shapeHeight}px;\n  background: ${shapeColor};\n  clip-path: ${svgPathStr};\n}`;
    } else if (outputMode === "css-mask") {
      code = `.shape {\n  width: ${shapeWidth}px;\n  height: ${shapeHeight}px;\n  background: ${shapeColor};\n  mask-image: url('...');\n  -webkit-mask-image: url('...');\n  mask-size: contain;\n  mask-repeat: no-repeat;\n  mask-position: center;\n}`;
    } else if (outputMode === "svg") {
      code = `<svg width="${shapeWidth}" height="${shapeHeight}" viewBox="0 0 ${uploadedImg?.width || 100} ${uploadedImg?.height || 100}" xmlns="http://www.w3.org/2000/svg">\n  <path d="${svgPathStr.replace("path('", "").replace("')", "")}" fill="${shapeColor}" />\n</svg>`;
    } else if (outputMode === "html-css") {
      code = `<!-- HTML -->\n<div class="shape"></div>\n\n/* CSS */\n.shape {\n  width: ${shapeWidth}px;\n  height: ${shapeHeight}px;\n  background: ${shapeColor};\n  clip-path: ${polygonStr};\n}`;
    }
    setGeneratedCode(code);
  }, [outputMode, shapeWidth, shapeHeight, shapeColor, polygonStr, svgPathStr, imgDataUrl]);

  const downloadCSS = () => {
    const blob = new Blob([generatedCode], { type: "text/css" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${originalName}-shape.css`;
    link.click();
  };

  return (
    <div className="ws" style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
      {/* Left Stage */}
      <div className="stage" style={{ flex: 2, padding: '24px', display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--bg)', alignItems: 'center', justifyContent: 'center' }}>
        {!uploadedImg ? (
          <div style={{ width: '400px', height: '400px', maxWidth: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--line)', borderRadius: '16px', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
            <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>✨</div>
              <div style={{ fontWeight: 600 }}>Click to Upload Shape Image</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>PNG, JPG, or SVG</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '24px', height: '100%', width: '100%', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '0', fontWeight: 700, alignSelf: 'flex-start' }}>Live Preview</h2>
            <div className="split-view" style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="lb">Original Reference</div>
              <div style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={imgDataUrl} alt="Original" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
              </div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="lb">Generated CSS Result</div>
              <div style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {isProcessing && <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, zIndex: 10 }}>Processing...</div>}
                <div style={{ 
                  width: `${shapeWidth}px`, 
                  height: `${shapeHeight}px`, 
                  background: shapeColor,
                  clipPath: outputMode.includes("polygon") || outputMode === "html-css" ? polygonStr : (outputMode.includes("path") ? svgPathStr : 'none'),
                  maskImage: outputMode === "css-mask" ? `url('${imgDataUrl}')` : 'none',
                  WebkitMaskImage: outputMode === "css-mask" ? `url('${imgDataUrl}')` : 'none',
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  transition: 'clip-path 0.3s ease'
                }}>
                  {outputMode === "svg" && (
                     <svg width="100%" height="100%" viewBox={`0 0 ${uploadedImg?.width || 100} ${uploadedImg?.height || 100}`} xmlns="http://www.w3.org/2000/svg">
                       <path d={svgPathStr.replace("path('", "").replace("')", "")} fill={shapeColor} />
                     </svg>
                  )}
                </div>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="panel" style={{ flex: 1, borderLeft: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '20px' }}>Image to CSS</h3>
        
        <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/png, image/jpeg, image/svg+xml" style={{ display: 'none' }} />
        <button className="pb" onClick={() => fileInputRef.current?.click()} style={{ marginBottom: '24px' }}>Upload Image...</button>
        
        {uploadedImg && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="lb">Output Mode</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button className="chip" style={{ background: outputMode === 'css-polygon' ? 'var(--brand)' : 'var(--bg)', color: outputMode === 'css-polygon' ? '#fff' : 'var(--text)' }} onClick={() => setOutputMode('css-polygon')}>Polygon</button>
                <button className="chip" style={{ background: outputMode === 'css-path' ? 'var(--brand)' : 'var(--bg)', color: outputMode === 'css-path' ? '#fff' : 'var(--text)' }} onClick={() => setOutputMode('css-path')}>Path</button>
                <button className="chip" style={{ background: outputMode === 'css-mask' ? 'var(--brand)' : 'var(--bg)', color: outputMode === 'css-mask' ? '#fff' : 'var(--text)' }} onClick={() => setOutputMode('css-mask')}>CSS Mask</button>
                <button className="chip" style={{ background: outputMode === 'html-css' ? 'var(--brand)' : 'var(--bg)', color: outputMode === 'html-css' ? '#fff' : 'var(--text)' }} onClick={() => setOutputMode('html-css')}>HTML + CSS</button>
                <button className="chip" style={{ background: outputMode === 'svg' ? 'var(--brand)' : 'var(--bg)', color: outputMode === 'svg' ? '#fff' : 'var(--text)' }} onClick={() => setOutputMode('svg')}>SVG</button>
              </div>
            </div>

            <div>
              <div className="lb" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Accuracy / Complexity</span>
                <span>{complexity}%</span>
              </div>
              <input type="range" min="1" max="100" value={complexity} onChange={e => setComplexity(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--brand)' }} />
              <div className="hint" style={{ marginTop: '4px' }}>Higher = more precise edges, but more code generated</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="checkbox" id="rmbg" checked={removeBg} onChange={e => setRemoveBg(e.target.checked)} />
              <label htmlFor="rmbg" style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Ignore Background Color</label>
            </div>

            <div className="two">
              <div>
                <div className="lb">Width (px)</div>
                <input type="number" value={shapeWidth} onChange={e => setShapeWidth(parseInt(e.target.value))} style={{ width: '100%', padding: '8px', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)' }} />
              </div>
              <div>
                <div className="lb">Height (px)</div>
                <input type="number" value={shapeHeight} onChange={e => setShapeHeight(parseInt(e.target.value))} style={{ width: '100%', padding: '8px', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)' }} />
              </div>
            </div>
            
            <div>
              <div className="lb">Shape Color</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="color" value={shapeColor} onChange={e => setShapeColor(e.target.value)} style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', padding: 0, flexShrink: 0 }} />
                <input type="text" value={shapeColor} onChange={e => setShapeColor(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }} />
              </div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <div className="lb" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Code Output
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="chip" onClick={() => navigator.clipboard.writeText(generatedCode)} style={{ padding: '4px 12px', fontSize: '11px', background: 'var(--bg)', border: '1px solid var(--line)', cursor: 'pointer', borderRadius: '6px' }}>Copy</button>
                  <button className="chip" onClick={downloadCSS} style={{ padding: '4px 12px', fontSize: '11px', background: 'var(--brand)', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '6px' }}>Download</button>
                </div>
              </div>
              <textarea 
                readOnly 
                value={generatedCode}
                style={{ flex: 1, minHeight: '180px', width: '100%', resize: 'none', background: 'var(--card)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)', whiteSpace: 'pre' }}
              />
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
