import { useEffect, useState } from "react";
import { fetchLogs } from "../services/api";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

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

  useEffect(() => {
    const loadLogs = async () => {
      const data = await fetchLogs();
      if (Array.isArray(data)) setLogs(data);
      else setLogs([]);
    };
    loadLogs();
  }, []);

  const copySummary = async (log) => {
    if (!log?.summary) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(log.summary);
      } else {
        const el = document.createElement("textarea");
        el.value = log.summary;
        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopiedId(log._id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (_) {}
  };

  return (
    <motion.div
      className="p-6 bg-[#0B0B12]/95 border border-gray-800 rounded-2xl backdrop-blur-lg shadow-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-fuchsia-400">Audit Logs</h2>
        <span className="text-xs text-gray-500 italic">Updated in real-time</span>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Encrypted summaries of recent text and file scans.
      </p>

      <div className="bg-[#11111A]/80 rounded-lg border border-gray-800 p-4 overflow-y-auto max-h-80">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-10">
            No logs available yet.
          </p>
        ) : (
          <motion.ul className="space-y-3">
            {logs.map((log, index) => (
              <motion.li
                key={index}
                className="border border-gray-700 rounded-lg p-3 bg-[#151521]/80"
              >
                <p className="text-xs text-gray-400 mb-1">
                  <span className="text-fuchsia-400">Time:</span>{" "}
                  {new Date(log.createdAt).toLocaleString()}
                </p>

                <p className="text-xs text-gray-400 mb-1">
                  <span className="text-cyan-400">Event:</span>{" "}
                  {log.eventType || "Unknown"}
                </p>

                <div className="text-xs text-gray-400 mb-2">
                  <span className="text-amber-400">Entities:</span>{" "}
                  {log.detectedEntities?.length ? (
                    <span className="inline-flex flex-wrap gap-1 ml-1">
                      {log.detectedEntities.map((e, i) => (
                        <span
                          key={`${e}-${i}`}
                          className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-semibold ${colorFor(
                            e
                          )}`}
                        >
                          {String(e).toUpperCase()}
                        </span>
                      ))}
                    </span>
                  ) : (
                    "None"
                  )}
                </div>

                <div className="mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">Sanitized</span>
                    <button
                      type="button"
                      onClick={() => copySummary(log)}
                      disabled={!log.summary}
                      className="text-[10px] px-2 py-0.5 rounded-md border border-gray-600 text-gray-200 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={copiedId === log._id ? "Copied!" : "Copy"}
                    >
                      {copiedId === log._id ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="mt-1 p-2 rounded-md bg-[#0F0F18] border border-gray-700 text-xs text-gray-300 whitespace-pre-wrap break-words">
                    {log.summary ? log.summary : "No sanitized data available."}
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </motion.div>
  );
}
