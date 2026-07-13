import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudRain, Sun, Wind, Thermometer } from 'lucide-react';

interface WeatherData {
  id: string;
  location: string;
  coordinates: { lat: number; lng: number };
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'windy';
  pressure: number;
  visibility: number;
}

const weatherConditionIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  windy: Wind,
};

const weatherConditionColors = {
  sunny: 'bg-yellow-500',
  cloudy: 'bg-gray-500',
  rainy: 'bg-blue-500',
  windy: 'bg-green-500',
};

export function WeatherMap() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [selectedWeather, setSelectedWeather] = useState<WeatherData | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Generate mock weather data for different Kenyan locations
    const mockWeatherData: WeatherData[] = [
      {
        id: '1',
        location: 'Nairobi',
        coordinates: { lat: -1.2921, lng: 36.8219 },
        temperature: 22,
        humidity: 65,
        windSpeed: 12,
        condition: 'cloudy',
        pressure: 1013,
        visibility: 10,
      },
      {
        id: '2',
        location: 'Mombasa',
        coordinates: { lat: -4.0435, lng: 39.6682 },
        temperature: 28,
        humidity: 78,
        windSpeed: 8,
        condition: 'sunny',
        pressure: 1015,
        visibility: 12,
      },
      {
        id: '3',
        location: 'Kisumu',
        coordinates: { lat: -0.0917, lng: 34.7680 },
        temperature: 24,
        humidity: 72,
        windSpeed: 15,
        condition: 'rainy',
        pressure: 1010,
        visibility: 8,
      },
      {
        id: '4',
        location: 'Nakuru',
        coordinates: { lat: -0.3031, lng: 36.0800 },
        temperature: 20,
        humidity: 60,
        windSpeed: 18,
        condition: 'windy',
        pressure: 1008,
        visibility: 15,
      },
      {
        id: '5',
        location: 'Eldoret',
        coordinates: { lat: 0.5143, lng: 35.2698 },
        temperature: 18,
        humidity: 55,
        windSpeed: 10,
        condition: 'cloudy',
        pressure: 1012,
        visibility: 9,
      },
      {
        id: '6',
        location: 'Garissa',
        coordinates: { lat: -0.4536, lng: 39.6401 },
        temperature: 32,
        humidity: 35,
        windSpeed: 22,
        condition: 'sunny',
        pressure: 1018,
        visibility: 20,
      },
    ];

    setWeatherData(mockWeatherData);
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize Mapbox map
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [36.8219, -1.2921], // Nairobi, Kenya
      zoom: 6
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Add weather markers
      weatherData.forEach((weather) => {
        const el = document.createElement('div');
        el.className = 'weather-marker';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        
        const IconComponent = weatherConditionIcons[weather.condition];
        const colorClass = weatherConditionColors[weather.condition];
        
        el.className = `weather-marker ${colorClass}`;
        el.innerHTML = `<div class="flex items-center justify-center w-full h-full text-white"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="${getIconPath(weather.condition)}"/></svg></div>`;
        
        el.addEventListener('click', () => {
          setSelectedWeather(weather);
        });

        new mapboxgl.Marker(el)
          .setLngLat([weather.coordinates.lng, weather.coordinates.lat])
          .addTo(map.current!);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [weatherData]);

  const getIconPath = (condition: string) => {
    const paths = {
      sunny: "M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 100 10 5 5 0 000-10z",
      cloudy: "M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z",
      rainy: "M16 13v8m-8-8v8m4-12v8M7 4v12m10-12v12",
      windy: "M17.5 19H9a7 7 0 11 6.71-9h1.79a4.5 4.5 0 010 9z"
    };
    return paths[condition as keyof typeof paths] || paths.sunny;
  };

  if (!mapLoaded && weatherData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather Patterns</CardTitle>
          <CardDescription>Loading weather map...</CardDescription>
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
          Weather Patterns Across Kenya
        </CardTitle>
        <CardDescription>Real-time weather conditions and patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 rounded-lg overflow-hidden">
          <div ref={mapContainer} className="w-full h-full rounded-lg" />
        </div>

        {selectedWeather && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <h3 className="font-semibold text-lg mb-2">{selectedWeather.location}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <strong>Temperature:</strong> {selectedWeather.temperature}°C
              </div>
              <div>
                <strong>Humidity:</strong> {selectedWeather.humidity}%
              </div>
              <div>
                <strong>Wind:</strong> {selectedWeather.windSpeed} km/h
              </div>
              <div>
                <strong>Pressure:</strong> {selectedWeather.pressure} hPa
              </div>
              <div>
                <strong>Visibility:</strong> {selectedWeather.visibility} km
              </div>
              <div className="col-span-2">
                <Badge variant="outline" className="capitalize">
                  {selectedWeather.condition}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-2">
          <h4 className="font-semibold">Current Weather Conditions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {weatherData.map((weather) => {
              const IconComponent = weatherConditionIcons[weather.condition];
              return (
                <div
                  key={weather.id}
                  className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => setSelectedWeather(weather)}
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-full ${weatherConditionColors[weather.condition]} text-white`}>
                      <IconComponent className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium">{weather.location}</span>
                  </div>
                  <span className="text-sm font-bold">{weather.temperature}°C</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}