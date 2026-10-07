"use client";

import React, { useState, useRef } from "react";

// --- Date Utilities & Logic ---

const iso8601Regex = /^\d{4}-\d{2}-\d{2}(T|\s)?(\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?)?(Z|[+-]\d{2}:?\d{2})?$/;
const ymdRegex = /^\d{4}[/.-]\d{1,2}[/.-]\d{1,2}$/;
const dmyOrMdyRegex = /^\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}$/;

const hintKeys = ["date", "created", "updated", "timestamp", "dob", "time", "expiry", "expires", "issued", "due_on"];
function hasHintKey(path: string) {
  const parts = path.split('.');
  const key = parts[parts.length - 1].toLowerCase();
  if (hintKeys.some(h => key.includes(h))) return true;
  if (key.endsWith("_at")) return true;
  return false;
}

function isNumericDate(num: number) {
  if (num >= 1e9 && num <= 3e9) return true; // Unix seconds
  if (num >= 1e12 && num <= 3e12) return true; // Unix millis
  if (num >= 20000 && num <= 60000) return true; // Excel serial dates
  return false;
}

function getAbstractPath(pathParts: string[]) {
  return pathParts.map(p => isNaN(Number(p)) ? p : '[]').join('.');
}

function scanForDatePaths(obj: any, currentPath: string[] = [], results = new Set<string>()) {
  if (obj === null || obj === undefined) return results;
  
  const pathStr = currentPath.join('.');
  const abstractPath = getAbstractPath(currentPath);
  
  if (typeof obj === 'string') {
    if (iso8601Regex.test(obj) || ymdRegex.test(obj) || dmyOrMdyRegex.test(obj)) {
      results.add(abstractPath);
    } else if (hasHintKey(pathStr)) {
      const d = new Date(obj);
      if (!isNaN(d.getTime())) results.add(abstractPath);
    }
  } else if (typeof obj === 'number') {
    if (isNumericDate(obj)) {
      results.add(abstractPath);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((val, idx) => scanForDatePaths(val, [...currentPath, idx.toString()], results));
  } else if (typeof obj === 'object') {
    for (const key in obj) {
      scanForDatePaths(obj[key], [...currentPath, key], results);
    }
  }
  return results;
}

function pad(n: number) { return n < 10 ? '0' + n : n; }
function formatDate(dateObj: Date, format: string) {
  const yyyy = dateObj.getFullYear();
  const mm = pad(dateObj.getMonth() + 1);
  const dd = pad(dateObj.getDate());
  const HH = pad(dateObj.getHours());
  const min = pad(dateObj.getMinutes());
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const Mon = monthNames[dateObj.getMonth()];

  let out = format;
  out = out.replace(/YYYY/g, yyyy.toString());
  out = out.replace(/MM/g, mm.toString());
  out = out.replace(/Mon/g, Mon);
  out = out.replace(/DD/g, dd.toString());
  out = out.replace(/HH/g, HH.toString());
  out = out.replace(/mm/g, min.toString());
  return out;
}

function parseAndFormatDate(val: any, ambiguousOrder: string, targetFormat: string): string | null {
  try {
    let d: Date | null = null;
    
    if (typeof val === 'number') {
      if (val >= 20000 && val <= 60000) {
        // Excel epoch is Dec 30, 1899
        d = new Date((val - 25569) * 86400 * 1000);
      } else if (val >= 1e9 && val <= 3e9) {
        d = new Date(val * 1000); // Unix seconds
      } else {
        d = new Date(val); // Unix millis
      }
    } else if (typeof val === 'string') {
      // Check ambiguous slash-dash formats
      const ambiguousMatch = val.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
      if (ambiguousMatch) {
        const p1 = parseInt(ambiguousMatch[1], 10);
        const p2 = parseInt(ambiguousMatch[2], 10);
        const year = parseInt(ambiguousMatch[3], 10);
        const fullYear = year < 100 ? 2000 + year : year; // naive 2000+
        
        let day, month;
        if (p1 > 12) { day = p1; month = p2; }
        else if (p2 > 12) { day = p2; month = p1; }
        else {
          if (ambiguousOrder === 'DD/MM') { day = p1; month = p2; }
          else { month = p1; day = p2; }
        }
        d = new Date(fullYear, month - 1, day);
      } else {
        d = new Date(val);
      }
    }
    
    if (d && !isNaN(d.getTime())) {
      return formatDate(d, targetFormat);
    }
  } catch (e) {
    // Ignore and fallback
  }
  return null;
}

function convertJsonDates(obj: any, selectedAbstractPaths: Set<string>, ambiguousOrder: string, targetFormat: string, errors: { count: number }, currentPath: string[] = []): any {
  if (obj === null || obj === undefined) return obj;
  
  const abstractPath = getAbstractPath(currentPath);
  
  if (typeof obj === 'string' || typeof obj === 'number') {
    if (selectedAbstractPaths.has(abstractPath)) {
      const formatted = parseAndFormatDate(obj, ambiguousOrder, targetFormat);
      if (formatted !== null) return formatted;
      errors.count++;
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map((v, i) => convertJsonDates(v, selectedAbstractPaths, ambiguousOrder, targetFormat, errors, [...currentPath, i.toString()]));
  }
  
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const k in obj) {
      newObj[k] = convertJsonDates(obj[k], selectedAbstractPaths, ambiguousOrder, targetFormat, errors, [...currentPath, k]);
    }
    return newObj;
  }
  return obj;
}

