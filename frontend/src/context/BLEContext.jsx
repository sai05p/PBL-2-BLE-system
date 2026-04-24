import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useBLE } from '../hooks/useBLE';

const BLEContext = createContext();

export const BLEProvider = ({ children }) => {
  const bleState = useBLE();
  const { sensorData, isConnected } = bleState;
  
  const [faultLogs, setFaultLogs] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]); // <-- NEW: Live Analytics Logger
  const lastFaultTimes = useRef({ temp: 0, shading: 0 });

  // --- ANALYTICS LOGGER ---
  // Records a new data point every 5 seconds for the charts
  useEffect(() => {
    if (!isConnected || (sensorData.V === 0 && sensorData.C === 0)) return;

    const interval = setInterval(() => {
      setSessionHistory(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          voltage: sensorData.V,
          current: sensorData.C,
          power: sensorData.P,
          temp: sensorData.T
        };
        // Keep the last 60 data points (5 minutes of live history) to prevent lag
        return [...prev, newPoint].slice(-60);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected, sensorData]);

  // --- FAULT WATCHDOG ---
  useEffect(() => {
    if (!isConnected) return;
    const now = Date.now();
    const COOLDOWN_MS = 60000;

    if (sensorData.T > 45.0 && (now - lastFaultTimes.current.temp > COOLDOWN_MS)) {
      const newFault = {
        id: `FLT-${Math.floor(Math.random() * 1000)}`,
        date: new Date().toLocaleString(),
        severity: "critical",
        type: "Thermal Overload",
        desc: `Cell temperature reached ${sensorData.T.toFixed(1)}°C, exceeding 45°C threshold.`,
        status: "pending",
      };
      setFaultLogs(prev => [newFault, ...prev]);
      lastFaultTimes.current.temp = now;
    }

    if (sensorData.V < 7.0 && sensorData.V > 1.0 && (now - lastFaultTimes.current.shading > COOLDOWN_MS)) {
      const newFault = {
        id: `FLT-${Math.floor(Math.random() * 1000)}`,
        date: new Date().toLocaleString(),
        severity: "warning",
        type: "Voltage Drop / Shading",
        desc: `Voltage dropped to ${sensorData.V.toFixed(2)}V. Potential physical obstruction.`,
        status: "pending",
      };
      setFaultLogs(prev => [newFault, ...prev]);
      lastFaultTimes.current.shading = now;
    }
  }, [sensorData, isConnected]);

  return (
    // Export sessionHistory to the rest of the app
    <BLEContext.Provider value={{ ...bleState, faultLogs, sessionHistory }}>
      {children}
    </BLEContext.Provider>
  );
};

export const useBLEContext = () => useContext(BLEContext);