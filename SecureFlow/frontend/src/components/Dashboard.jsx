import { useEffect, useState } from "react";
import { fetchLogs } from "../services/api";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const loadLogs = async () => {
      const data = await fetchLogs();
      if (Array.isArray(data)) setLogs(data);
      else if (data && data.logs) setLogs(data.logs);
      else setLogs([]);
    };
    loadLogs();
  }, []);

  return (
    <motion.div
      className="p-6 bg-[#0B0B12]/95 border border-gray-800 rounded-2xl backdrop-blur-lg shadow-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-fuchsia-400">Audit Logs</h2>
        <span className="text-xs text-gray-500 italic">
          Updated in real-time
        </span>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        Encrypted summaries of recent text and file scans.
      </p>

      {/* Logs Section */}
      <div className="bg-[#11111A]/80 rounded-lg border border-gray-800 p-4 overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-10">
            No logs available yet.
          </p>
        ) : (
          <motion.ul
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12 } },
            }}
          >
            {logs.map((log, index) => (
              <motion.li
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="border border-gray-700 rounded-lg p-3 bg-[#151521]/80 hover:border-fuchsia-500 hover:shadow-[0_0_10px_#d946ef44] transition-all duration-300"
              >
                <p className="text-xs text-gray-400 mb-1">
                  <span className="text-fuchsia-400 font-medium">Time:</span>{" "}
                  {new Date(log.ts || log.timestamp).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mb-1">
                  <span className="text-cyan-400 font-medium">Event:</span>{" "}
                  {log.event || "Unknown"}
                </p>
                <p className="text-xs text-gray-400 mb-1">
                  <span className="text-amber-400 font-medium">Entities:</span>{" "}
                  {log.summary
                    ? JSON.stringify(log.summary)
                    : "No entity data"}
                </p>
                <p className="text-xs text-gray-500 italic mt-1">
                  {log.sanitized
                    ? "Encrypted text saved securely."
                    : "No sanitized data available."}
                </p>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </motion.div>
  );
}
