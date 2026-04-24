import React, { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Sun, Calendar, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import Topbar from "../components/TopBar";

// --- Mock Data Generators ---
const generateWeeklyData = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day) => ({
    day,
    yield: (Math.random() * 20 + 15).toFixed(1), // Wh
    peakPower: (Math.random() * 1.5 + 3.5).toFixed(2), // W
  }));
};

const generateHourlyData = () => {
  const data = [];
  for (let i = 6; i <= 18; i++) {
    const baseVal = Math.sin(((i - 6) / 12) * Math.PI); // Bell curve peaking at noon
    data.push({
      time: `${i}:00`,
      voltage: (baseVal * 4 + 4 + Math.random() * 0.5).toFixed(2),
      current: (baseVal * 0.5 + Math.random() * 0.1).toFixed(2),
      temp: (baseVal * 15 + 25 + Math.random() * 2).toFixed(1),
    });
  }
  return data;
};

export default function Analytics() {
  const [weeklyData] = useState(generateWeeklyData());
  const [hourlyData] = useState(generateHourlyData());

  // Dark mode chart styling constants
  const chartStyles = {
    gridStroke: "#27272a", // zinc-800
    textFill: "#71717a", // zinc-500
    tooltipContent: {
      backgroundColor: "#18181b", // zinc-900
      borderColor: "#27272a", // zinc-800
      color: "#e4e4e7", // zinc-200
      borderRadius: "8px",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.5)",
    },
  };

  return (
    <div
      className="min-h-screen bg-[#09090b] text-zinc-300 p-6 flex flex-col"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <Topbar 
  rightElement={
    <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#121214] border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 transition-colors">
      <Calendar className="w-3.5 h-3.5" />
      LAST 7 DAYS
    </button>
  } 
/>

      <main className="flex-1 flex flex-col gap-6">
        {/* KPI Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between">
            <span className="text-zinc-500 text-xs font-medium tracking-widest mb-4">
              TOTAL YIELD (7D)
            </span>
            <div className="text-3xl font-semibold text-emerald-400">
              164.2{" "}
              <span className="text-base text-zinc-500 font-normal">Wh</span>
            </div>
          </div>
          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between">
            <span className="text-zinc-500 text-xs font-medium tracking-widest mb-4">
              PEAK POWER
            </span>
            <div className="text-3xl font-semibold text-amber-400">
              4.85{" "}
              <span className="text-base text-zinc-500 font-normal">W</span>
            </div>
          </div>
          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between">
            <span className="text-zinc-500 text-xs font-medium tracking-widest mb-4">
              AVG EFFICIENCY
            </span>
            <div className="text-3xl font-semibold text-sky-400">
              82.4{" "}
              <span className="text-base text-zinc-500 font-normal">%</span>
            </div>
          </div>
          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex flex-col justify-between">
            <span className="text-zinc-500 text-xs font-medium tracking-widest mb-4">
              ANOMALIES DETECTED
            </span>
            <div className="text-3xl font-semibold text-rose-400 flex items-center gap-3">
              0 <AlertTriangle className="w-5 h-5 text-zinc-700" />
            </div>
          </div>
        </div>

        {/* Main Chart: Energy Yield Over Time */}
        <div className="bg-[#121214] rounded-xl border border-zinc-800/50 p-5 min-h-[350px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-medium tracking-widest text-zinc-500 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              ENERGY YIELD (Wh)
            </span>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={chartStyles.gridStroke}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: chartStyles.textFill }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: chartStyles.textFill }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#27272a", opacity: 0.4 }}
                  contentStyle={chartStyles.tooltipContent}
                />
                <Bar dataKey="yield" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row: V/I Correlation & Temperature Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Voltage vs Current */}
          <div className="bg-[#121214] rounded-xl border border-zinc-800/50 p-5 min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-medium tracking-widest text-zinc-500 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                DAYLIGHT V/I CORRELATION
              </span>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={hourlyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorVoltage"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorCurrent"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={chartStyles.gridStroke}
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12, fill: chartStyles.textFill }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: chartStyles.textFill }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: chartStyles.textFill }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={chartStyles.tooltipContent} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "12px",
                      color: chartStyles.textFill,
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="voltage"
                    name="Voltage (V)"
                    stroke="#fbbf24"
                    fillOpacity={1}
                    fill="url(#colorVoltage)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="current"
                    name="Current (A)"
                    stroke="#38bdf8"
                    fillOpacity={1}
                    fill="url(#colorCurrent)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Temperature Profile */}
          <div className="bg-[#121214] rounded-xl border border-zinc-800/50 p-5 min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-medium tracking-widest text-zinc-500 flex items-center gap-2">
                <Sun className="w-4 h-4 text-rose-400" />
                THERMAL PROFILE (°C)
              </span>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={hourlyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={chartStyles.gridStroke}
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12, fill: chartStyles.textFill }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={["dataMin - 5", "auto"]}
                    tick={{ fontSize: 12, fill: chartStyles.textFill }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={chartStyles.tooltipContent} />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    name="Panel Temp"
                    stroke="#fb7185"
                    strokeWidth={3}
                    dot={{ fill: "#09090b", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
