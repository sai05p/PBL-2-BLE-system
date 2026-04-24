import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LiveChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
        Waiting for telemetry data...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 12, fill: '#94a3b8' }} 
          axisLine={false} 
          tickLine={false} 
          minTickGap={30}
        />
        <YAxis 
          tick={{ fontSize: 12, fill: '#94a3b8' }} 
          axisLine={false} 
          tickLine={false}
          domain={['auto', 'auto']}
        />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          labelStyle={{ color: '#64748b', marginBottom: '4px' }}
        />
        <Area 
          type="monotone" 
          dataKey="P" 
          stroke="#10b981" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorPower)" 
          isAnimationActive={false} // Disable animation for smoother live updates
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}