function flattenObject(obj: any, prefix = '', res: any = {}) {
  if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const key in obj) {
      flattenObject(obj[key], prefix ? `${prefix}.${key}` : key, res);
    }
  } else {
    // Stringify arrays for flat table format
    res[prefix] = Array.isArray(obj) ? JSON.stringify(obj) : obj;
  }
  return res;
}

const loadSheetJS = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    // @ts-expect-error global
    if (window.XLSX) return resolve(window.XLSX);
    const script = document.createElement("script");
    script.src = "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js";
    // @ts-expect-error global
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error("Failed to load Excel export library."));
    document.head.appendChild(script);
  });
};

// --- Component ---

export const JSONDateConverterSection = () => {
  const [rawJson, setRawJson] = useState<any>(null);
  const [detectedFields, setDetectedFields] = useState<string[]>([]);
  const [checkedFields, setCheckedFields] = useState<Set<string>>(new Set());
  
  const [ambiguousOrder, setAmbiguousOrder] = useState("DD/MM");
  const [outputFormat, setOutputFormat] = useState("YYYY-MM-DD");
  const [customFormat, setCustomFormat] = useState("YYYY/MM/DD");
  const [outputStructure, setOutputStructure] = useState<"json" | "csv" | "excel">("json");
  
  const [convertedData, setConvertedData] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const parsed = JSON.parse(text);
        setRawJson(parsed);
        const fieldsSet = scanForDatePaths(parsed);
        const fieldsArr = Array.from(fieldsSet).sort();
        setDetectedFields(fieldsArr);
        setCheckedFields(new Set(fieldsArr)); // Check all by default
        setConvertedData(null); // Clear previous output
        setStatusMessage(`Loaded JSON. Detected ${fieldsArr.length} date fields.`);
      } catch (err) {
        // Fallback: Handle Raw Data (CSV, TSV, or plain text)
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length > 0 && (lines[0].includes(',') || lines[0].includes('\t'))) {
          const delimiter = lines[0].includes('\t') ? '\t' : ',';
          const headers = lines[0].split(delimiter);
          const parsed = lines.slice(1).map(line => {
            const values = line.split(delimiter);
            const obj: any = {};
            headers.forEach((h, i) => obj[h] = values[i]);
            return obj;
          });
          setRawJson(parsed);
          const fieldsSet = scanForDatePaths(parsed);
          const fieldsArr = Array.from(fieldsSet).sort();
          setDetectedFields(fieldsArr);
          setCheckedFields(new Set(fieldsArr));
          setConvertedData(null);
          setStatusMessage(`Parsed Raw Data (CSV/TSV). Detected ${fieldsArr.length} date fields.`);
        } else {
          // Just raw text lines
          const parsed = { raw_data: lines };
          setRawJson(parsed);
          setDetectedFields([]);
          setCheckedFields(new Set());
          setConvertedData(null);
          setStatusMessage("Loaded Raw Text as JSON array.");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const toggleField = (field: string) => {
    const newChecked = new Set(checkedFields);
    if (newChecked.has(field)) newChecked.delete(field);
    else newChecked.add(field);
    setCheckedFields(newChecked);
  };

  const executeConversion = () => {
    if (!rawJson) return;
    setIsProcessing(true);
    setStatusMessage("Converting...");
    
    setTimeout(() => {
      try {
        const formatStr = outputFormat === "custom" ? customFormat : outputFormat;
        const errors = { count: 0 };
        
        // 1. Convert Dates
        let finalData = convertJsonDates(rawJson, checkedFields, ambiguousOrder, formatStr, errors);
        
        // 2. Format Structure
        if (outputStructure === "csv" || outputStructure === "excel") {
          // Flatten into rows. If root is object, wrap in array.
          const rows = Array.isArray(finalData) ? finalData : [finalData];
          finalData = rows.map(r => flattenObject(r));
        }
        
        setConvertedData(finalData);
        
        if (errors.count > 0) {
          setStatusMessage(`Done. ${errors.count} value(s) couldn't be converted and were skipped.`);
        } else {
          setStatusMessage("Conversion complete. Ready to download.");
        }
      } catch (err) {
        setStatusMessage("An error occurred during conversion.");
      } finally {
        setIsProcessing(false);
      }
    }, 50); // slight UI yield
  };

  const downloadFile = async () => {
    if (!convertedData) return;
    
    if (outputStructure === "json") {
      const blob = new Blob([JSON.stringify(convertedData, null, 2)], { type: "application/json" });
      triggerDownload(blob, "converted.json");
    } else if (outputStructure === "csv") {
      // Basic CSV conversion
      const rows = convertedData as any[];
      if (rows.length === 0) return;
      const headers = Array.from(new Set(rows.flatMap(Object.keys)));
      const csvRows = [headers.join(",")];
      for (const row of rows) {
        csvRows.push(headers.map(h => {
          let v = row[h];
          if (v === null || v === undefined) v = "";
          const str = String(v).replace(/"/g, '""');
          return `"${str}"`;
        }).join(","));
      }
      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      triggerDownload(blob, "converted.csv");
    } else if (outputStructure === "excel") {
      try {
        setStatusMessage("Loading Excel library...");
        const XLSX = await loadSheetJS();
        setStatusMessage("Generating Excel file...");
        const ws = XLSX.utils.json_to_sheet(convertedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, "converted.xlsx");
        setStatusMessage("Download complete.");
      } catch (err) {
        setStatusMessage("Error: Could not load Excel library. Are you offline?");
      }
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setRawJson(null);
    setDetectedFields([]);
    setCheckedFields(new Set());
    setConvertedData(null);
    setStatusMessage("");
  };

  // Render preview
  let previewText = "Upload a JSON file to begin";
  
  if (convertedData) {
    if (outputStructure === "json") {
      previewText = JSON.stringify(convertedData, null, 2);
    } else {
      const rows = convertedData.slice(0, 25);
      const headers = Array.from(new Set((convertedData as any[]).flatMap(Object.keys)));
      const maxLens = headers.map(h => Math.max(h.length, ...rows.map((r: any) => String(r[h] || "").length)));
      
      let tableText = headers.map((h, i) => h.padEnd(maxLens[i])).join(" | ") + "\n";
      tableText += headers.map((_, i) => "-".repeat(maxLens[i])).join("-+-") + "\n";
      tableText += rows.map((r: any) => headers.map((h, i) => String(r[h] || "").padEnd(maxLens[i])).join(" | ")).join("\n");
      
      if (convertedData.length > 25) {
        tableText += `\n\n... +${convertedData.length - 25} more rows`;
      }
      previewText = tableText;
    }
  } else if (rawJson) {
    previewText = JSON.stringify(rawJson, null, 2);
  }

  return (
    <div className="ws">
      <div className="stage" style={{ padding: '20px', display: 'flex', flexDirection: 'column', background: 'var(--bg)', alignItems: 'stretch', justifyContent: 'flex-start' }}>
        <pre style={{
          flex: 1,
          margin: 0,
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: '10px',
          padding: '20px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11.5px',
          color: (rawJson || convertedData) ? 'var(--text)' : 'var(--muted)',
          overflow: 'auto',
          whiteSpace: 'pre',
          textAlign: 'left',
          display: 'block'
        }}>
          {previewText}
        </pre>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="mini" style={{ "--c": "#7CFFB2" } as React.CSSProperties}>Jd</div>
            <h3 style={{ margin: 0 }}>JSON Data Converter</h3>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <div style={{ position: 'relative' }}>
            <div className="pb" style={{ textAlign: 'center', cursor: 'pointer' }}>Upload JSON or Raw Data (CSV/TXT)...</div>
            <input type="file" accept=".json,application/json,.csv,.txt,text/csv,text/plain" onChange={handleFileUpload} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
          </div>

          <div>
            <div className="lb">Detected Date Fields</div>
            <div style={{ 
              maxHeight: '160px', 
              overflowY: 'auto', 
              border: '1px solid var(--line)', 
              borderRadius: '8px', 
              background: 'var(--card)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {detectedFields.length === 0 ? (
                <div style={{ padding: '12px', fontSize: '11px', color: 'var(--muted)', textAlign: 'center' }}>
                  {rawJson ? "No dates detected." : "Upload a file first."}
                </div>
              ) : (
                detectedFields.map(field => (
                  <label key={field} className="pb" style={{ margin: 0, border: 'none', borderBottom: '1px solid var(--line)', borderRadius: 0, display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={checkedFields.has(field)} onChange={() => toggleField(field)} style={{ margin: 0 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{field}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--line)' }}></div>

          <div className="two" style={{ gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div className="lb">Ambiguous Dates</div>
              <select value={ambiguousOrder} onChange={e => setAmbiguousOrder(e.target.value)} style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '9px', padding: '8px', color: 'var(--text)' }}>
                <option value="DD/MM">DD/MM</option>
                <option value="MM/DD">MM/DD</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <div className="lb">Output Format</div>
              <select value={outputFormat} onChange={e => setOutputFormat(e.target.value)} style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '9px', padding: '8px', color: 'var(--text)' }}>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD Mon YYYY">DD Mon YYYY</option>
                <option value="DD/MM/YYYY HH:mm">DD/MM/YYYY HH:mm</option>
                <option value="custom">Custom...</option>
              </select>
            </div>
          </div>
          
          {outputFormat === "custom" && (
            <div>
              <div className="lb">Custom Format</div>
              <input type="text" value={customFormat} onChange={e => setCustomFormat(e.target.value)} style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '9px', padding: '8px', color: 'var(--text)' }} />
            </div>
          )}

          <div>
            <div className="lb">Output Structure</div>
            <div className="two" style={{ gap: '8px', marginBottom: '8px' }}>
              <button className="chip" aria-pressed={outputStructure === "json"} onClick={() => setOutputStructure("json")}>Same JSON</button>
              <button className="chip" aria-pressed={outputStructure === "csv"} onClick={() => setOutputStructure("csv")}>Flat (CSV)</button>
            </div>
            <button className="chip" style={{ width: '100%' }} aria-pressed={outputStructure === "excel"} onClick={() => setOutputStructure("excel")}>Flat Table (Excel .xlsx)</button>
          </div>

          <div style={{ height: '1px', background: 'var(--line)' }}></div>

          <div className="two" style={{ gap: '12px' }}>
            <button className="pb" onClick={executeConversion} disabled={!rawJson || isProcessing} style={{ flex: 1, textAlign: 'center', borderColor: 'var(--brand)', color: 'var(--brand)' }}>
              {isProcessing ? "Working..." : "Convert"}
            </button>
            <button className="pb" onClick={handleReset} style={{ flex: 1, textAlign: 'center' }}>
              Clear
            </button>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', textAlign: 'center', minHeight: '16px' }}>
            {statusMessage}
          </div>

          <button 
            className="dl" 
            disabled={!convertedData} 
            onClick={downloadFile} 
            style={{ width: '100%', background: 'var(--brand)', color: '#fff', border: 'none', opacity: !convertedData ? 0.4 : 1 }}
          >
            Download {outputStructure.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};
