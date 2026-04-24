import React, { useState, useEffect, useRef } from "react";
import { useBLEContext } from "./context/BLEContext";
import { Zap, Activity, Settings, Thermometer } from "lucide-react";
import LiveChart from "./components/LiveChart";
import DiagnosticAlerts from "./components/DiagnosticAlerts";
import Topbar from "./components/TopBar";

// ── Arc Gauge ─────────────────────────────────────────────
function ArcGauge({ value, max, label, unit, color, zones }) {
  const canvasRef = useRef(null);
  const ARC_START = Math.PI * 0.75;
  const ARC_END = Math.PI * 2.25;
  const ARC_RANGE = ARC_END - ARC_START;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const size = 88;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2, cy = size / 2 + 4, r = 34, trackW = 5;

    // Track BG
    ctx.beginPath();
    ctx.arc(cx, cy, r, ARC_START, ARC_END);
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = trackW;
    ctx.lineCap = "round";
    ctx.stroke();

    // Colored zones
    if (zones) {
      zones.forEach(({ from, to, zoneColor }) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, ARC_START + (from / max) * ARC_RANGE, ARC_START + (to / max) * ARC_RANGE);
        ctx.strokeStyle = zoneColor;
        ctx.lineWidth = trackW;
        ctx.lineCap = "butt";
        ctx.stroke();
      });
    }

    // Value arc
    const pct = Math.min(1, Math.max(0, value / max));
    if (pct > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, ARC_START, ARC_START + pct * ARC_RANGE);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // Needle
    const na = ARC_START + pct * ARC_RANGE;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (r - 2) * Math.cos(na), cy + (r - 2) * Math.sin(na));
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }, [value, max, color, zones]);

  // Status from zones
  let status = "OK", statusColor = color;
  if (zones && value > 0) {
    const m = zones.find((z) => value >= z.from && value <= z.to);
    if (m) {
      if (m.zoneColor.includes("239,71,111"))  { status = "CRIT"; statusColor = "#EF476F"; }
      else if (m.zoneColor.includes("245,166,35")) { status = "WARN"; statusColor = "#F5A623"; }
    }
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <canvas ref={canvasRef} />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ paddingTop: 8 }}
        >
          <span className="text-sm font-semibold leading-none" style={{ color: statusColor }}>
            {value > 0 ? value.toFixed(value >= 10 ? 1 : 2) : "--"}
          </span>
          <span className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            {unit}
          </span>
        </div>
      </div>
      <span className="text-[9px] tracking-widest font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>
        {label}
      </span>
      <span
        className="text-[8px] tracking-widest font-semibold px-1.5 py-0.5 rounded"
        style={{
          color: statusColor,
          background:
            status === "CRIT" ? "rgba(239,71,111,0.12)"
            : status === "WARN" ? "rgba(245,166,35,0.12)"
            : `${color}18`,
          animation: status === "CRIT" ? "critPulse 1.5s ease-in-out infinite" : "none",
        }}
      >
        {value > 0 ? status : "IDLE"}
      </span>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────
