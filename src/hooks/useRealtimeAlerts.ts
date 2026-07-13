import { useState, useEffect, useCallback } from 'react';

export interface RealTimeAlert {
  id: string;
  type: 'flood' | 'fire' | 'storm' | 'drought' | 'landslide' | 'earthquake' | 'wildfire' | 'heatwave' | 'coldwave' | 'hailstorm' | 'duststorm' | 'tornado';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  location: string;
  county: string;
  description: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'investigating';
  affectedPopulation: number;
  coordinates: { lat: number; lng: number };
  estimatedDamage?: number;
  responseTeam?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: 'sensor' | 'satellite' | 'citizen' | 'official' | 'weather_station';
  confidence: number; // 0-100
  lastUpdated: string;
  weatherData?: {
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
    pressure: number;
  };
}

// Kenya counties with accurate coordinates
const KENYA_COUNTIES = [
  { name: 'Nairobi', lat: -1.2921, lng: 36.8219, population: 4400000 },
  { name: 'Mombasa', lat: -4.0435, lng: 39.6682, population: 1200000 },
  { name: 'Kisumu', lat: -0.1022, lng: 34.7617, population: 600000 },
  { name: 'Nakuru', lat: -0.3031, lng: 36.0800, population: 800000 },
  { name: 'Eldoret', lat: 0.5204, lng: 35.2699, population: 500000 },
  { name: 'Turkana', lat: 3.1167, lng: 35.6000, population: 900000 },
  { name: 'Garissa', lat: -0.4567, lng: 39.6583, population: 800000 },
  { name: 'Wajir', lat: 1.7471, lng: 40.0573, population: 700000 },
  { name: 'Mandera', lat: 3.9373, lng: 41.8569, population: 900000 },
  { name: 'Marsabit', lat: 2.3346, lng: 37.9908, population: 500000 }
];

// Generate realistic alert based on weather data and conditions
const generateAlertFromWeather = (county: any, weatherData: any): RealTimeAlert | null => {
  const { temperature, humidity, rainfall, windSpeed, pressure } = weatherData;
  
  // Determine alert type based on weather conditions
  let alertType: RealTimeAlert['type'] | null = null;
  let severity: RealTimeAlert['severity'] = 'low';
  let description = '';
  let affectedPopulation = 0;
  let confidence = 50;

  // Flood detection
  if (rainfall > 20) {
    alertType = 'flood';
    severity = rainfall > 50 ? 'critical' : rainfall > 30 ? 'high' : 'moderate';
    description = `Heavy rainfall of ${rainfall}mm causing flooding in ${county.name}`;
    affectedPopulation = Math.floor(county.population * (rainfall / 100));
    confidence = Math.min(95, 60 + rainfall);
  }
  // Fire risk detection
  else if (temperature > 35 && humidity < 30 && windSpeed > 10) {
    alertType = 'fire';
    severity = temperature > 40 ? 'critical' : 'high';
    description = `High fire risk due to extreme heat (${temperature}°C) and low humidity in ${county.name}`;
    affectedPopulation = Math.floor(county.population * 0.1);
    confidence = Math.min(90, 50 + (temperature - 35) * 2);
  }
  // Storm detection
  else if (windSpeed > 25) {
    alertType = 'storm';
    severity = windSpeed > 40 ? 'critical' : windSpeed > 30 ? 'high' : 'moderate';
    description = `Strong winds of ${windSpeed}km/h causing storm conditions in ${county.name}`;
    affectedPopulation = Math.floor(county.population * 0.2);
    confidence = Math.min(95, 70 + windSpeed);
  }
  // Drought detection
  else if (rainfall < 1 && temperature > 30 && humidity < 40) {
    alertType = 'drought';
    severity = temperature > 35 ? 'high' : 'moderate';
    description = `Drought conditions with no rainfall and high temperatures in ${county.name}`;
    affectedPopulation = Math.floor(county.population * 0.3);
    confidence = 80;
  }
  // Heatwave detection
  else if (temperature > 38) {
    alertType = 'heatwave';
    severity = temperature > 42 ? 'critical' : 'high';
    description = `Extreme heatwave with temperatures reaching ${temperature}°C in ${county.name}`;
    affectedPopulation = Math.floor(county.population * 0.4);
    confidence = Math.min(95, 60 + (temperature - 38) * 5);
  }

  if (!alertType) return null;

  const priority: RealTimeAlert['priority'] = 
    severity === 'critical' ? 'urgent' :
    severity === 'high' ? 'high' :
    severity === 'moderate' ? 'medium' : 'low';

  return {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: alertType,
    severity,
    location: county.name,
    county: county.name,
    description,
    timestamp: 'Just now',
    status: 'active',
    affectedPopulation,
    coordinates: { lat: county.lat, lng: county.lng },
    estimatedDamage: affectedPopulation * 1000,
    priority,
    source: 'weather_station',
    confidence,
    lastUpdated: new Date().toISOString(),
    weatherData: {
      temperature,
      humidity,
      rainfall,
      windSpeed,
      pressure
    }
  };
};

