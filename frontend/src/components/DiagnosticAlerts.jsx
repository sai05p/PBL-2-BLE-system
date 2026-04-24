import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function DiagnosticAlerts({ data }) {
  const alerts = [];

  // Wait for the first real data packet before running diagnostics
  if (data.V === 0 && data.C === 0) {
     return (
       <div className="flex flex-col items-center justify-center h-48 bg-slate-50 rounded-xl border border-dashed border-slate-200">
         <Info className="text-slate-400 mb-2" size={24} />
         <p className="text-slate-500 text-sm">Awaiting telemetry for diagnostics...</p>
       </div>
     );
  }

  // --- FAULT DETECTION LOGIC ---
  
  // 1. Shading Check (Voltage drops significantly)
  if (data.V < 7.0) {
    alerts.push({
      id: 'shading',
      type: 'warning',
      message: 'Potential Shading Detected',
      detail: `Voltage dropped to ${data.V.toFixed(2)}V. Check for physical obstructions.`
    });
  }

  // 2. Dust/Debris Check (Current is low, but voltage is fine)
  if (data.C < 0.3 && data.V >= 7.0) {
    alerts.push({
      id: 'dust',
      type: 'warning',
      message: 'Dust/Debris Accumulation',
      detail: `Current is low (${data.C.toFixed(2)}A) despite healthy voltage. Panel may need cleaning.`
    });
  }

  // 3. Thermal Check (Temperature exceeds threshold)
  if (data.T > 45.0) {
    alerts.push({
      id: 'temp',
      type: 'danger',
      message: 'Thermal Overheating',
      detail: `Temperature is ${data.T.toFixed(1)}°C. Output efficiency may be degrading.`
    });
  }

  // --- UI RENDER LOGIC ---

  // If no thresholds are broken, everything is great
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-emerald-50 rounded-xl border border-emerald-100 transition-all">
         <CheckCircle className="text-emerald-500 mb-2" size={32} />
         <p className="text-emerald-800 font-bold">System Operating Optimally</p>
         <p className="text-emerald-600 text-sm mt-1">No electrical or thermal faults detected.</p>
      </div>
    );
  }

  // If alerts exist, map through them and display warnings
  return (
    <div className="space-y-3 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
      {alerts.map(alert => (
        <div key={alert.id} className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
          alert.type === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <AlertTriangle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-sm">{alert.message}</h4>
            <p className="text-xs mt-1 opacity-80">{alert.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}