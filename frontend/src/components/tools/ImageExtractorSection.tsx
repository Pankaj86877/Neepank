"use client";

import React, { useRef, useState, useEffect } from "react";
import JSZip from "jszip";
import * as pdfjsLib from "pdfjs-dist";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type ExtractedAsset = {
  name: string;
  blob: Blob;
  url: string;
};

export const ImageExtractorSection = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [extractedAssets, setExtractedAssets] = useState<ExtractedAsset[]>([]);
  const [statusText, setStatusText] = useState("Ready");
  const [statusType, setStatusType] = useState<"idle" | "processing" | "success">("idle");
  const [originalFilename, setOriginalFilename] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [format, setFormat] = useState<"png" | "jpeg">("png");

  const resetUI = () => {
    setExtractedAssets([]);
    setStatusText("Ready");
    setStatusType("idle");
    setOriginalFilename("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset this tool? All unsaved work will be lost.")) {
      resetUI();
      setFormat("png");
    }
  };

  const handleFile = async (file: File) => {
    resetUI();
    setStatusText("Processing...");
    setStatusType("processing");
    setOriginalFilename(file.name);
    
    const name = file.name.toLowerCase();
    const newAssets: ExtractedAsset[] = [];

    try {
      if (name.endsWith(".pptx")) {
        await extractZipMedia(file, "ppt/media/", newAssets);
      } else if (name.endsWith(".docx")) {
        await extractZipMedia(file, "word/media/", newAssets);
      } else if (name.endsWith(".pdf")) {
        await extractPDF(file, newAssets);
      } else {
        throw new Error("Unsupported file type");
      }

      setExtractedAssets(newAssets);
      if (newAssets.length > 0) {
        setStatusText("Extraction Complete");
        setStatusType("success");
      } else {
        setStatusText("No media found");
        setStatusType("idle");
      }
    } catch (err: unknown) {
      console.error(err);
      setStatusText("Error");
      setStatusType("idle");
      alert("Processing failed: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const extractZipMedia = async (file: File, folder: string, targetArray: ExtractedAsset[]) => {
    const zip = await JSZip.loadAsync(file);
    const promises: Promise<void>[] = [];

    zip.forEach((path, entry) => {
      if (path.startsWith(folder) && /\.(png|jpg|jpeg|gif|svg|webp|bmp)$/i.test(path)) {
        promises.push(
          entry.async("blob").then((blob) => {
            const name = path.split("/").pop() || "image";
            const url = URL.createObjectURL(blob);
            targetArray.push({ name, blob, url });
          })
        );
      }
    });

    await Promise.all(promises);
  };

  const extractPDF = async (file: File, targetArray: ExtractedAsset[]) => {
    const data = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await page.render({ canvasContext: ctx, viewport } as any).promise;

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, format === "png" ? "image/png" : "image/jpeg", 0.95);
      });

      if (blob) {
        const safeName = file.name.split(".")[0] || "doc";
        const name = `${safeName}_page-${i}.${format === "png" ? "png" : "jpg"}`;
        const url = URL.createObjectURL(blob);
        targetArray.push({ name, blob, url });
      }
    }
  };

  const downloadZip = async () => {
    if (extractedAssets.length === 0) return;
    setStatusText("Archiving...");
    setStatusType("processing");

    const zip = new JSZip();
    extractedAssets.forEach((asset) => zip.file(asset.name, asset.blob));

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    
    const safeName = originalFilename.split(".")[0] || "document";

    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}_extracted.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setStatusText("Archived Successfully");
    setStatusType("success");
  };

  return (
    <div className="ws">
      <div className="stage" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Extracted Asset Gallery</h3>
          <span style={{ 
            fontSize: '11px', 
            padding: '4px 8px', 
            borderRadius: '4px', 
            background: statusType === "processing" ? 'rgba(232, 104, 47, 0.2)' : (statusType === "success" ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg)'),
            color: statusType === "processing" ? 'var(--brand)' : (statusType === "success" ? '#10b981' : 'var(--muted)'),
            border: '1px solid',
            borderColor: statusType === "processing" ? 'var(--brand)' : (statusType === "success" ? '#10b981' : 'var(--line)')
          }}>
            {statusText}
          </span>
        </div>

        {extractedAssets.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>📦</div>
            <div>Extracted media and rendered pages will populate here.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px", paddingBottom: '24px' }}>
            {extractedAssets.map((asset, idx) => (
              <div key={idx} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '260px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
                  <img src={asset.url} alt={asset.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ padding: '16px', borderTop: '1px solid var(--line)', background: 'var(--card)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '12px', fontFamily: 'var(--font-mono)' }} title={asset.name}>{asset.name}</div>
                  <a href={asset.url} download={asset.name} style={{ display: 'block', textAlign: 'center', fontSize: '12px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '4px', padding: '8px', color: 'var(--text)', textDecoration: 'none' }}>⬇ Download</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Source Document</h3>
          <button className="chip" onClick={handleReset}>Reset</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗂</div>
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>Drop PPTX, DOCX, or PDF here</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Max 50MB · Processed Locally</div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".pptx,.docx,.pdf"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files?.length) handleFile(e.target.files[0]);
              }}
            />
          </div>

          <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px' }}>
            <div className="lb" style={{ marginBottom: '12px' }}>PDF Extraction Settings</div>
            <div>
              <div style={{ fontSize: '12px', marginBottom: '4px', color: 'var(--muted)' }}>Format</div>
              <select 
                value={format} 
                onChange={(e) => setFormat(e.target.value as "png" | "jpeg")}
                style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--line)', padding: '8px', borderRadius: '6px', color: 'var(--text)' }}
              >
                <option value="png">PNG (Lossless Quality)</option>
                <option value="jpeg">JPG (Smaller Size)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "auto", paddingTop: '20px' }}>
            {extractedAssets.length > 0 && (
              <button className="dl" onClick={downloadZip} style={{ width: '100%', background: "var(--brand)", color: '#fff', border: 'none', marginBottom: '8px' }}>
                ⬇ Download All as ZIP
              </button>
            )}
            <button className="pb" onClick={resetUI} style={{ width: "100%", border: 'none', background: 'transparent', color: 'var(--muted)' }}>
              ✕ Clear Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
