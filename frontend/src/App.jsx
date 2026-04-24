import React, { useState, useEffect } from "react";
import { useBLEContext } from "./context/BLEContext"; // Updated import
import { Sun, Zap, Activity, Settings, Thermometer } from "lucide-react";
import LiveChart from "./components/LiveChart";
import DiagnosticAlerts from "./components/DiagnosticAlerts";
import Topbar from "./components/TopBar";
import { Link } from "react-router-dom";

const App = () => {
  const { connect, isConnected, sensorData } = useBLEContext(); // Now using global context
  const [dataHistory, setDataHistory] = useState([]);

  useEffect(() => {
    if (sensorData?.V > 0 || sensorData?.C > 0) {
      setDataHistory((prev) => {
        const newHistory = [
          ...prev,
          {
            ...sensorData,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
          },
        ];
        return newHistory.slice(-20);
      });
    }
  }, [sensorData]);

  const isDataAvailable =
    isConnected && (sensorData?.V > 0 || sensorData?.C > 0);
  const efficiency = isDataAvailable
    ? ((sensorData.P / 5) * 100).toFixed(1)
    : 0;

  return (
    <div
      className="min-h-screen bg-[#09090b] text-zinc-300 p-6 flex flex-col"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <Topbar
        rightElement={
          <>
            <div
              className={`flex items-center gap-2 text-xs font-medium tracking-wider ${isConnected ? "text-emerald-400" : "text-zinc-500"}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-500/80"}`}
              ></div>
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

      {/* Main Grid Content */}
      <main className="flex-1 flex flex-col gap-6">
        {/* Top 4 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Voltage */}
          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between h-32 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start text-zinc-500 text-xs font-medium tracking-widest">
              <span>VOLTAGE</span>
              <Zap className="w-4 h-4 text-amber-400/80" />
            </div>
            <div>
              <div className="text-3xl font-semibold text-zinc-100">
                {isDataAvailable ? sensorData.V.toFixed(2) : "--"}
                <span className="text-base text-zinc-500 ml-1 font-normal">
                  V
                </span>
              </div>
            </div>
          </div>

          {/* Current */}
          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between h-32 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start text-zinc-500 text-xs font-medium tracking-widest">
              <span>CURRENT</span>
              <Activity className="w-4 h-4 text-sky-400/80" />
            </div>
            <div>
              <div className="text-3xl font-semibold text-zinc-100">
                {isDataAvailable ? sensorData.C.toFixed(2) : "--"}
                <span className="text-base text-zinc-500 ml-1 font-normal">
                  A
                </span>
              </div>
            </div>
          </div>

          {/* Power */}
          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between h-32 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start text-zinc-500 text-xs font-medium tracking-widest">
              <span>POWER</span>
              <Settings className="w-4 h-4 text-emerald-400/80" />
            </div>
            <div>
              <div className="text-3xl font-semibold text-zinc-100">
                {isDataAvailable ? sensorData.P.toFixed(2) : "--"}
                <span className="text-base text-zinc-500 ml-1 font-normal">
                  W
                </span>
              </div>
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between h-32 hover:border-zinc-700 transition-colors">
            <div className="flex justify-between items-start text-zinc-500 text-xs font-medium tracking-widest">
              <span>TEMP</span>
              <Thermometer className="w-4 h-4 text-rose-400/80" />
            </div>
            <div>
              <div className="text-3xl font-semibold text-zinc-100">
                {isDataAvailable ? sensorData.T.toFixed(1) : "--"}
                <span className="text-base text-zinc-500 ml-1 font-normal">
                  °C
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Chart & Side Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-[#121214] rounded-xl border border-zinc-800/50 p-5 flex flex-col min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-medium tracking-widest text-zinc-500">
                TELEMETRY
              </span>
              {isDataAvailable && (
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>{" "}
                  Live
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

          {/* Efficiency and Health */}
          <div className="flex flex-col gap-6">
            {/* Efficiency */}
            <div className="bg-[#121214] rounded-xl border border-zinc-800/50 p-5 flex-1 flex flex-col justify-center">
              <h3 className="text-xs font-medium tracking-widest text-zinc-500 mb-4">
                EFFICIENCY
              </h3>
              <div className="text-5xl font-light text-zinc-100 mb-6">
                {isDataAvailable ? efficiency : "--"}
                <span className="text-2xl text-zinc-500">%</span>
              </div>
              <div className="w-full bg-zinc-800/50 rounded-full h-1 mb-2 overflow-hidden">
                <div
                  className="bg-amber-400/80 h-1 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(Math.max(efficiency, 0), 100)}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600 tracking-wider">
                <span>0%</span>
                <span>5W RATED</span>
                <span>100%</span>
              </div>
            </div>

            {/* Health */}
            <div className="bg-[#121214] rounded-xl border border-zinc-800/50 p-5 flex-1 flex flex-col justify-center">
              <h3 className="text-xs font-medium tracking-widest text-zinc-500 mb-6">
                DIAGNOSTICS
              </h3>
              <div className="flex justify-between items-center px-4">
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full border flex items-center justify-center text-sm font-medium transition-colors ${sensorData?.V > 0 ? "border-amber-400/20 text-amber-400 bg-amber-400/5" : "border-zinc-800 text-zinc-600"}`}
                  >
                    V
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full border flex items-center justify-center text-sm font-medium transition-colors ${sensorData?.C > 0 ? "border-sky-400/20 text-sky-400 bg-sky-400/5" : "border-zinc-800 text-zinc-600"}`}
                  >
                    I
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full border flex items-center justify-center text-sm font-medium transition-colors ${sensorData?.T > 0 ? "border-emerald-400/20 text-emerald-400 bg-emerald-400/5" : "border-zinc-800 text-zinc-600"}`}
                  >
                    T
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Diagnostic Alerts */}
          <div className="bg-[#121214] rounded-xl border border-zinc-800/50 p-5 min-h-[160px] flex flex-col">
            <h3 className="text-xs font-medium tracking-widest text-zinc-500 mb-4">
              SYSTEM LOG
            </h3>
            <div className="flex-1 overflow-y-auto text-sm text-zinc-400">
              <DiagnosticAlerts data={sensorData} />
            </div>
          </div>

          {/* AI Detect */}
          <div className="bg-[#121214] rounded-xl border border-zinc-800/50 p-5 min-h-[160px]">
            <h3 className="text-xs font-medium tracking-widest text-zinc-500 mb-4">
              AI ANALYSIS
            </h3>
            <p className="text-sm text-zinc-500 font-light leading-relaxed">
              System operating within expected parameters. Connect hardware to
              begin anomaly detection sequence.
            </p>
          </div>

          {/* Hardware Specs */}
          <div className="bg-[#121214] rounded-xl border border-zinc-800/50 p-5 min-h-[160px]">
            <h3 className="text-xs font-medium tracking-widest text-zinc-500 mb-4">
              HARDWARE
            </h3>
            <ul className="space-y-2.5 text-xs text-zinc-500">
              <li className="flex justify-between border-b border-zinc-800/50 pb-2">
                <span>MCU</span>
                <span className="text-zinc-300">Nano 33 BLE</span>
              </li>
              <li className="flex justify-between border-b border-zinc-800/50 pb-2">
                <span>SENSORS</span>
                <span className="text-zinc-300">INA219 / DHT11</span>
              </li>
              <li className="flex justify-between border-b border-zinc-800/50 pb-2">
                <span>RATED SPEC</span>
                <span className="text-zinc-300">5W / 9V</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;