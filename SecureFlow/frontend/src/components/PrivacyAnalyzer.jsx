import { useState } from "react";
import { analyzeText, uploadFile } from "../services/api";

export default function PrivacyAnalyzer() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🧩 Handle file selection and preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile && selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null); // PDFs will just show file info
    }
  };

  // 🚀 Analyze either text or uploaded file
  const handleAnalyze = async () => {
    if (!text && !file) return alert("Please enter text or upload a file.");
    setLoading(true);
    setResult(null);

    let data;
    if (file) data = await uploadFile(file);
    else data = await analyzeText(text);

    setResult(data);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-[#0B0B12]/95 border border-gray-800 rounded-2xl backdrop-blur-lg shadow-lg text-gray-200">
      <h2 className="text-xl font-semibold text-fuchsia-400 mb-2">
        Privacy Analyzer
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Paste text or upload a file to detect sensitive data.
      </p>

      {/* 📝 Text Area */}
      <textarea
        placeholder="Enter or paste text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-32 p-3 rounded-md bg-[#1A1A24] border border-gray-700 text-gray-200 mb-3 outline-none resize-none"
      ></textarea>

      {/* 📂 File Upload */}
      <div className="flex flex-col items-center border-2 border-dashed border-gray-700 rounded-lg p-4 mb-3 bg-[#11111A] hover:border-fuchsia-500 transition-all">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
          id="fileUpload"
        />
        <label
          htmlFor="fileUpload"
          className="cursor-pointer text-fuchsia-400 font-medium hover:underline"
        >
          Click to upload PDF or image
        </label>

        {file && (
          <div className="mt-3 text-center">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded-lg border border-gray-600 shadow-md"
              />
            ) : (
              <p className="text-sm text-gray-400">
                📄 {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>
        )}
      </div>

      {/* 🚀 Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full py-2 rounded-md bg-gradient-to-r from-fuchsia-600 via-purple-500 to-cyan-500 hover:opacity-90 transition-all duration-300 font-semibold"
      >
        {loading ? "Analyzing..." : file ? "Analyze File" : "Analyze Text"}
      </button>

      {/* 🧠 Result Section */}
      {result && (
        <div className="mt-5 bg-[#151521] p-4 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-300">
            <strong className="text-fuchsia-400">Detected Entities:</strong>{" "}
            {result.entities ? result.entities.join(", ") : "None"}
          </p>
          <p className="text-sm text-gray-300 mt-2">
            <strong className="text-fuchsia-400">Sanitized Output:</strong>{" "}
            {result.sanitized_text || "N/A"}
          </p>
        </div>
      )}
    </div>
  );
}
