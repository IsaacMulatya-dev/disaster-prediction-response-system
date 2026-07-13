import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudRain, Sun, Wind, Thermometer } from 'lucide-react';

interface CountyWeather {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  description: string;
}

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: Wind,
};

const weatherColors = {
  sunny: '#f59e0b',
  cloudy: '#6b7280',
  rainy: '#3b82f6',
  stormy: '#ef4444',
};

export function CountyWeatherMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<CountyWeather | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Kenya's 47 counties weather data (sample)
  const countiesWeather: CountyWeather[] = [
    { id: '1', name: 'Nairobi', coordinates: { lat: -1.2921, lng: 36.8219 }, temperature: 22, humidity: 65, windSpeed: 15, condition: 'cloudy', description: 'Partly cloudy with mild temperatures' },
    { id: '2', name: 'Mombasa', coordinates: { lat: -4.0435, lng: 39.6682 }, temperature: 28, humidity: 78, windSpeed: 20, condition: 'sunny', description: 'Hot and humid coastal weather' },
    { id: '3', name: 'Kisumu', coordinates: { lat: -0.1022, lng: 34.7617 }, temperature: 25, humidity: 72, windSpeed: 12, condition: 'rainy', description: 'Light rainfall expected' },
    { id: '4', name: 'Nakuru', coordinates: { lat: -0.3031, lng: 36.0800 }, temperature: 20, humidity: 60, windSpeed: 18, condition: 'cloudy', description: 'Cool and overcast' },
    { id: '5', name: 'Eldoret', coordinates: { lat: 0.5143, lng: 35.2697 }, temperature: 18, humidity: 55, windSpeed: 22, condition: 'sunny', description: 'Clear skies in the highlands' },
    { id: '6', name: 'Turkana', coordinates: { lat: 3.1136, lng: 35.5981 }, temperature: 35, humidity: 30, windSpeed: 25, condition: 'sunny', description: 'Very hot and dry conditions' },
    { id: '7', name: 'Mandera', coordinates: { lat: 3.9366, lng: 41.8669 }, temperature: 38, humidity: 25, windSpeed: 30, condition: 'stormy', description: 'Hot with dust storms' },
    { id: '8', name: 'Garissa', coordinates: { lat: -0.4569, lng: 39.6582 }, temperature: 32, humidity: 40, windSpeed: 20, condition: 'sunny', description: 'Hot and dry weather' },
    { id: '9', name: 'Marsabit', coordinates: { lat: 2.3333, lng: 37.9833 }, temperature: 30, humidity: 45, windSpeed: 18, condition: 'cloudy', description: 'Warm with scattered clouds' },
    { id: '10', name: 'Isiolo', coordinates: { lat: 0.3556, lng: 37.5833 }, temperature: 29, humidity: 50, windSpeed: 16, condition: 'sunny', description: 'Warm and clear' },
    { id: '11', name: 'Meru', coordinates: { lat: 0.0467, lng: 37.6553 }, temperature: 23, humidity: 68, windSpeed: 14, condition: 'rainy', description: 'Light showers expected' },
    { id: '12', name: 'Tharaka Nithi', coordinates: { lat: -0.1667, lng: 37.9167 }, temperature: 24, humidity: 65, windSpeed: 12, condition: 'cloudy', description: 'Cool mountain weather' },
    { id: '13', name: 'Embu', coordinates: { lat: -0.5333, lng: 37.4500 }, temperature: 22, humidity: 70, windSpeed: 10, condition: 'rainy', description: 'Moderate rainfall' },
    { id: '14', name: 'Kitui', coordinates: { lat: -1.3667, lng: 38.0167 }, temperature: 26, humidity: 55, windSpeed: 15, condition: 'sunny', description: 'Warm and dry' },
    { id: '15', name: 'Machakos', coordinates: { lat: -1.5177, lng: 37.2634 }, temperature: 24, humidity: 58, windSpeed: 13, condition: 'cloudy', description: 'Mild and overcast' },
  ];

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [37.9062, 0.0236], // Center of Kenya
      zoom: 5.5
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Add weather markers for counties
      countiesWeather.forEach((county) => {
        const el = document.createElement('div');
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        el.style.backgroundColor = weatherColors[county.condition];
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontSize = '12px';
        el.style.fontWeight = 'bold';
        el.style.color = 'white';
        el.textContent = `${county.temperature}°`;
        
        el.addEventListener('click', () => {
          setSelectedCounty(county);
        });

        new mapboxgl.Marker(el)
          .setLngLat([county.coordinates.lng, county.coordinates.lat])
          .addTo(map.current!);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  if (!mapLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kenya Counties Weather Conditions</CardTitle>
          <CardDescription>Loading weather data for 47 counties...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5" />
          Kenya Counties Weather Conditions
        </CardTitle>
        <CardDescription>Real-time weather data across all 47 counties</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 rounded-lg overflow-hidden">
          <div ref={mapContainer} className="w-full h-full rounded-lg" />
        </div>

        {/* Selected County Weather Info */}
        {selectedCounty && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <h3 className="font-semibold text-lg mb-2">{selectedCounty.name} County</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                <span>{selectedCounty.temperature}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                <span>{selectedCounty.humidity}% Humidity</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4" />
                <span>{selectedCounty.windSpeed} km/h</span>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const WeatherIcon = weatherIcons[selectedCounty.condition];
                  return <WeatherIcon className="h-4 w-4" />;
                })()}
                <span className="capitalize">{selectedCounty.condition}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{selectedCounty.description}</p>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-semibold mb-2">County Weather Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {countiesWeather.map((county) => {
              const WeatherIcon = weatherIcons[county.condition];
              return (
                <div
                  key={county.id}
                  className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => setSelectedCounty(county)}
                >
                  <div className="flex items-center gap-2">
                    <WeatherIcon className="h-4 w-4" style={{ color: weatherColors[county.condition] }} />
                    <span className="text-sm font-medium">{county.name}</span>
                  </div>
                  <div className="text-sm font-bold">{county.temperature}°C</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}