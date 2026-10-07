"use client";

import React, { useRef, useState, useEffect } from "react";
import QRCode from "qrcode";
import Peer, { DataConnection } from "peerjs";

export const DataTransferSection = () => {
  const [role, setRole] = useState<"sender" | "receiver" | null>(null);
  
  // Sender state
  const [senderName, setSenderName] = useState("");
  const [transferName, setTransferName] = useState("");
  const [filesToSend, setFilesToSend] = useState<File[]>([]);
  const [isSendSetup, setIsSendSetup] = useState(true);
  const [transferId, setTransferId] = useState("");
  
  const [connectedReceiver, setConnectedReceiver] = useState<{ name: string; conn: DataConnection } | null>(null);
  const [sendProgress, setSendProgress] = useState<number>(0);
  const [isSending, setIsSending] = useState(false);
  
  // Receiver state
  const [receiveCode, setReceiveCode] = useState("");
  const [receiveName, setReceiveName] = useState("");
  const [receiveState, setReceiveState] = useState<"setup" | "connecting" | "active" | "done">("setup");
  const [receiveProgress, setReceiveProgress] = useState(0);
  const [receiveMeta, setReceiveMeta] = useState<{ transferName?: string; senderName?: string; files?: any[]; totalBytes?: number } | null>(null);
  const [receivedFiles, setReceivedFiles] = useState<{name: string, url: string}[]>([]);

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const incomingFilesRef = useRef<{ [name: string]: { type: string, chunks: ArrayBuffer[], receivedBytes: number, totalBytes: number } }>({});

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFilesToSend(Array.from(e.target.files));
    }
  };

  const startSendFlow = async () => {
    if (!senderName) return alert("Please enter your name.");
    if (filesToSend.length === 0) return alert("Please select files to send.");

    const tId = Math.floor(100000 + Math.random() * 900000).toString();
    setTransferId(tId);
    setRole("sender");
    setIsSendSetup(false);

    setTimeout(() => {
      if (qrCanvasRef.current) {
        QRCode.toCanvas(qrCanvasRef.current, tId, {
          width: 100, margin: 2, color: { dark: "#000", light: "#fff" }
        });
      }
    }, 100);

    const peer = new Peer(tId, { debug: 2 });
    peerRef.current = peer;
    
    peer.on("connection", (conn) => {
      connRef.current = conn;
      
      conn.on("data", (data: any) => {
        if (data && data.type === "request-access") {
          setConnectedReceiver({ name: data.name || "Unknown", conn });
        }
      });
      
      conn.on("close", () => {
        setConnectedReceiver(null);
      });
    });
  };
  
  const approveAndSend = async () => {
    if (!connectedReceiver || !connRef.current) return;
    const conn = connRef.current;
    
    setIsSending(true);
    setSendProgress(0);
    
    // 1. Send Meta
    const totalBytes = filesToSend.reduce((acc, f) => acc + f.size, 0);
    conn.send({
      type: "meta",
      transferName: transferName || "File Transfer",
      senderName,
      totalBytes,
      files: filesToSend.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });
    
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const CHUNK_SIZE = 256 * 1024; // 256 KB
    let sentBytesTotal = 0;
    
    // 3. Read and Send files chunk by chunk
    try {
      for (const file of filesToSend) {
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        conn.send({ type: "file-start", name: file.name, fileType: file.type, totalChunks, size: file.size });
        
        for (let i = 0; i < totalChunks; i++) {
           const start = i * CHUNK_SIZE;
           const chunk = await file.slice(start, start + CHUNK_SIZE).arrayBuffer();
           
           conn.send({ type: "file-chunk", name: file.name, chunkIndex: i, data: chunk });
           sentBytesTotal += chunk.byteLength;
           
           // @ts-ignore
           while (conn.dataChannel && conn.dataChannel.bufferedAmount > 1024 * 1024 * 2) {
             await sleep(50); // Pause to let WebRTC drain buffer and avoid dropping connection
           }
           
           const progress = Math.floor((sentBytesTotal / totalBytes) * 100);
           setSendProgress(progress);
        }
        conn.send({ type: "file-end", name: file.name });
      }
      
      setSendProgress(100);
      conn.send({ type: "done" });
      
      setTimeout(() => {
        setIsSending(false);
      }, 2000);
      
    } catch (err) {
      console.error("Error sending files:", err);
      alert("Failed to send files.");
      setIsSending(false);
    }
  };

  const startReceiveFlow = () => {
    if (!receiveCode) return alert("Please enter a transfer code.");
    if (!receiveName) return alert("Please enter your name.");
    
    setRole("receiver");
    setReceiveState("connecting");

    const peer = new Peer({ debug: 2 });
    peerRef.current = peer;

    peer.on("open", () => {
      const conn = peer.connect(receiveCode);
      connRef.current = conn;
      
      conn.on("open", () => {
        conn.send({ type: "request-access", name: receiveName });
      });

      let receivedBytesTotal = 0;
      
      conn.on("data", (data: any) => {
        if (data.type === "meta") {
          setReceiveState("active");
          setReceiveMeta(data);
          receivedBytesTotal = 0;
          setReceiveProgress(0);
        } else if (data.type === "file-start") {
          incomingFilesRef.current[data.name] = { 
            type: data.fileType, 
            chunks: new Array(data.totalChunks), 
            receivedBytes: 0, 
            totalBytes: data.size 
          };
        } else if (data.type === "file-chunk") {
          const fileData = incomingFilesRef.current[data.name];
          if (fileData) {
            fileData.chunks[data.chunkIndex] = data.data;
            fileData.receivedBytes += data.data.byteLength;
            receivedBytesTotal += data.data.byteLength;
            
            if (receiveMeta && receiveMeta.totalBytes) {
              const progress = Math.floor((receivedBytesTotal / receiveMeta.totalBytes) * 100);
              setReceiveProgress(progress);
            }
          }
        } else if (data.type === "file-end") {
          const fileData = incomingFilesRef.current[data.name];
          if (fileData) {
            const blob = new Blob(fileData.chunks, { type: fileData.type });
            const url = URL.createObjectURL(blob);
            setReceivedFiles(prev => [...prev, { name: data.name, url }]);
            delete incomingFilesRef.current[data.name];
          }
        } else if (data.type === "done") {
          setReceiveState("done");
          setReceiveProgress(100);
        }
      });
      
      conn.on("close", () => {
        if (receiveState !== "done") {
          alert("Connection lost");
          cancelTransfer();
        }
      });
    });
  };

  const cancelTransfer = () => {
    if (peerRef.current) peerRef.current.destroy();
    setRole(null);
    setIsSendSetup(true);
    setReceiveState("setup");
    setFilesToSend([]);
    setTransferId("");
    setReceiveMeta(null);
    setConnectedReceiver(null);
    setSendProgress(0);
    setIsSending(false);
    setReceivedFiles([]);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset this tool? All unsaved work will be lost.")) {
      cancelTransfer();
      setSenderName("");
      setTransferName("");
      setReceiveCode("");
      setReceiveName("");
      setReceiveProgress(0);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const totalSize = filesToSend.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="ws">
      <div className="stage" style={{ padding: '24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0' }}>Data Transfer (Sender)</h2>
            <p className="dim-badge" style={{ margin: 0 }}>Transfer large files directly over WebRTC</p>
          </div>
          <button className="chip" onClick={handleReset}>Reset</button>
        </div>

        {role !== "receiver" && (
          <div style={{ background: 'var(--card)', borderRadius: '12px', padding: '24px', border: '1px solid var(--line)' }}>
            {isSendSetup ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="two">
                  <div>
                    <label className="lb">Your Name</label>
                    <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="e.g. Pankaj" style={{ width: "100%", padding: "12px", background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: "8px", fontFamily: "var(--font-mono)", fontSize: "13px", outline: "none", color: 'var(--text)' }} />
                  </div>
                  <div>
                    <label className="lb">Transfer Name (Optional)</label>
                    <input type="text" value={transferName} onChange={(e) => setTransferName(e.target.value)} placeholder="e.g. Project Files" style={{ width: "100%", padding: "12px", background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: "8px", fontFamily: "var(--font-mono)", fontSize: "13px", outline: "none", color: 'var(--text)' }} />
                  </div>
                </div>

                <div className="dz-upload-zone" style={{ border: '2px dashed var(--line)', borderRadius: '12px', padding: '40px 24px', textAlign: 'center', position: "relative", background: 'var(--bg)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📦</div>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>Drop file here or click to browse</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Supports any file size up to 50GB</div>
                  <input type="file" multiple onChange={handleFileSelect} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
                </div>
                
                {filesToSend.length > 0 && (
                  <div style={{ padding: "16px", borderRadius: "8px", background: 'var(--bg)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: "4px" }}>{filesToSend.length === 1 ? filesToSend[0].name : `${filesToSend.length} files`}</div>
                      <div style={{ fontSize: "12px", color: 'var(--muted)' }}>{formatSize(totalSize)}</div>
                    </div>
                    <button className="dl" onClick={startSendFlow} style={{ background: "var(--brand)", color: '#fff', border: 'none' }}>Create Transfer</button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '32px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ padding: "16px", borderRadius: "8px", background: 'var(--bg)', border: '1px solid var(--line)', marginBottom: "20px" }}>
                    <div className="lb" style={{ marginBottom: "8px" }}>Transfer Info</div>
                    <div style={{ fontWeight: 600, marginBottom: "8px", fontSize: "16px", color: "var(--brand)" }}>{transferName || "File Transfer"}</div>
                    <div style={{ fontSize: "13px", marginBottom: "8px", color: 'var(--muted)' }}>From: <span style={{ color: 'var(--text)' }}>{senderName}</span></div>
                    <div style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: 'var(--muted)' }}>{filesToSend.length} files ({formatSize(totalSize)})</div>
                  </div>
                  
                  <div className="lb" style={{ marginBottom: "12px" }}>Receivers</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {connectedReceiver ? (
                      <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isSending ? '12px' : '0' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#43E098' }}>{connectedReceiver.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Ready to receive</div>
                          </div>
                          {!isSending && sendProgress === 0 && (
                            <button onClick={approveAndSend} style={{ background: 'var(--brand)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                              Accept & Send
                            </button>
                          )}
                        </div>
                        
                        {isSending && (
                          <div>
                            <div style={{ height: "6px", background: "var(--line)", borderRadius: "4px", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${sendProgress}%`, background: "var(--brand)", borderRadius: "4px", transition: "width 0.2s ease" }}></div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "12px", fontFamily: "var(--font-mono)", color: 'var(--muted)' }}>
                              <span>Sending data...</span>
                              <span>{sendProgress}%</span>
                            </div>
                          </div>
                        )}
                        {sendProgress === 100 && !isSending && (
                          <div style={{ marginTop: '12px', fontSize: '13px', color: '#43E098', fontWeight: 600 }}>
                            Transfer Complete!
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="checkered-bg" style={{ fontSize: "13px", textAlign: "center", padding: "20px 0", borderRadius: '8px', border: '1px solid var(--line)' }}>Waiting for connections...</div>
                    )}
                  </div>
                  
                  <button className="pb" onClick={cancelTransfer} style={{ marginTop: "24px", color: '#ff3b30', borderColor: 'rgba(255, 59, 48, 0.5)' }}>Cancel Transfer</button>
                </div>

                <div style={{ width: '200px', textAlign: "center", background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '12px', padding: '24px', alignSelf: 'flex-start' }}>
                  <div style={{ fontSize: "12px", marginBottom: "12px", color: 'var(--muted)' }}>Transfer Code</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "28px", letterSpacing: "2px", fontWeight: 700, marginBottom: '20px' }}>{transferId}</div>
                  <canvas ref={qrCanvasRef} style={{ borderRadius: "8px", background: "white", padding: "8px", width: "120px", height: "120px", margin: "0 auto", display: "block" }}></canvas>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="panel" style={{ opacity: role === "sender" ? 0.5 : 1, pointerEvents: role === "sender" ? 'none' : 'auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3>Receive File</h3>
        </div>

        {role !== "sender" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            {receiveState === "setup" && (
              <>
                <div>
                  <label className="lb">Enter Transfer Code:</label>
                  <input type="text" value={receiveCode} onChange={(e) => setReceiveCode(e.target.value)} placeholder="e.g. 123456" style={{ width: "100%", padding: "12px", background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: "8px", fontFamily: "var(--font-mono)", fontSize: "16px", letterSpacing: "2px", outline: "none", color: 'var(--text)' }} />
                </div>
                <div>
                  <label className="lb">Your Name:</label>
                  <input type="text" value={receiveName} onChange={(e) => setReceiveName(e.target.value)} placeholder="e.g. Rahul" style={{ width: "100%", padding: "12px", background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: "8px", fontFamily: "var(--font-mono)", fontSize: "14px", outline: "none", color: 'var(--text)' }} />
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                  <button className="dl" onClick={startReceiveFlow} style={{ width: "100%", background: "#43E098", color: '#000', border: 'none' }}>Request Access</button>
                </div>
              </>
            )}
            
            {receiveState === "connecting" && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ color: "#43E098", fontWeight: 600, fontSize: '16px' }}>Connecting...</div>
                <div style={{ marginTop: "12px", fontSize: "13px", color: 'var(--muted)' }}>Waiting for sender approval...</div>
              </div>
            )}
            
            {(receiveState === "active" || receiveState === "done") && (
              <>
                <div style={{ padding: "16px", borderRadius: "8px", background: 'var(--bg)', border: '1px solid var(--line)', marginBottom: "20px" }}>
                  <div className="lb" style={{ marginBottom: "8px" }}>Incoming Transfer</div>
                  <div style={{ fontWeight: 600, marginBottom: "8px", fontSize: "16px", color: "#43E098" }}>{receiveMeta?.transferName || "File Transfer"}</div>
                  <div style={{ fontSize: "13px", marginBottom: "8px", color: 'var(--muted)' }}>From: <span style={{ color: 'var(--text)' }}>{receiveMeta?.senderName}</span></div>
                  <div style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: 'var(--muted)' }}>{receiveMeta?.files?.length} files</div>
                </div>
                
                {receiveState !== "done" ? (
                  <div>
                    <div style={{ height: "6px", background: "var(--line)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${receiveProgress}%`, background: "#43E098", borderRadius: "4px", transition: "width 0.2s ease" }}></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "12px", fontFamily: "var(--font-mono)", color: 'var(--muted)' }}>
                      <span>Receiving data...</span>
                      <span>{receiveProgress}%</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ color: '#43E098', fontWeight: 600, marginBottom: '8px' }}>✓ Transfer Complete</div>
                    {receivedFiles.map((file, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '8px' }}>
                        <span style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{file.name}</span>
                        <a href={file.url} download={file.name} className="dl" style={{ textDecoration: 'none', background: 'var(--line)', padding: '6px 12px', color: 'var(--text)', border: 'none' }}>Download</a>
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                  <button className="pb" onClick={cancelTransfer} style={{ width: "100%", color: '#ff3b30', borderColor: 'rgba(255, 59, 48, 0.5)' }}>
                    {receiveState === "done" ? "Close" : "Cancel Transfer"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

