import React from "react";
import { useBLEContext } from "../context/BLEContext"; 
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Sun, Activity, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import Topbar from "../components/TopBar";

export default function Analytics() {
  const { sensorData, isConnected, sessionHistory, faultLogs } = useBLEContext(); 

  const chartStyles = {
    gridStroke: "#27272a", 
    textFill: "#71717a", 
    tooltipContent: {
      backgroundColor: "#18181b", 
      borderColor: "#27272a", 
      color: "#e4e4e7", 
      borderRadius: "8px",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.5)",
    },
  };

  // Calculate live session stats
  const peakPower = sessionHistory.length > 0 ? Math.max(...sessionHistory.map(d => d.power)) : 0;
  const currentYield = sessionHistory.reduce((acc, curr) => acc + (curr.power / 720), 0); // Convert W per 5s to Wh

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 p-6 flex flex-col" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <Topbar 
        rightElement={
          <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#121214] border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 transition-colors">
            <Activity className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
            LIVE SESSION
          </button>
        } 
      />

      <main className="flex-1 flex flex-col gap-6">
        {/* KPI Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between">
            <span className="text-zinc-500 text-xs font-medium tracking-widest mb-4">SESSION YIELD</span>
            <div className="text-3xl font-semibold text-emerald-400">
              {currentYield.toFixed(3)} <span className="text-base text-zinc-500 font-normal">Wh</span>
            </div>
          </div>
          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between">
            <span className="text-zinc-500 text-xs font-medium tracking-widest mb-4">PEAK SESSION POWER</span>
            <div className="text-3xl font-semibold text-amber-400">
              {peakPower.toFixed(2)} <span className="text-base text-zinc-500 font-normal">W</span>
            </div>
          </div>
          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between">
            <span className="text-zinc-500 text-xs font-medium tracking-widest mb-4">LIVE EFFICIENCY</span>
            <div className="text-3xl font-semibold text-sky-400">
              {isConnected && sensorData?.P > 0 ? ((sensorData.P / 5) * 100).toFixed(1) : "0.0"} <span className="text-base text-zinc-500 font-normal">%</span>
            </div>
          </div>
          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between">
            <span className="text-zinc-500 text-xs font-medium tracking-widest mb-4">FAULTS DETECTED</span>
            <div className="text-3xl font-semibold text-rose-400 flex items-center gap-3">
              {faultLogs.length} {faultLogs.length > 0 && <AlertTriangle className="w-5 h-5 text-rose-400" />}
            </div>
          </div>
        </div>

        {/* Main Chart: Power Output Over Time */}
        <div className="bg-[#121214] rounded-xl border border-zinc-800/50 p-5 min-h-[350px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-medium tracking-widest text-zinc-500 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" /> LIVE POWER OUTPUT (W)
            </span>
          </div>
          <div className="flex-1 w-full relative">
            {sessionHistory.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-600 z-10">Awaiting datastream to plot chart...</div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStyles.gridStroke} />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: chartStyles.textFill }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: chartStyles.textFill }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#27272a", opacity: 0.4 }} contentStyle={chartStyles.tooltipContent} />
                <Bar dataKey="power" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row: V/I Correlation & Temperature Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#121214] rounded-xl border border-zinc-800/50 p-5 min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-medium tracking-widest text-zinc-500 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" /> LIVE V/I CORRELATION
              </span>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sessionHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVoltage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} /><stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} /><stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStyles.gridStroke} />
                  <XAxis dataKey="time" tick={{ fontSize: 12, fill: chartStyles.textFill }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: chartStyles.textFill }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: chartStyles.textFill }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartStyles.tooltipContent} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", color: chartStyles.textFill }} />
                  <Area yAxisId="left" type="monotone" dataKey="voltage" name="Voltage (V)" stroke="#fbbf24" fillOpacity={1} fill="url(#colorVoltage)" />
                  <Area yAxisId="right" type="monotone" dataKey="current" name="Current (A)" stroke="#38bdf8" fillOpacity={1} fill="url(#colorCurrent)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#121214] rounded-xl border border-zinc-800/50 p-5 min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-medium tracking-widest text-zinc-500 flex items-center gap-2">
                <Sun className="w-4 h-4 text-rose-400" /> LIVE THERMAL PROFILE (°C)
              </span>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sessionHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStyles.gridStroke} />
                  <XAxis dataKey="time" tick={{ fontSize: 12, fill: chartStyles.textFill }} axisLine={false} tickLine={false} />
                  <YAxis domain={["dataMin - 2", "auto"]} tick={{ fontSize: 12, fill: chartStyles.textFill }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartStyles.tooltipContent} />
                  <Line type="monotone" dataKey="temp" name="Panel Temp" stroke="#fb7185" strokeWidth={3} dot={{ fill: "#09090b", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}