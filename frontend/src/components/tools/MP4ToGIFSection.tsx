"use client";

import React, { useRef, useState, useEffect } from "react";

export const MP4ToGIFSection = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [origWidth, setOrigWidth] = useState(0);
  const [origHeight, setOrigHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [originalFilename, setOriginalFilename] = useState("");

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  
  const [compLevel, setCompLevel] = useState("medium");
  const [resizeW, setResizeW] = useState<number | "">("");
  const [resizeH, setResizeH] = useState<number | "">("");
  const [lockAR, setLockAR] = useState(true);

  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusChip, setStatusChip] = useState<"Waiting" | "Ready" | "Processing..." | "Done" | "Error">("Waiting");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const [gifOutput, setGifOutput] = useState("");

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setStatusChip("Error");
    setTimeout(() => setErrorMsg(""), 4000);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("video/") && !file.name.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/)) {
      showError("Please upload a valid video file.");
      return;
    }

    setGifOutput("");
    setIsProcessing(false);
    setProgress(0);
    setErrorMsg("");
    setStatusChip("Waiting");

    if (selectedFileUrl) URL.revokeObjectURL(selectedFileUrl);
    
    const url = URL.createObjectURL(file);
    setSelectedFileUrl(url);
    setOriginalFilename(file.name);
  };

  const onLoadedMetadata = () => {
    if (!videoRef.current) return;
    const duration = videoRef.current.duration;
    const w = videoRef.current.videoWidth;
    const h = videoRef.current.videoHeight;
    const ar = w / h;

    setVideoDuration(duration);
    setOrigWidth(w);
    setOrigHeight(h);
    setAspectRatio(ar);
    setResizeW(w);
    setResizeH(h);

    setStartTime(0);
    setEndTime(Math.min(duration, 10));
    setStatusChip("Ready");
  };

  const onVideoError = () => {
    showError("Video format not supported or corrupted.");
    setSelectedFileUrl(null);
  };

  const handleTimeScrub = (isStart: boolean, val: number) => {
    let start = isStart ? val : startTime;
    let end = isStart ? endTime : val;

    if (start < 0) start = 0;
    if (end > videoDuration) end = videoDuration;

    if (start >= end) {
      if (isStart) start = Math.max(0, end - 0.1);
      else end = Math.min(videoDuration, start + 0.1);
    }

    if (end - start > 10) {
      if (isStart) {
        end = start + 10;
        if (end > videoDuration) { end = videoDuration; start = end - 10; }
      } else {
        start = end - 10;
        if (start < 0) { start = 0; end = start + 10; }
      }
    }

    setStartTime(start);
    setEndTime(end);

    if (videoRef.current) {
      videoRef.current.currentTime = isStart ? start : end;
    }
  };

  const handleResizeWChange = (val: string) => {
    const w = val === "" ? "" : parseInt(val);
    setResizeW(w);
    if (lockAR && origWidth && typeof w === "number") {
      setResizeH(Math.round(w / aspectRatio));
    }
  };

  const handleResizeHChange = (val: string) => {
    const h = val === "" ? "" : parseInt(val);
    setResizeH(h);
    if (lockAR && origHeight && typeof h === "number") {
      setResizeW(Math.round(h * aspectRatio));
    }
  };

  const convertVideo = async () => {
    if (!selectedFileUrl || !videoRef.current) return;

    setStatusChip("Processing...");
    setIsProcessing(true);
    setProgress(0);
    setProcessingStatus("Initializing Engine...");

    const targetW = typeof resizeW === "number" ? resizeW : origWidth || 480;
    const targetH = typeof resizeH === "number" ? resizeH : origHeight || 480;

    let fps = 10;
    if (compLevel === "low") fps = 5;
    if (compLevel === "medium") fps = 7;
    if (compLevel === "high") fps = 10;

    const clipDuration = endTime - startTime;
    const totalFrames = Math.max(1, Math.floor(clipDuration * fps));
    const frameInterval = 1 / fps;

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    
    const images: string[] = [];
    const originalTime = videoRef.current.currentTime;

    try {
      if (videoRef.current.readyState < 2) {
        await new Promise<void>((resolve) => {
          const h = () => { videoRef.current?.removeEventListener("loadeddata", h); resolve(); };
          videoRef.current?.addEventListener("loadeddata", h);
        });
      }

      for (let i = 0; i < totalFrames; i++) {
        const time = startTime + i * frameInterval;
        videoRef.current.currentTime = time;

        await new Promise<void>((resolve) => {
          const handler = () => {
            videoRef.current?.removeEventListener("seeked", handler);
            resolve();
          };
          videoRef.current?.addEventListener("seeked", handler);
          setTimeout(resolve, 500);
        });

        if (ctx) ctx.drawImage(videoRef.current, 0, 0, targetW, targetH);
        images.push(canvas.toDataURL("image/jpeg", 0.8));

        const percent = Math.round(((i + 1) / totalFrames) * 50);
        setProgress(percent);
        setProcessingStatus(`Extracting Frames: ${percent}%`);
      }
    } catch (err) {
      showError("Failed to extract frames from video.");
      setIsProcessing(false);
      return;
    } finally {
      if (videoRef.current) videoRef.current.currentTime = originalTime;
    }

    setProcessingStatus("Generating GIF...");

    // Dynamically import gifshot
    // @ts-expect-error No type declarations available
    const gifshot = ((await import("gifshot")).default || await import("gifshot")) as any;

    gifshot.createGIF({
      images: images,
      gifWidth: targetW,
      gifHeight: targetH,
      frameDuration: 10 / fps,
      sampleInterval: compLevel === "low" ? 5 : compLevel === "medium" ? 15 : 30,
      progressCallback: (captureProgress: number) => {
        const percent = 50 + Math.round(captureProgress * 50);
        setProgress(percent);
        setProcessingStatus(`Rendering GIF: ${percent}%`);
      }
    }, (obj: { error: boolean; image: string; [key: string]: unknown }) => {
      if (!obj.error) {
        const image = obj.image;
        setGifOutput(image);
        
        const base64Length = image.length - (image.indexOf(",") + 1);
        const padding = image.charAt(image.length - 2) === "=" ? 2 : image.charAt(image.length - 1) === "=" ? 1 : 0;
        const fileSize = (base64Length * 0.75 - padding) / 1024 / 1024;
        
        setProcessingStatus(`Done! Estimated Size: ${fileSize.toFixed(2)} MB`);
        setStatusChip("Done");
      } else {
        showError("An error occurred during GIF generation.");
      }
      setIsProcessing(false);
    });
  };

  const downloadGif = () => {
    if (!gifOutput) return;
    const a = document.createElement("a");
    a.href = gifOutput;
    a.download = `${originalFilename.split(".")[0] || "video"}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset this tool? All unsaved work will be lost.")) {
      if (selectedFileUrl) URL.revokeObjectURL(selectedFileUrl);
      setSelectedFileUrl(null);
      setOriginalFilename("");
      setCompLevel("medium");
      setResizeW("");
      setResizeH("");
      setLockAR(true);
      setErrorMsg("");
      setStatusChip("Waiting");
      setIsProcessing(false);
      setProgress(0);
      setProcessingStatus("");
      setGifOutput("");
    }
  };

  return (
    <div className="ws">
      <div className="stage" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0' }}>Source Video</h2>
            <p className="dim-badge" style={{ margin: 0 }}>{selectedFileUrl ? `${(origWidth || 0)}x${(origHeight || 0)}` : "—"}</p>
          </div>
        </div>

        <div
          className={`dz-upload-zone ${isDragOver ? "drag-over" : ""}`}
          style={{
            border: '2px dashed var(--line)',
            borderRadius: '12px',
            padding: '40px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'var(--card)',
            transition: 'all 0.2s ease',
            borderColor: isDragOver ? 'var(--brand)' : 'var(--line)'
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎬</div>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>Drop an MP4 video or click to browse</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Max 10s extraction · Local browser processing</div>
          <input type="file" ref={fileInputRef} accept="video/mp4,video/x-m4v,video/webm,video/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        </div>

        {errorMsg && (
          <div style={{ padding: '16px', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', borderRadius: '8px', border: '1px solid rgba(255,59,48,0.2)', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        {selectedFileUrl && (
          <div style={{ borderRadius: "12px", overflow: "hidden", background: '#000', border: '1px solid var(--line)' }}>
            <video
              ref={videoRef}
              controls
              style={{ width: "100%", outline: "none", maxHeight: "400px", display: 'block' }}
              onLoadedMetadata={onLoadedMetadata}
              onError={onVideoError}
              src={selectedFileUrl}
            ></video>
          </div>
        )}
      </div>

      <div className="panel" style={{ opacity: selectedFileUrl ? 1 : 0.5, pointerEvents: selectedFileUrl ? "auto" : "none" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>MP4 to GIF</h3>
          <button className="chip" onClick={handleReset} style={{ pointerEvents: 'auto' }}>Reset</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div className="lb">✂ Trim Video Timeline (Max 10s clip)</div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 120px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--muted)' }}>Start Time (s)</label>
                <input type="number" min="0" step="0.1" value={startTime.toFixed(1)} onChange={(e) => handleTimeScrub(true, parseFloat(e.target.value))} style={{ background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)', padding: '8px', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }} />
                <input type="range" min="0" step="0.1" max={videoDuration} value={startTime} onChange={(e) => handleTimeScrub(true, parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--brand)', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: '1 1 120px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--muted)' }}>End Time (s)</label>
                <input type="number" min="0.1" step="0.1" value={endTime.toFixed(1)} onChange={(e) => handleTimeScrub(false, parseFloat(e.target.value))} style={{ background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)', padding: '8px', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }} />
                <input type="range" min="0.1" step="0.1" max={videoDuration} value={endTime} onChange={(e) => handleTimeScrub(false, parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--brand)', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          <div>
            <div className="lb">⚙ Compression Quality</div>
            <select value={compLevel} onChange={(e) => setCompLevel(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--text)', outline: 'none' }}>
              <option value="low">Low Compression (High Quality)</option>
              <option value="medium">Medium Compression (Balanced)</option>
              <option value="high">High Compression (Small File)</option>
            </select>
          </div>

          <div>
            <div className="lb">↔ Dimensions (px)</div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 120px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--muted)' }}>Width</label>
                <input type="number" min="1" max="2000" value={resizeW} onChange={(e) => handleResizeWChange(e.target.value)} style={{ background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)', padding: '8px', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: '1 1 120px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--muted)' }}>Height</label>
                <input type="number" min="1" max="2000" value={resizeH} onChange={(e) => handleResizeHChange(e.target.value)} style={{ background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)', padding: '8px', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
              <input type="checkbox" checked={lockAR} onChange={(e) => setLockAR(e.target.checked)} style={{ accentColor: "var(--brand)", width: "16px", height: "16px", cursor: "pointer" }} />
              <label style={{ fontSize: "13px", color: "var(--muted)", cursor: "pointer" }} onClick={() => setLockAR(!lockAR)}>Lock aspect ratio</label>
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            {(isProcessing || progress > 0) && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ height: "6px", background: "var(--line)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: "var(--brand)", borderRadius: "4px", transition: "width 0.2s ease" }}></div>
                </div>
                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--brand)", marginTop: "8px", textAlign: 'center' }}>
                  {processingStatus}
                </div>
              </div>
            )}
            
            {!gifOutput && (
              <button className="dl" disabled={isProcessing} onClick={convertVideo} style={{ background: "var(--brand)", color: '#fff', width: '100%', border: 'none', opacity: isProcessing ? 0.5 : 1 }}>
                ⚡ Generate GIF File
              </button>
            )}
          </div>

          {gifOutput && (
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '20px' }}>
              <div className="lb">Generated GIF Output</div>
              <div className="checkered-bg" style={{ 
                height: "auto", 
                minHeight: "180px", 
                padding: "16px", 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center",
                borderRadius: '8px',
                border: '1px solid var(--line)',
                marginBottom: '16px'
              }}>
                <img src={gifOutput} alt="Generated GIF" style={{ borderRadius: "4px", maxWidth: "100%", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }} />
              </div>
              <button className="dl" onClick={downloadGif} style={{ width: '100%', background: "#43E098", color: '#000', border: 'none', marginBottom: '12px' }}>
                ⬇ Download GIF
              </button>
              <button className="pb" onClick={() => setGifOutput("")} style={{ width: "100%", color: "var(--brand)", borderColor: "var(--brand)" }}>
                ↺ Convert Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