const App = () => {
  const { connect, isConnected, sensorData } = useBLEContext();
  const [dataHistory, setDataHistory] = useState([]);

  useEffect(() => {
    if (sensorData?.V > 0 || sensorData?.C > 0) {
      setDataHistory((prev) =>
        [...prev, {
          ...sensorData,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit", minute: "2-digit", second: "2-digit",
          }),
        }].slice(-20)
      );
    }
  }, [sensorData]);

  const isDataAvailable = isConnected && (sensorData?.V > 0 || sensorData?.C > 0);
  const efficiency = isDataAvailable ? ((sensorData.P / 5) * 100).toFixed(1) : 0;

  const voltageZones = [
    { from: 0,    to: 5.5,  zoneColor: "rgba(239,71,111,0.45)"  },
    { from: 5.5,  to: 10.5, zoneColor: "rgba(6,214,160,0.25)"   },
    { from: 10.5, to: 12,   zoneColor: "rgba(245,166,35,0.45)"  },
  ];
  const currentZones = [
    { from: 0,   to: 0.1, zoneColor: "rgba(239,71,111,0.45)"  },
    { from: 0.1, to: 0.8, zoneColor: "rgba(6,214,160,0.25)"   },
    { from: 0.8, to: 1.0, zoneColor: "rgba(245,166,35,0.45)"  },
  ];
  const tempZones = [
    { from: 0,  to: 55, zoneColor: "rgba(6,214,160,0.25)"   },
    { from: 55, to: 65, zoneColor: "rgba(245,166,35,0.45)"  },
    { from: 65, to: 85, zoneColor: "rgba(239,71,111,0.45)"  },
  ];

  return (
    <div
      className="min-h-screen bg-[#09090b] text-zinc-300 p-6 flex flex-col"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <style>{`
        @keyframes critPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>

      <Topbar
        rightElement={
          <>
            <div className={`flex items-center gap-2 text-xs font-medium tracking-wider ${isConnected ? "text-emerald-400" : "text-zinc-500"}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-500/80"}`} />
              {isConnected ? "CONNECTED" : "STANDBY"}
            </div>
            <button
              onClick={connect}
              disabled={isConnected}
              className={`px-4 py-2 rounded text-xs font-semibold tracking-wider transition-all duration-200 ${
                isConnected
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-zinc-100 hover:bg-white text-zinc-900 active:scale-95"
              }`}
            >
              {isConnected ? "ACTIVE" : "CONNECT"}
            </button>
          </>
        }
      />

      <main className="flex-1 flex flex-col gap-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between h-32 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start text-zinc-500 text-xs font-medium tracking-widest">
              <span>VOLTAGE</span>
              <Zap className="w-4 h-4 text-amber-400/80" />
            </div>
            <div className="text-3xl font-semibold text-zinc-100">
              {isDataAvailable ? sensorData.V.toFixed(2) : "--"}
              <span className="text-base text-zinc-500 ml-1 font-normal">V</span>
            </div>
          </div>

          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between h-32 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start text-zinc-500 text-xs font-medium tracking-widest">
              <span>CURRENT</span>
              <Activity className="w-4 h-4 text-sky-400/80" />
            </div>
            <div className="text-3xl font-semibold text-zinc-100">
              {isDataAvailable ? sensorData.C.toFixed(2) : "--"}
              <span className="text-base text-zinc-500 ml-1 font-normal">A</span>
            </div>
          </div>

          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between h-32 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start text-zinc-500 text-xs font-medium tracking-widest">
              <span>POWER</span>
              <Settings className="w-4 h-4 text-emerald-400/80" />
            </div>
            <div className="text-3xl font-semibold text-zinc-100">
              {isDataAvailable ? sensorData.P.toFixed(2) : "--"}
              <span className="text-base text-zinc-500 ml-1 font-normal">W</span>
            </div>
          </div>

          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between h-32 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start text-zinc-500 text-xs font-medium tracking-widest">
              <span>TEMP</span>
              <Thermometer className="w-4 h-4 text-rose-400/80" />
            </div>
            <div className="text-3xl font-semibold text-zinc-100">
              {isDataAvailable ? sensorData.T.toFixed(1) : "--"}
              <span className="text-base text-zinc-500 ml-1 font-normal">°C</span>
            </div>
          </div>
        </div>

        {/* Chart + Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Chart */}
          <div className="lg:col-span-2 bg-[#121214] rounded-xl border border-zinc-800/50 p-5 flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-medium tracking-widest text-zinc-500">TELEMETRY</span>
              {isDataAvailable && (
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live
                </span>
              )}
            </div>
            <div className="flex-1 w-full relative">
              {dataHistory.length > 0 ? (
                <LiveChart data={dataHistory} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs tracking-wide text-zinc-600">
                  Awaiting datastream...
                </div>
              )}
            </div>
          </div>

          {/* Efficiency + Diagnostics */}
          <div className="flex flex-col gap-6">

            {/* Efficiency */}
            <div className="bg-[#121214] rounded-xl border border-zinc-800/50 p-5 flex-1 flex flex-col justify-center">
              <h3 className="text-xs font-medium tracking-widest text-zinc-500 mb-4">EFFICIENCY</h3>
              <div className="text-5xl font-light text-zinc-100 mb-6">
                {isDataAvailable ? efficiency : "--"}
                <span className="text-2xl text-zinc-500">%</span>
              </div>
              <div className="w-full bg-zinc-800/50 rounded-full h-1 mb-2 overflow-hidden">
                <div
                  className="bg-amber-400/80 h-1 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(Math.max(efficiency, 0), 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600 tracking-wider">
                <span>0%</span><span>5W RATED</span><span>100%</span>
              </div>
            </div>

            {/* Diagnostics */}
            <div className="bg-[#121214] rounded-xl border border-zinc-800/50 p-5 flex-1 flex flex-col">
              <h3 className="text-xs font-medium tracking-widest text-zinc-500 mb-5">DIAGNOSTICS</h3>

              <div className="flex justify-between items-start px-1">
                <ArcGauge
                  value={sensorData?.V ?? 0}
                  max={12}
                  label="VOLTAGE"
                  unit="V"
                  color="#FBBF24"
                  zones={voltageZones}
                />
                <ArcGauge
                  value={sensorData?.C ?? 0}
                  max={1.0}
                  label="CURRENT"
                  unit="A"
                  color="#38BDF8"
                  zones={currentZones}
                />
                <ArcGauge
                  value={sensorData?.T ?? 0}
                  max={85}
                  label="TEMP"
                  unit="°C"
                  color="#34D399"
                  zones={tempZones}
                />
              </div>

              <div className="mt-auto pt-3 border-t border-zinc-800/50 flex items-center justify-center gap-4">
                {[
                  { color: "rgba(6,214,160,0.7)",  label: "Normal" },
                  { color: "rgba(245,166,35,0.7)", label: "Warn"   },
                  { color: "rgba(239,71,111,0.7)", label: "Crit"   },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                    <span className="text-[9px] tracking-wider text-zinc-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-[#121214] rounded-xl border border-zinc-800/50 p-5 min-h-[160px] flex flex-col">
            <h3 className="text-xs font-medium tracking-widest text-zinc-500 mb-4">SYSTEM LOG</h3>
            <div className="flex-1 overflow-y-auto text-sm text-zinc-400">
              <DiagnosticAlerts data={sensorData} />
            </div>
          </div>

          <div className="bg-[#121214] rounded-xl border border-zinc-800/50 p-5 min-h-[160px]">
            <h3 className="text-xs font-medium tracking-widest text-zinc-500 mb-4">AI ANALYSIS</h3>
            <p className="text-sm text-zinc-500 font-light leading-relaxed">
              System operating within expected parameters. Connect hardware to begin anomaly detection sequence.
            </p>
          </div>

          <div className="bg-[#121214] rounded-xl border border-zinc-800/50 p-5 min-h-[160px]">
            <h3 className="text-xs font-medium tracking-widest text-zinc-500 mb-4">HARDWARE</h3>
            <ul className="space-y-2.5 text-xs text-zinc-500">
              <li className="flex justify-between border-b border-zinc-800/50 pb-2">
                <span>MCU</span><span className="text-zinc-300">Nano 33 BLE</span>
              </li>
              <li className="flex justify-between border-b border-zinc-800/50 pb-2">
                <span>SENSORS</span><span className="text-zinc-300">INA219 / DHT11</span>
              </li>
              <li className="flex justify-between border-b border-zinc-800/50 pb-2">
                <span>RATED SPEC</span><span className="text-zinc-300">5W / 9V</span>
              </li>
            </ul>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
