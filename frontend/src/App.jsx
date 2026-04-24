import React, { useState, useEffect } from 'react';
import { useBLE } from './hooks/useBLE';
import { Battery, Zap, Activity, Thermometer, Sun } from 'lucide-react';
import LiveChart from './components/LiveChart';
import DiagnosticAlerts from './components/DiagnosticAlerts';

function App() {
  const { connect, isConnected, sensorData } = useBLE();
  const [dataHistory, setDataHistory] = useState([]);

  useEffect(() => {
    if (sensorData.V > 0 || sensorData.C > 0) {
      setDataHistory(prev => {
        const newHistory = [...prev, { ...sensorData, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: "2-digit", second: "2-digit" }) }];
        return newHistory.slice(-20); 
      });
    }
  }, [sensorData]);

  return (
    // The outer container handles the dark background and baseline padding
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-4 md:p-6 selection:bg-emerald-500/30">
      
      {/* Removed all max-width and mx-auto constraints. It now spans 100% of the available width. */}
      <div className="w-full space-y-6">
        
        {/* Full-Width Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#1e293b] p-6 rounded-2xl border border-slate-800 shadow-sm w-full">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
              <Sun size={28} className="text-emerald-400" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Solar<span className="font-light text-slate-400">Monitor</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">Live Telemetry & Diagnostics</p>
            </div>
          </div>
          
          <button 
            onClick={connect}
            disabled={isConnected}
            className={`px-8 py-3.5 rounded-xl font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 ${
              isConnected 
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 cursor-default' 
                : 'bg-emerald-500 hover:bg-emerald-400 text-[#0f172a] shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95'
            }`}
          >
            {isConnected ? (
              <>
                <span className="relative flex h-3 w-3 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                System Connected
              </>
            ) : 'Connect Device'}
          </button>
        </header>

        {/* Full-Width Telemetry Grid */}
        <main className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
          <StatCard 
            title="Voltage" 
            value={sensorData.V.toFixed(2)} 
            unit="V" 
            icon={<Battery size={24} />} 
            color="text-blue-400"
            bg="bg-blue-400/10"
          />
          <StatCard 
            title="Current" 
            value={sensorData.C.toFixed(2)} 
            unit="A" 
            icon={<Activity size={24} />} 
            color="text-purple-400"
            bg="bg-purple-400/10"
          />
          <StatCard 
            title="Power Output" 
            value={sensorData.P.toFixed(2)} 
            unit="W" 
            icon={<Zap size={24} />} 
            color="text-emerald-400"
            bg="bg-emerald-400/10"
          />
          <StatCard 
            title="Temperature" 
            value={sensorData.T.toFixed(1)} 
            unit="°C" 
            icon={<Thermometer size={24} />} 
            color="text-orange-400"
            bg="bg-orange-400/10"
          />
        </main>

        {/* Chart & Diagnostics Section */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-6 w-full">
          
          {/* Output Trend */}
          <div className="xl:col-span-2 bg-[#1e293b] p-6 md:p-8 rounded-3xl border border-slate-800 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-base font-bold tracking-wider text-slate-300 uppercase">
                Efficiency Trend
              </h3>
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                Live Data
              </div>
            </div>
            <div className="h-80 w-full rounded-xl overflow-hidden flex-1">
               <LiveChart data={dataHistory} />
            </div>
          </div>
          
          {/* Diagnostics */}
          <div className="bg-[#1e293b] p-6 md:p-8 rounded-3xl border border-slate-800 shadow-sm flex flex-col">
            <h3 className="text-base font-bold tracking-wider text-slate-300 uppercase mb-8">
              System Diagnostics
            </h3>
            <div className="flex-1 bg-[#0f172a] rounded-xl p-4 border border-slate-800/50 overflow-y-auto">
              <DiagnosticAlerts data={sensorData} />
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}

function StatCard({ title, value, unit, icon, color, bg }) {
  return (
    <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-600 transition-all duration-300 shadow-sm group w-full">
      <div className="flex items-center justify-between mb-8">
        <p className="text-base font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">{title}</p>
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <h2 className="text-5xl font-extrabold tracking-tight text-white">{value}</h2>
        <span className="text-xl font-medium text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

export default App;