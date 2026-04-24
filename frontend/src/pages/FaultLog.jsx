import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sun,
  Search,
  Filter,
  Download,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Topbar from "../components/TopBar";

// --- Mock Database ---
const initialLogs = [
  {
    id: "FLT-089",
    date: "2026-04-24 14:22:10",
    severity: "critical",
    type: "Thermal Hotspot",
    desc: "Cell temperature exceeded 65°C threshold.",
    status: "pending",
  },
  {
    id: "FLT-088",
    date: "2026-04-23 09:15:00",
    severity: "warning",
    type: "Current Drop",
    desc: "Sudden 15% drop in I-out. Potential shading.",
    status: "resolved",
  },
  {
    id: "FLT-087",
    date: "2026-04-21 18:05:33",
    severity: "info",
    type: "System Offline",
    desc: "Scheduled maintenance reboot initiated.",
    status: "resolved",
  },
  {
    id: "FLT-086",
    date: "2026-04-20 12:44:19",
    severity: "warning",
    type: "Voltage Fluctuation",
    desc: "V-out variance > 5% detected over 10s window.",
    status: "resolved",
  },
  {
    id: "FLT-085",
    date: "2026-04-18 11:10:05",
    severity: "critical",
    type: "Connection Lost",
    desc: "BLE telemetry stream interrupted.",
    status: "resolved",
  },
  {
    id: "FLT-084",
    date: "2026-04-15 08:30:00",
    severity: "info",
    type: "Firmware Update",
    desc: "MCU updated to v2.1.4 successfully.",
    status: "resolved",
  },
];

export default function FaultLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  // Filter logic
  const filteredLogs = initialLogs.filter((log) => {
    const matchesSearch =
      log.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || log.severity === filter;
    return matchesSearch && matchesFilter;
  });

  // Helper for Severity Badges
  const getSeverityStyles = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-rose-400/10 text-rose-400 border-rose-400/20";
      case "warning":
        return "bg-amber-400/10 text-amber-400 border-amber-400/20";
      case "info":
        return "bg-sky-400/10 text-sky-400 border-sky-400/20";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-3.5 h-3.5" />;
      case "warning":
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case "info":
        return <Info className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen bg-[#09090b] text-zinc-300 p-6 flex flex-col"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <Topbar
        rightElement={
          <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold tracking-wider transition-colors">
            <Download className="w-3.5 h-3.5" />
            EXPORT CSV
          </button>
        }
      />

      <main className="flex-1 flex flex-col gap-6">
        {/* Controls Bar */}
        <div className="bg-[#121214] rounded-xl p-4 border border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by ID or Fault Type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#09090b] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-4 h-4 text-zinc-500 hidden md:block" />
            <div className="flex bg-[#09090b] rounded-lg border border-zinc-800 p-1 w-full md:w-auto">
              {["all", "critical", "warning", "info"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-xs font-medium tracking-wider uppercase transition-colors ${
                    filter === f
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#121214] rounded-xl border border-zinc-800/50 flex flex-col flex-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/50 bg-[#09090b]/50 text-xs font-medium tracking-widest text-zinc-500 uppercase">
                  <th className="p-4 pl-6 font-medium">Log ID</th>
                  <th className="p-4 font-medium">Date & Time</th>
                  <th className="p-4 font-medium">Severity</th>
                  <th className="p-4 font-medium">Fault Type</th>
                  <th className="p-4 font-medium hidden md:table-cell">
                    Description
                  </th>
                  <th className="p-4 pr-6 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-zinc-800/50">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-zinc-800/20 transition-colors group"
                    >
                      <td className="p-4 pl-6 font-mono text-zinc-400">
                        {log.id}
                      </td>
                      <td className="p-4 text-zinc-300 whitespace-nowrap">
                        {log.date}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] uppercase tracking-wider font-semibold ${getSeverityStyles(log.severity)}`}
                        >
                          {getSeverityIcon(log.severity)}
                          {log.severity}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-200 font-medium whitespace-nowrap">
                        {log.type}
                      </td>
                      <td className="p-4 text-zinc-500 hidden md:table-cell truncate max-w-xs">
                        {log.desc}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {log.status === "resolved" ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400/80 text-xs font-medium tracking-wider uppercase">
                            <CheckCircle className="w-4 h-4" /> Resolved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-amber-400/80 text-xs font-medium tracking-wider uppercase">
                            <Clock className="w-4 h-4" /> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-8 text-center text-zinc-500 text-sm"
                    >
                      No logs found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="mt-auto border-t border-zinc-800/50 p-4 px-6 flex justify-between items-center bg-[#09090b]/20">
            <span className="text-xs text-zinc-500 tracking-wider">
              SHOWING {filteredLogs.length} ENTRIES
            </span>
            <div className="flex gap-2">
              <button
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
                disabled
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
