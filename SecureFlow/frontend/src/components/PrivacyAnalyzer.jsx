import { useState } from "react";
import { analyzeText, uploadFile } from "../services/api";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
// Vite-friendly PDF.js worker configuration
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

export default function PrivacyAnalyzer() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const colorFor = (type) => {
    const t = (type || "").toUpperCase();
    const map = {
      EMAIL: "bg-emerald-700/30 text-emerald-300 border-emerald-600/60",
      PASSWORD: "bg-rose-700/30 text-rose-300 border-rose-600/60",
      PHONE: "bg-amber-700/30 text-amber-300 border-amber-600/60",
      AADHAAR: "bg-fuchsia-700/30 text-fuchsia-300 border-fuchsia-600/60",
      PAN: "bg-indigo-700/30 text-indigo-300 border-indigo-600/60",
      CREDIT_CARD: "bg-orange-700/30 text-orange-300 border-orange-600/60",
      IP_ADDRESS: "bg-cyan-700/30 text-cyan-300 border-cyan-600/60",
      URL: "bg-blue-700/30 text-blue-300 border-blue-600/60",
      DATE: "bg-lime-700/30 text-lime-300 border-lime-600/60",
      PERSON_NAME: "bg-slate-700/30 text-slate-300 border-slate-600/60",
      IFSC: "bg-purple-700/30 text-purple-300 border-purple-600/60",
      PASSPORT: "bg-teal-700/30 text-teal-300 border-teal-600/60",
      ORG_NAME: "bg-pink-700/30 text-pink-300 border-pink-600/60",
      LAYOFF: "bg-red-800/30 text-red-300 border-red-700/60",
      MEDICAL_CONDITION: "bg-rose-800/30 text-rose-300 border-rose-700/60",
      POLITICAL_OPINION: "bg-yellow-800/30 text-yellow-300 border-yellow-700/60",
      RELIGION: "bg-amber-800/30 text-amber-200 border-amber-700/60",
      SEXUAL_ORIENTATION: "bg-fuchsia-800/30 text-fuchsia-300 border-fuchsia-700/60",
      FINANCIAL_STATUS: "bg-green-800/30 text-green-300 border-green-700/60",
      EMPLOYMENT_PROBLEM: "bg-red-900/30 text-red-300 border-red-800/60",
      CORPORATE_CONFIDENTIAL: "bg-sky-900/30 text-sky-300 border-sky-800/60",
      MEETING: "bg-indigo-800/30 text-indigo-300 border-indigo-700/60",
      PROJECT_NAME: "bg-cyan-900/30 text-cyan-300 border-cyan-800/60",
      ROADMAP: "bg-blue-900/30 text-blue-300 border-blue-800/60",
      CODE_SNIPPET: "bg-slate-900/30 text-slate-200 border-slate-800/60",
      SECURITY_VULN: "bg-orange-900/30 text-orange-300 border-orange-800/60",
      INTERNAL_METRIC: "bg-emerald-900/30 text-emerald-300 border-emerald-800/60",
      DEFENSE_INFO: "bg-stone-900/30 text-stone-300 border-stone-800/60",
      INFER_HEALTH: "bg-lime-900/30 text-lime-300 border-lime-800/60",
      INFER_FRAUD: "bg-red-900/30 text-red-300 border-red-800/60",
      INFER_SUPPLY_CHAIN: "bg-teal-900/30 text-teal-300 border-teal-800/60",
      INFER_INSIDER: "bg-pink-900/30 text-pink-300 border-pink-800/60",
    };
    return map[t] || "bg-gray-700/30 text-gray-300 border-gray-600/60";
  };

  const isFileMode = !!file;
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrExtracting, setOcrExtracting] = useState(false);

  // 🚀 Analyze
  const handleAnalyze = async () => {
    if (!text && !file) return alert("Please enter text or upload a file.");
    setLoading(true);
    setResult(null);
    let data;
    try {
      if (file) {
        if (file.type.startsWith("image/")) {
          setOcrExtracting(true);
          setOcrProgress(1);
          const ocrRes = await Tesseract.recognize(file, "eng", {
            logger: (m) => {
              if (m.status === "recognizing text" && m.progress != null) {
                setOcrProgress(Math.min(99, Math.round(m.progress * 100)));
              }
            },
          });
          setOcrProgress(100);
          setOcrExtracting(false);
          const extracted = ocrRes?.data?.text || "";
          data = await analyzeText(extracted.slice(0, 20000));
        } else if (file.type === "application/pdf") {
          // Client-side PDF text extraction first; fallback to backend if needed
          try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let extractedText = "";
            for (let p = 1; p <= pdf.numPages; p++) {
              const page = await pdf.getPage(p);
              const content = await page.getTextContent();
              const pageText = content.items.map(i => i.str).join(" ");
              extractedText += pageText + "\n";
              if (extractedText.length > 20000) break; // avoid huge payload
            }
            const cleaned = extractedText.trim();
            if (cleaned.length > 20) {
              data = await analyzeText(cleaned.slice(0, 20000));
            } else {
              // Fallback to backend (may have better parser) or treat as scanned -> OCR first page render
              const bufferUpload = await uploadFile(file);
              if (bufferUpload?.sanitized) {
                data = bufferUpload;
              } else {
                // Render first page to canvas and OCR it
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: ctx, viewport }).promise;
                setOcrExtracting(true);
                setOcrProgress(1);
                const ocrRes = await Tesseract.recognize(canvas, "eng", {
                  logger: (m) => {
                    if (m.status === "recognizing text" && m.progress != null) {
                      setOcrProgress(Math.min(99, Math.round(m.progress * 100)));
                    }
                  },
                });
                setOcrProgress(100);
                setOcrExtracting(false);
                const ocrText = ocrRes?.data?.text || "";
                data = await analyzeText(ocrText.slice(0, 20000));
              }
            }
          } catch (pdfErr) {
            console.warn("PDF parse failed, sending to backend", pdfErr);
            data = await uploadFile(file);
          }
        } else {
          alert("Unsupported file type. Use PDF or image.");
          setLoading(false);
          return;
        }
      } else {
        data = await analyzeText(text);
      }
      setResult(data);
    } catch (err) {
      console.error("Analyze error", err);
      alert("Failed to analyze file/text.");
    } finally {
      setLoading(false);
      setOcrExtracting(false);
    }
  };

  const copyToClipboard = async (value) => {
    if (!value) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const el = document.createElement("textarea");
        el.value = value;
        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {
      // noop
    }
  };

  const renderSanitized = (text) => {
    if (!text) return null;
    // Match tokens like [TYPE]
    const tokenRegex = /\[(\w+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let m;
    while ((m = tokenRegex.exec(text)) !== null) {
      if (m.index > lastIndex) {
        parts.push({ type: "text", value: text.slice(lastIndex, m.index) });
      }
      parts.push({ type: "token", value: m[1] });
      lastIndex = tokenRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push({ type: "text", value: text.slice(lastIndex) });
    }

    return parts.map((p, i) =>
      p.type === "text" ? (
        <span key={i}>{p.value}</span>
      ) : (
        <span
          key={i}
          className={`inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded border text-xs font-medium ${colorFor(
            p.value
          )}`}
        >
          [{p.value}]
        </span>
      )
    );
  };

  return (
    <div className="p-6 bg-[#0B0B12]/95 border border-gray-800 rounded-2xl backdrop-blur-lg shadow-lg text-gray-200">
      <h2 className="text-xl font-semibold text-fuchsia-400 mb-2">
        Privacy Analyzer
      </h2>

      <textarea
        placeholder="Enter or paste text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-32 p-3 rounded-md bg-[#1A1A24] border border-gray-700 text-gray-200 mb-3 resize-none"
      ></textarea>

      {/* File uploader for PDF or image */}
      <div className="flex flex-col items-center border-2 border-dashed border-gray-700 rounded-lg p-4 mb-3 bg-[#11111A]">
        <input
          type="file"
          id="fileUpload"
          onChange={(e) => {
            const f = e.target.files[0];
            setFile(f);
            if (f && f.type.startsWith("image/")) {
              const reader = new FileReader();
              reader.onloadend = () => setPreview(reader.result);
              reader.readAsDataURL(f);
            } else {
              setPreview(null);
            }
          }}
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          disabled={loading || ocrExtracting}
        />
        <label
          htmlFor="fileUpload"
          className={`cursor-pointer font-medium hover:underline ${loading ? "text-gray-500" : "text-fuchsia-400"}`}
        >
          {loading || ocrExtracting ? "Analyzing - upload disabled" : "Click to upload PDF or image"}
        </label>
        {file && (
          <div className="mt-3 text-center">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="max-h-40 rounded-lg border border-gray-600 shadow-md"
              />
            ) : (
              <p className="text-sm text-gray-400">
                📄 {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>
        )}
      </div>


      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full py-2 rounded-md bg-gradient-to-r from-fuchsia-600 via-purple-500 to-cyan-500 disabled:opacity-50"
      >
        {loading ? (
          isFileMode ? (
            file?.type.startsWith("image/")
              ? `OCR ${ocrProgress}%`
              : "Analyzing PDF..."
          ) : "Analyzing Text..."
        ) : isFileMode ? (file?.type.startsWith("image/") ? "Analyze Image" : "Analyze PDF") : "Analyze Text"}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-5 bg-[#151521] p-4 rounded-lg border border-gray-700 relative">
          {ocrExtracting && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
              <div className="w-44 bg-gray-700/60 h-2 rounded overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 transition-all" style={{ width: `${ocrProgress}%` }} />
              </div>
              <p className="text-xs text-fuchsia-200 font-medium">OCR in progress {ocrProgress}%</p>
            </div>
          )}
          <div className="text-sm text-gray-300">
            <strong className="text-fuchsia-400">Detected Entities:</strong>{" "}
            {result.entities?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {result.entities.map((e, idx) => (
                  <span
                    key={`${e}-${idx}`}
                    className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold ${colorFor(
                      e
                    )}`}
                  >
                    {String(e).toUpperCase()}
                  </span>
                ))}
              </div>
            ) : (
              "None"
            )}
          </div>

          {/* Sanitized Output */}
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300 font-semibold text-fuchsia-400">Sanitized Output</span>
              <button
                type="button"
                onClick={() => copyToClipboard(result?.sanitized)}
                disabled={!result?.sanitized}
                className="text-xs px-2 py-1 rounded-md border border-gray-600 text-gray-200 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Copy sanitized text"
                title={copied ? "Copied!" : "Copy"}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="mt-2 p-3 rounded-md bg-[#0F0F18] border border-gray-700 text-sm text-gray-300 whitespace-pre-wrap break-words">
              {renderSanitized(result.sanitized) || "N/A"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