// Generate simulated weather data for testing
const generateSimulatedWeatherData = (county: any) => {
  const isCoastal = ['Mombasa', 'Kwale', 'Kilifi', 'Lamu'].includes(county.name);
  const isHighland = ['Nairobi', 'Nakuru', 'Eldoret', 'Nyeri'].includes(county.name);
  const isArid = ['Turkana', 'Garissa', 'Wajir', 'Mandera'].includes(county.name);

  let baseTemp = 25;
  let baseHumidity = 60;
  let baseRainfall = 5;
  let baseWindSpeed = 6;

  if (isCoastal) {
    baseTemp = 27 + Math.random() * 4;
    baseHumidity = 75 + Math.random() * 15;
    baseRainfall = 8 + Math.random() * 12;
    baseWindSpeed = 8 + Math.random() * 8;
  } else if (isHighland) {
    baseTemp = 16 + Math.random() * 8;
    baseHumidity = 65 + Math.random() * 20;
    baseRainfall = 6 + Math.random() * 10;
    baseWindSpeed = 4 + Math.random() * 6;
  } else if (isArid) {
    baseTemp = 28 + Math.random() * 8;
    baseHumidity = 25 + Math.random() * 25;
    baseRainfall = Math.random() * 3;
    baseWindSpeed = 6 + Math.random() * 8;
  }

  return {
    temperature: Math.round(baseTemp + (Math.random() - 0.5) * 4),
    humidity: Math.round(baseHumidity + (Math.random() - 0.5) * 20),
    rainfall: Math.round(Math.max(0, baseRainfall + (Math.random() - 0.5) * 6)),
    windSpeed: Math.round(baseWindSpeed + (Math.random() - 0.5) * 4),
    pressure: 1013 + Math.random() * 20
  };
};

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Update alerts with real-time data
  const updateAlerts = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const newAlerts: RealTimeAlert[] = [];
      
      // Check each county for potential alerts
      for (const county of KENYA_COUNTIES) {
        const weatherData = generateSimulatedWeatherData(county);
        const alert = generateAlertFromWeather(county, weatherData);
        
        if (alert) {
          newAlerts.push(alert);
        }
      }

      // Update existing alerts and add new ones
      setAlerts(prevAlerts => {
        // Resolve old alerts (10% chance per alert)
        const updatedAlerts = prevAlerts.map(alert => {
          if (alert.status === 'active' && Math.random() < 0.1) {
            return { ...alert, status: 'resolved' as const };
          }
          return alert;
        });

        // Add new alerts
        const combinedAlerts = [...updatedAlerts, ...newAlerts];

        // Remove duplicates and keep only last 50 alerts
        const uniqueAlerts = combinedAlerts.filter((alert, index, self) => 
          index === self.findIndex(a => a.id === alert.id)
        );

        return uniqueAlerts.slice(0, 50);
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error updating alerts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    updateAlerts();

    // Update every 30 seconds for real-time data
    const interval = setInterval(updateAlerts, 30000);

    return () => clearInterval(interval);
  }, [updateAlerts]);

  // Get alerts by severity
  const getAlertsBySeverity = (severity: string) => 
    alerts.filter(alert => alert.severity === severity);

  // Get active alerts
  const activeAlerts = alerts.filter(alert => alert.status === 'active');

  // Get critical alerts
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');

  // Get alerts by county
  const getAlertsByCounty = (county: string) =>
    alerts.filter(alert => alert.county === county);

  // Get alerts by type
  const getAlertsByType = (type: string) =>
    alerts.filter(alert => alert.type === type);

  return {
    alerts,
    activeAlerts,
    criticalAlerts,
    isLoading,
    lastUpdate,
    updateAlerts,
    getAlertsBySeverity,
    getAlertsByCounty,
    getAlertsByType
  };
}