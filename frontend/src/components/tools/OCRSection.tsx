"use client";

import React, { useRef, useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

type OCRMode = "direct" | "crop";

export const OCRSection = () => {
  const cropperRef = useRef<HTMLImageElement>(null);
  
  const [mode, setMode] = useState<OCRMode>("direct");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressLabel, setProgressLabel] = useState("Initializing...");
  const [buttonText, setButtonText] = useState("📋 Copy Extracted Text");

  const resetState = () => {
    setImageSrc(null);
    setExtractedText("");
    setIsProcessing(false);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset this tool? All unsaved work will be lost.")) {
      resetState();
      setMode("direct");
      setProgressLabel("Initializing...");
      setButtonText("📋 Copy Extracted Text");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resetState();
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImageSrc(result);
      if (mode === "direct") {
        executeOCR(result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const executeOCR = async (src: string) => {
    setIsProcessing(true);
    setProgressLabel("Initializing Engine...");
    setExtractedText("");

    try {
      const result = await Tesseract.recognize(src, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgressLabel(`Extracting... (${Math.floor(m.progress * 100)}%)`);
          }
        },
      });
      setExtractedText(result.data.text.trim() || "[No text identified in image.]");
    } catch (err) {
      console.error(err);
      setExtractedText("Error during scan.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCropExtract = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageElement: any = cropperRef?.current;
    const cropper = imageElement?.cropper;
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });
      if (croppedCanvas) {
        executeOCR(croppedCanvas.toDataURL("image/png", 1.0));
      } else {
        setExtractedText("Please draw a crop selection first.");
      }
    }
  };

  const copyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText).then(() => {
      setButtonText("✓ Copied to Clipboard!");
      setTimeout(() => setButtonText("📋 Copy Extracted Text"), 2000);
    }).catch(() => alert("Clipboard error."));
  };

  const zoomIn = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageElement: any = cropperRef?.current;
    imageElement?.cropper?.zoom(0.1);
  };

  const zoomOut = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageElement: any = cropperRef?.current;
    imageElement?.cropper?.zoom(-0.1);
  };

  const recenter = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageElement: any = cropperRef?.current;
    imageElement?.cropper?.reset();
  };

  return (
    <div className="ws">
      <div className="stage checkered-bg" style={{ display: 'flex', flexDirection: 'column', padding: '24px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="two" style={{ gap: '8px' }}>
            <button className="pb" style={mode === "direct" ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : {}} onClick={() => { setMode("direct"); resetState(); }}>① Direct Scan</button>
            <button className="pb" style={mode === "crop" ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : {}} onClick={() => { setMode("crop"); resetState(); }}>② Crop & Scan</button>
          </div>
          
          {mode === "crop" && imageSrc && (
            <div className="two" style={{ gap: '8px' }}>
              <button className="chip" onClick={zoomIn}>➕ Zoom In</button>
              <button className="chip" onClick={zoomOut}>➖ Zoom Out</button>
              <button className="chip" onClick={recenter}>🔄 Reset</button>
            </div>
          )}
        </div>

        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)', borderRadius: '12px', background: 'var(--bg)', overflow: 'hidden' }}>
          {!imageSrc && <div style={{ color: 'var(--muted)' }}>Awaiting Document Upload...</div>}
          
          {imageSrc && mode === "direct" && (
            <img src={imageSrc} alt="OCR Workspace" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          )}

          {imageSrc && mode === "crop" && (
            <div style={{ width: '100%', height: '100%' }}>
              <Cropper
                src={imageSrc}
                style={{ height: '100%', width: "100%" }}
                initialAspectRatio={NaN}
                guides={true}
                ref={cropperRef}
                viewMode={1}
                dragMode="crop"
                autoCropArea={0.8}
                background={false}
                zoomable={true}
              />
            </div>
          )}

          {isProcessing && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid var(--line)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
              <div style={{ color: '#fff', fontWeight: 600 }}>{progressLabel}</div>
            </div>
          )}
        </div>
        
        <div className="hint" style={{ marginTop: '16px', textAlign: 'center' }}>
          {mode === "direct" ? "💡 Full image direct scan mode active" : "💡 Draw a selection box · scroll to zoom"}
        </div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Image to Text / OCR</h3>
          <button className="chip" onClick={handleReset}>Reset</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          
          {mode === "direct" ? (
            <div>
              <div className="lb">Upload (Full Scan)</div>
              <div style={{ position: 'relative' }}>
                <div className="pb" style={{ textAlign: 'center', cursor: 'pointer', borderStyle: 'dashed' }}>Upload Image File...</div>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
              </div>
            </div>
          ) : (
            <div>
              <div className="lb">Upload (Crop Mode)</div>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <div className="pb" style={{ textAlign: 'center', cursor: 'pointer', borderStyle: 'dashed' }}>Upload for Crop Selection...</div>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
              </div>
              <button
                className="dl"
                onClick={handleCropExtract}
                disabled={!imageSrc || isProcessing}
                style={{ width: '100%', background: "var(--brand)", color: '#fff', border: 'none', opacity: (!imageSrc || isProcessing) ? 0.5 : 1 }}
              >
                🔍 Extract From Selected Area
              </button>
            </div>
          )}
          
          <div style={{ height: '1px', background: 'var(--line)' }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div className="lb" style={{ margin: 0 }}>Extracted Text</div>
              <span style={{ fontSize: '10px', color: 'var(--muted)', background: 'var(--bg)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--line)' }}>
                {mode === "direct" ? "Direct Mode" : "Crop Mode"}
              </span>
            </div>
            
            <textarea
              value={extractedText}
              readOnly
              placeholder="Extracted text will appear here automatically..."
              style={{
                flex: 1,
                minHeight: '200px',
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '12px',
                color: 'var(--text)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                resize: 'none',
                marginBottom: '16px'
              }}
            ></textarea>
            
            <div className="two" style={{ gap: '12px' }}>
              <button
                className="dl"
                onClick={copyToClipboard}
                style={{ background: "var(--brand)", color: '#fff', border: 'none' }}
              >
                {buttonText}
              </button>
              <button
                className="pb"
                onClick={() => setExtractedText("")}
                style={{ border: 'none', background: 'transparent', color: 'var(--muted)' }}
              >
                ✕ Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
