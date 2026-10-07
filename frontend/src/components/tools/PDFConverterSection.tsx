"use client";

import React, { useRef, useState, useEffect } from "react";
// PDF modules will be dynamically imported to avoid main bundle bloat

type FileItem = {
  id: string;
  file: File;
  url: string;
};

export const PDFConverterSection = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [compMode, setCompMode] = useState<"quality" | "target">("quality");
  const [targetMb, setTargetMb] = useState<number>(3);
  const [quality, setQuality] = useState(80);
  const [pageSize, setPageSize] = useState("fit");
  const [orientation, setOrientation] = useState("auto");
  const [margin, setMargin] = useState(10);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [progress, setProgress] = useState(0);

  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const handleFiles = async (fileList: FileList | File[]) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (validTypes.includes(file.type)) {
        setFiles((prev) => [
          ...prev,
          { id: Math.random().toString(), file, url: URL.createObjectURL(file) }
        ]);
      } else if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        await extractPdfPages(file);
      }
    }
  };

  const extractPdfPages = async (file: File) => {
    setIsProcessing(true);
    setStatusText("Extracting PDF...");
    setProgress(5);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdfDoc.numPages;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setStatusText(`Extracting page ${pageNum} of ${totalPages}...`);
        setProgress(5 + (pageNum / totalPages) * 95);

        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: ctx, viewport } as any).promise;

        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.95));
        if (blob) {
          const baseName = file.name.replace(/\.pdf$/i, "");
          const pageFile = new File([blob], `${baseName}_page${pageNum}.jpg`, { type: "image/jpeg" });
          
          setFiles((prev) => [
            ...prev,
            { id: Math.random().toString(), file: pageFile, url: URL.createObjectURL(pageFile) }
          ]);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to extract PDF pages.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setStatusText("");
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });
  };

  const generatePDF = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setStatusText("Initializing PDF Generation Engine...");
    setProgress(0);

    const sizes: Record<string, [number, number]> = {
      a4: [210, 297],
      a3: [297, 420],
      letter: [215.9, 279.4],
      legal: [215.9, 355.6],
    };

    let pdf: any = null;
    let finalQualityVal = quality / 100;

    try {
      if (compMode === "target" && targetMb > 0) {
        setStatusText("Calculating optimal compression for target size...");
        await new Promise(r => setTimeout(r, 100)); // UI yield
        
        const targetBytesTotal = targetMb * 1024 * 1024;
        // Leave a small 10% buffer for PDF metadata overhead
        const targetBytesPerPage = (targetBytesTotal * 0.90) / files.length;
        
        const testFile = files[0].file;
        const rawImgData = await fileToDataUrl(testFile);
        const img = await loadImage(rawImgData);

        const cvs = document.createElement("canvas");
        cvs.width = img.width;
        cvs.height = img.height;
        const ctx = cvs.getContext("2d");
        
        if (ctx) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, img.width, img.height);
          ctx.drawImage(img, 0, 0, img.width, img.height);
          
          let minQ = 0.1;
          let maxQ = 0.95;
          let currentQ = 0.95;
          let bestQ = 0.95;
          let bestSize = Infinity;
          let closestQ = 0;
          let iters = 0;
          
          while (iters < 8 && minQ <= maxQ) {
            iters++;
            const testData = cvs.toDataURL("image/jpeg", currentQ);
            const base64Length = testData.length - (testData.indexOf(",") + 1);
            const sizeBytes = base64Length * 0.75;
            
            setStatusText(`Estimating... trying quality ${(currentQ*100).toFixed(0)}%`);
            await new Promise(r => setTimeout(r, 20));
            
            if (sizeBytes <= targetBytesPerPage) {
              closestQ = currentQ;
              minQ = currentQ + 0.05;
            } else {
              maxQ = currentQ - 0.05;
            }
            
            if (sizeBytes < bestSize) {
               bestSize = sizeBytes;
               bestQ = currentQ;
            }
            currentQ = (minQ + maxQ) / 2;
          }
          
          finalQualityVal = closestQ > 0 ? closestQ : bestQ;
        }
      }

      for (let i = 0; i < files.length; i++) {
        setStatusText(`Processing image ${i + 1} of ${files.length}...`);
        setProgress((i / files.length) * 100);

        const file = files[i].file;
        const rawImgData = await fileToDataUrl(file);
        const img = await loadImage(rawImgData);

        const cvs = document.createElement("canvas");
        cvs.width = img.width;
        cvs.height = img.height;
        const ctx = cvs.getContext("2d");
        if (!ctx) continue;
        
        ctx.drawImage(img, 0, 0, img.width, img.height);

        let mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const qualityVal = finalQualityVal;

        if (qualityVal < 1.0 && mimeType === "image/png") {
          mimeType = "image/jpeg";
          ctx.globalCompositeOperation = "destination-over";
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, img.width, img.height);
        }

        const imgData = cvs.toDataURL(mimeType, qualityVal);
        const jsPdfFormat = mimeType === "image/png" ? "PNG" : "JPEG";

        let isLandscape = false;
        let pW, pH;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let currentFormat: any;
        let drawW, drawH, x, y;

        if (pageSize === "fit") {
          const imgW_mm = (img.width * 25.4) / 96;
          const imgH_mm = (img.height * 25.4) / 96;
          pW = imgW_mm;
          pH = imgH_mm;
          isLandscape = imgW_mm > imgH_mm;
          currentFormat = [pW, pH];
          drawW = pW;
          drawH = pH;
          x = 0;
          y = 0;
        } else {
          const pageFormat = sizes[pageSize];
          if (orientation === "auto") {
            isLandscape = img.width > img.height;
          } else if (orientation === "landscape") {
            isLandscape = true;
          }

          pW = isLandscape ? pageFormat[1] : pageFormat[0];
          pH = isLandscape ? pageFormat[0] : pageFormat[1];
          currentFormat = pageSize;

          const maxW = pW - margin * 2;
          const maxH = pH - margin * 2;

          drawW = maxW;
          drawH = (img.height * maxW) / img.width;

          if (drawH > maxH) {
            drawH = maxH;
            drawW = (img.width * maxH) / img.height;
          }

          x = margin + (maxW - drawW) / 2;
          y = margin + (maxH - drawH) / 2;
        }

        const orientStr = isLandscape ? "l" : "p";

        if (i === 0) {
          const jsPDF = (await import("jspdf")).default;
          pdf = new jsPDF({ orientation: orientStr as "p" | "l", unit: "mm", format: currentFormat });
        } else {
          pdf?.addPage(currentFormat, orientStr as "p" | "l");
        }

        const compression = quality < 100 ? "FAST" : "NONE";
        pdf?.addImage(imgData, jsPdfFormat, x, y, drawW, drawH, undefined, compression);
      }

      setProgress(100);
      setStatusText("Finalizing and downloading...");
      
      const safeName = files[0].file.name.split(".")[0];
      const outName = `${safeName}_${files.length > 1 ? "batch-converted" : "converted"}.pdf`;
      pdf?.save(outName);

    } catch (err) {
      console.error(err);
      setStatusText("Error occurred during generation.");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
        setStatusText("");
      }, 2000);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex !== null && draggedItemIndex !== index) {
      const newFiles = [...files];
      const draggedFile = newFiles.splice(draggedItemIndex, 1)[0];
      newFiles.splice(index, 0, draggedFile);
      setFiles(newFiles);
    }
    setDraggedItemIndex(null);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset this tool? All unsaved work will be lost.")) {
      files.forEach((f) => URL.revokeObjectURL(f.url));
      setFiles([]);
      setCompMode("quality");
      setTargetMb(3);
      setQuality(80);
      setPageSize("fit");
      setOrientation("auto");
      setMargin(10);
      setIsProcessing(false);
      setStatusText("");
      setProgress(0);
    }
  };

  return (
    <div className="ws">
      <div className="stage" style={{ display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto', justifyContent: 'flex-start', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0' }}>Upload Images</h2>
            <p className="dim-badge" style={{ margin: 0 }}>{files.length} files</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '32px', flex: 1 }}>
          {/* Left: Upload Zone */}
          <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column' }}>
            <div
              className={`dz-upload-zone ${isDragOver ? "drag-over" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
              }}
              style={{
                border: '2px dashed var(--line)',
                borderRadius: '12px',
                padding: '40px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--card)',
                transition: 'all 0.2s ease',
                borderColor: isDragOver ? 'var(--brand)' : 'var(--line)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px'
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Drop images here or click to browse</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>JPG · PNG · WEBP · PDF (extracts pages)</div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf,.pdf"
                multiple
                style={{ display: "none" }}
                onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
              />
            </div>
          </div>

          {/* Right: File List Preview */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingRight: '8px' }}>
            {files.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                border: '1px solid var(--line)', 
                borderRadius: '12px', 
                color: 'var(--muted)',
                background: 'var(--bg)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>🖼️</div>
                <p style={{ margin: 0 }}>No images uploaded yet.<br />Files can be reordered by dragging.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
                {files.map((fileObj, idx) => (
                  <div
                    key={fileObj.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOverItem(e, idx)}
                    onDrop={(e) => handleDropItem(e, idx)}
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      background: 'var(--card)',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      cursor: 'grab',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }}
                  >
                    <img src={fileObj.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`Page ${idx + 1}`} />
                    
                    {/* Top Overlay: Number & Delete */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                       <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                         {idx + 1}
                       </div>
                       <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} style={{ width: '24px', height: '24px', background: 'rgba(239, 68, 68, 0.9)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                         ✕
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>PDF Converter</h3>
          <button className="chip" onClick={handleReset}>Reset</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div className="lb">⚙ PDF Options</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--card)', border: '1px solid var(--line)', padding: '16px', borderRadius: '8px' }}>
              
              <div style={{ display: 'flex', gap: '8px', background: 'var(--bg)', padding: '4px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <button style={{ flex: 1, padding: '6px', border: 'none', background: compMode === 'quality' ? 'var(--card)' : 'transparent', color: 'var(--text)', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: compMode === 'quality' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }} onClick={() => setCompMode('quality')}>Manual Quality</button>
                <button style={{ flex: 1, padding: '6px', border: 'none', background: compMode === 'target' ? 'var(--card)' : 'transparent', color: 'var(--text)', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: compMode === 'target' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }} onClick={() => setCompMode('target')}>Target Size</button>
              </div>

              {compMode === 'quality' ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 500 }}>Quality</label>
                    <span style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{quality}%</span>
                  </div>
                  <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--brand)' }} />
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>Target File Size (MB)</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input type="number" min="0.1" step="0.1" value={targetMb} onChange={(e) => setTargetMb(parseFloat(e.target.value) || 0)} style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)', padding: '10px', borderRadius: '6px', fontSize: '14px' }} />
                    <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)', padding: '10px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', fontWeight: 600 }}>MB</div>
                  </div>
                </div>
              )}
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>Page Size</label>
                <select value={pageSize} onChange={(e) => setPageSize(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--text)', outline: 'none' }}>
                  <option value="fit">Fit (Same page size as image)</option>
                  <option value="a4">A4 (210 × 297 mm)</option>
                  <option value="a3">A3 (297 × 420 mm)</option>
                  <option value="letter">Letter (8.5 × 11 in)</option>
                  <option value="legal">Legal (8.5 × 14 in)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>Orientation</label>
                <select value={orientation} onChange={(e) => setOrientation(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--text)', outline: 'none' }}>
                  <option value="auto">Auto (per image)</option>
                  <option value="portrait">Always Portrait</option>
                  <option value="landscape">Always Landscape</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500 }}>Margin</label>
                  <span style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{margin}mm</span>
                </div>
                <input type="range" min="0" max="30" value={margin} onChange={(e) => setMargin(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--brand)' }} />
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="lb" style={{ margin: 0 }}>Preview Sequence</span>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: isProcessing ? 'rgba(45,191,249,0.1)' : files.length > 0 ? 'rgba(67,224,152,0.1)' : 'var(--bg)', color: isProcessing ? 'var(--brand)' : files.length > 0 ? '#43E098' : 'var(--muted)' }}>
                {isProcessing ? "Processing..." : files.length > 0 ? "Ready" : "Idle"}
              </span>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: "8px", maxHeight: "200px", overflowY: "auto", padding: "8px", border: '1px solid var(--line)', borderRadius: '8px', background: 'var(--bg)' }}>
              {files.length === 0 ? (
                <div style={{ gridColumn: "1/-1", textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: '12px' }}>
                  Image thumbnails appear here
                </div>
              ) : (
                files.map((f) => (
                  <img
                    key={`preview-${f.id}`}
                    src={f.url}
                    style={{ width: "100%", height: "60px", objectFit: "cover", borderRadius: "4px", border: '1px solid var(--line)' }}
                    alt={f.file.name}
                  />
                ))
              )}
            </div>
          </div>

          <div style={{ marginTop: "auto", paddingTop: "20px" }}>
            {isProcessing && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ height: "6px", background: "var(--line)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: "var(--brand)", borderRadius: "4px", transition: "width 0.2s ease" }}></div>
                </div>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--brand)", marginTop: "8px", textAlign: 'center' }}>
                  {statusText || `Processing... ${Math.round(progress)}%`}
                </div>
              </div>
            )}

            <button
              className="dl"
              onClick={generatePDF}
              disabled={files.length === 0 || isProcessing}
              style={{ background: "#43E098", color: '#000', width: "100%", border: 'none', opacity: (files.length === 0 || isProcessing) ? 0.5 : 1 }}
            >
              ⬇ Generate & Download PDF
            </button>
            <button
              className="pb"
              onClick={() => setFiles([])}
              style={{ width: "100%", marginTop: "12px", color: "var(--brand)", borderColor: "var(--brand)" }}
            >
              ✕ Clear All Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
