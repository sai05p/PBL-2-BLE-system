import React, { useState } from 'react';
import { useBLEContext } from '../context/BLEContext'; 
import { Sun, Upload, Cpu, AlertTriangle, CheckCircle, ScanLine, AlertCircle, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import Topbar from "../components/TopBar";

export default function AiDetect() {
  const { sensorData, isConnected } = useBLEContext(); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // scanState: null | { healthy: bool, hotspot: bool, shading: bool }
  const [scanState, setScanState] = useState(null); 

  const handleSimulateScan = () => {
    setIsAnalyzing(true);
    setScanState(null);
    
    // Simulate Neural Net processing time
    setTimeout(() => {
      setIsAnalyzing(false);
      // LIVE PHYSICAL EVALUATION
      const hasHotspot = sensorData.T > 45;
      const hasShading = sensorData.V < 7 && sensorData.V > 1; // Assuming 9V panel
      
      setScanState({
        healthy: !hasHotspot && !hasShading,
        hotspot: hasHotspot,
        shading: hasShading
      });
    }, 3000);
  };

  const resetScanner = () => {
    setIsAnalyzing(false);
    setScanState(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 p-6 flex flex-col" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <Topbar 
        rightElement={
          <div className={`flex items-center gap-2 text-xs font-medium tracking-wider px-3 py-1.5 rounded border ${isConnected ? 'text-emerald-400 bg-emerald-400/5 border-emerald-400/20' : 'text-zinc-500 bg-zinc-800/50 border-zinc-700'}`}>
            <Cpu className="w-3.5 h-3.5" />
            MODEL: V2.1 {isConnected ? 'LINKED' : 'STANDBY'}
          </div>
        } 
      />

      <main className="flex-1 flex flex-col gap-6">
        {/* Top Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex items-center justify-between">
            <div>
              <span className="text-zinc-500 text-xs font-medium tracking-widest block mb-1">SYSTEM STATUS</span>
              <span className="text-lg font-semibold text-zinc-100">{isConnected ? 'Monitoring Active' : 'Waiting for telemetry'}</span>
            </div>
            <CheckCircle className={`w-8 h-8 ${isConnected ? 'text-emerald-400/80' : 'text-zinc-700'}`} />
          </div>
          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex items-center justify-between">
            <div>
              <span className="text-zinc-500 text-xs font-medium tracking-widest block mb-1">SCANS TODAY</span>
              <span className="text-lg font-semibold text-zinc-100">{scanState ? '1' : '0'}</span>
            </div>
            <ScanLine className="w-8 h-8 text-sky-400/80" />
          </div>
          <div className="bg-[#121214] rounded-xl p-5 border border-zinc-800/50 flex items-center justify-between">
            <div>
              <span className="text-zinc-500 text-xs font-medium tracking-widest block mb-1">PANEL TEMP</span>
              <span className="text-lg font-semibold text-amber-400">{sensorData?.T > 0 ? `${sensorData.T.toFixed(1)} °C` : '--'}</span>
            </div>
            <Sun className="w-8 h-8 text-amber-400/80" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Visual Inspector */}
          <div className="lg:col-span-2 bg-[#121214] rounded-xl border border-zinc-800/50 p-5 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-medium tracking-widest text-zinc-500 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-400" />
                VISUAL FAULT INSPECTOR
              </span>
              {scanState && (
                <button onClick={resetScanner} className="text-xs text-zinc-400 hover:text-white transition-colors">RESET SCANNER</button>
              )}
            </div>

            <div className="flex-1 w-full relative bg-[#09090b] rounded-lg border border-dashed border-zinc-800 flex items-center justify-center overflow-hidden">
              
              {!isAnalyzing && !scanState && (
                <div className="flex flex-col items-center gap-4 text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="text-zinc-200 font-medium mb-1">Upload Reference Image</h3>
                    <p className="text-xs text-zinc-500 max-w-sm">AI will cross-reference the image with your live hardware telemetry to accurately diagnose faults.</p>
                  </div>
                  <button onClick={handleSimulateScan} disabled={!isConnected} className="mt-4 px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded text-xs font-semibold tracking-wider transition-colors disabled:opacity-50">
                    {isConnected ? 'RUN AI DIAGNOSTIC' : 'CONNECT HARDWARE FIRST'}
                  </button>
                </div>
              )}

              {isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090b]">
                   <div className="w-3/4 h-3/4 max-w-md border border-zinc-800 rounded relative overflow-hidden flex items-center justify-center">
                     <ImageIcon className="w-12 h-12 text-zinc-700 opacity-50" />
                     <div className="absolute top-0 left-0 right-0 h-1 bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                   </div>
                   <div className="mt-6 flex items-center gap-3">
                     <Cpu className="w-5 h-5 text-sky-400 animate-pulse" />
                     <span className="text-sm text-zinc-400 tracking-widest animate-pulse">CORRELATING HARDWARE DATA...</span>
                   </div>
                </div>
              )}

              {scanState && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#09090b]">
                   <div className="w-full max-w-md aspect-video bg-zinc-800/20 rounded border border-zinc-800 relative flex items-center justify-center">
                      {scanState.healthy ? (
                         <ShieldCheck className="w-16 h-16 text-emerald-500/40" />
                      ) : (
                         <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-zinc-700 opacity-20" />
                      )}
                      
                      {scanState.shading && (
                        <div className="absolute top-[20%] left-[30%] w-[25%] h-[35%] border-2 border-amber-400 bg-amber-400/10">
                          <span className="absolute -top-6 left-0 bg-amber-400 text-zinc-900 text-[9px] font-bold px-1.5 py-0.5 whitespace-nowrap">SHADING DETECTED</span>
                        </div>
                      )}
                      {scanState.hotspot && (
                        <div className="absolute top-[60%] left-[70%] w-[15%] h-[20%] border-2 border-rose-400 bg-rose-400/10">
                          <span className="absolute -top-6 left-0 bg-rose-400 text-zinc-900 text-[9px] font-bold px-1.5 py-0.5 whitespace-nowrap">THERMAL STRESS</span>
                        </div>
                      )}
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Diagnostics Panel */}
          <div className="bg-[#121214] rounded-xl border border-zinc-800/50 p-5 flex flex-col">
            <h3 className="text-xs font-medium tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" /> AI DIAGNOSTIC REPORT
            </h3>

            {scanState ? (
              <div className="flex-1 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {scanState.healthy && (
                   <div className="bg-emerald-400/5 border border-emerald-400/20 rounded-lg p-4 flex flex-col items-center text-center">
                     <ShieldCheck className="w-10 h-10 text-emerald-400/80 mb-2" />
                     <h4 className="text-sm font-semibold text-emerald-400 mb-1">System Healthy</h4>
                     <p className="text-xs text-zinc-400">Live hardware telemetry indicates optimal physical operation. No structural or thermal anomalies detected.</p>
                   </div>
                )}

                {scanState.hotspot && (
                  <div className="bg-rose-400/5 border border-rose-400/20 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-semibold text-rose-400">Localized Hotspot</h4>
                      <span className="text-[10px] font-mono text-rose-400/60">CONF: 0.96</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                      Thermal anomaly confirmed. Live telemetry reads <span className="text-rose-400 font-bold">{sensorData.T.toFixed(1)}°C</span>, indicating severe diode stress.
                    </p>
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 border-t border-rose-400/10 pt-2">
                      Action: Immediate manual inspection required.
                    </div>
                  </div>
                )}

                {scanState.shading && (
                  <div className="bg-amber-400/5 border border-amber-400/20 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-semibold text-amber-400">Physical Obstruction</h4>
                      <span className="text-[10px] font-mono text-amber-400/60">CONF: 0.88</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                      Hardware reports abnormal voltage drop to <span className="text-amber-400 font-bold">{sensorData.V.toFixed(2)}V</span>. High probability of surface dust or shading.
                    </p>
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 border-t border-amber-400/10 pt-2">
                      Action: Clean panel surface.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <Cpu className="w-10 h-10 text-zinc-800 mb-3" />
                <p className="text-sm text-zinc-500">Run the scanner to generate a report based on live hardware data.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `@keyframes scan { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}} />
    </div>
  );
}