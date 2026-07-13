import { useEffect } from 'react';

export function useRealtimeDataSimulation() {
  useEffect(() => {
    // Start comprehensive real-time data simulation
    const startDataSimulation = async () => {
      try {
        // Generate real-time alerts, predictions, and risk zones
        const response = await fetch('https://xjxruzgcgqsuwciumckz.supabase.co/functions/v1/realtime-data-generator', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          console.error('Failed to generate real-time data:', response.statusText);
        }
      } catch (error) {
        console.error('Real-time data simulation error:', error);
      }
    };

    // Run simulation every 30 seconds for dynamic data
    const interval = setInterval(startDataSimulation, 30000);
    
    // Run immediately on mount
    startDataSimulation();

    return () => {
      clearInterval(interval);
    };
  }, []);
}