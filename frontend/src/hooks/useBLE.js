import { useState } from 'react';

export function useBLE() {
  const [sensorData, setSensorData] = useState({ V: 0, C: 0, P: 0, T: 0 });
  const [isConnected, setIsConnected] = useState(false);

  const SERVICE_UUID = '19b10000-e8f2-537e-4f6c-d104768a1214'; 
  const CHARACTERISTIC_UUID = '19b10001-e8f2-537e-4f6c-d104768a1214';

  const connect = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: "Nano33_Solar" }],
        optionalServices: [SERVICE_UUID]
      });

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(SERVICE_UUID);
      const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

      await characteristic.startNotifications();
      setIsConnected(true);

      characteristic.addEventListener('characteristicvaluechanged', handleNotifications);
      
      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
      });

    } catch (error) {
      console.error("Bluetooth connection failed:", error);
    }
  };

  const handleNotifications = (event) => {
    // Decode the binary data and strip any hidden line breaks or spaces
    const rawString = new TextDecoder('utf-8').decode(event.target.value).trim();
    
    // Safety check to ensure we received a valid string format
    if (!rawString.includes('V:')) return; 

    const parsedData = {};
    rawString.split(',').forEach(pair => {
      const [key, val] = pair.split(':');
      if (key && val !== undefined) {
        // parseFloat ignores non-numeric characters, protecting the state
        parsedData[key] = parseFloat(val); 
      }
    });

    // Force the React state to update with the new numbers
    setSensorData(prevData => ({ ...prevData, ...parsedData }));
  };

  return { connect, isConnected, sensorData };
}