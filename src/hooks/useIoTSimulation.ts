import { useEffect } from 'react';

export function useIoTSimulation() {
  useEffect(() => {
    // Start IoT simulation on component mount
    const startSimulation = async () => {
      try {
        const response = await fetch('https://xjxruzgcgqsuwciumckz.supabase.co/functions/v1/iot-simulator', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          console.error('Failed to start IoT simulation:', response.statusText);
        }
      } catch (error) {
        console.error('IoT simulation error:', error);
      }
    };

    // Run simulation every 10 seconds
    const interval = setInterval(startSimulation, 10000);
    
    // Run immediately on mount
    startSimulation();

    return () => {
      clearInterval(interval);
    };
  }, []);
}