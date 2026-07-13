import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, Shield, MapPin } from 'lucide-react';
import { useRealtimeRiskZones } from '@/hooks/useRealtimeData';

const riskColors = {
  low: 'bg-success text-success-foreground',
  medium: 'bg-warning text-warning-foreground',
  high: 'bg-danger text-danger-foreground',
  critical: 'bg-danger text-danger-foreground animate-pulse',
};

interface AffectedArea {
  id: string;
  name: string;
  type: string;
  coordinates: { lat: number; lng: number }[];
  center: { lat: number; lng: number };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  affectedBy: string[];
  population: number;
  vulnerabilityFactors: string[];
}

export function RiskMap() {
  const { riskZones, loading } = useRealtimeRiskZones();
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [selectedArea, setSelectedArea] = useState<AffectedArea | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const affectedAreas: AffectedArea[] = [
    {
      id: '1',
      name: 'Kibera Slum Area',
      type: 'Flood Risk Zone',
      coordinates: [
        { lat: -1.3132, lng: 36.7856 },
        { lat: -1.3042, lng: 36.7856 },
        { lat: -1.3042, lng: 36.7956 },
        { lat: -1.3132, lng: 36.7956 },
      ],
      center: { lat: -1.3087, lng: 36.7906 },
      riskLevel: 'high',
      affectedBy: ['Heavy rainfall', 'Poor drainage', 'River overflow'],
      population: 185000,
      vulnerabilityFactors: ['High population density', 'Informal settlements', 'Limited infrastructure']
    },
    {
      id: '2',
      name: 'Mathare Valley',
      type: 'Landslide Risk Zone',
      coordinates: [
        { lat: -1.2620, lng: 36.8570 },
        { lat: -1.2520, lng: 36.8570 },
        { lat: -1.2520, lng: 36.8670 },
        { lat: -1.2620, lng: 36.8670 },
      ],
      center: { lat: -1.2570, lng: 36.8620 },
      riskLevel: 'critical',
      affectedBy: ['Steep terrain', 'Soil erosion', 'Heavy rainfall'],
      population: 98000,
      vulnerabilityFactors: ['Unstable soil', 'Steep slopes', 'Informal construction']
    },
    {
      id: '3',
      name: 'Eastlands Area',
      type: 'Drought Risk Zone',
      coordinates: [
        { lat: -1.2700, lng: 36.8900 },
        { lat: -1.2600, lng: 36.8900 },
        { lat: -1.2600, lng: 36.9000 },
        { lat: -1.2700, lng: 36.9000 },
      ],
      center: { lat: -1.2650, lng: 36.8950 },
      riskLevel: 'medium',
      affectedBy: ['Water scarcity', 'Failed rainfall', 'Infrastructure challenges'],
      population: 150000,
      vulnerabilityFactors: ['Limited water access', 'Economic constraints', 'Aging infrastructure']
    },
  ];

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize Mapbox map
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [36.8219, -1.2921], // Nairobi, Kenya
      zoom: 10
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Add risk zone markers
      riskZones.forEach((zone) => {
        const el = document.createElement('div');
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        
        const riskColor = zone.risk_level === 'high' ? '#ef4444' : 
                         zone.risk_level === 'medium' ? '#f59e0b' : '#10b981';
        el.style.backgroundColor = riskColor;
        
        el.addEventListener('click', () => {
          setSelectedZone(zone);
          setSelectedArea(null);
        });

        new mapboxgl.Marker(el)
          .setLngLat([zone.coordinates.lng, zone.coordinates.lat])
          .addTo(map.current!);
      });

      // Add affected area markers
      affectedAreas.forEach((area) => {
        const el = document.createElement('div');
        el.style.width = '25px';
        el.style.height = '25px';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';
        el.style.backgroundColor = '#8b5cf6';
        
        el.addEventListener('click', () => {
          setSelectedArea(area);
          setSelectedZone(null);
        });

        new mapboxgl.Marker(el)
          .setLngLat([area.center.lng, area.center.lat])
          .addTo(map.current!);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [riskZones]);

  if (loading || !mapLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Map</CardTitle>
          <CardDescription>Loading risk zones...</CardDescription>
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
          <AlertTriangle className="h-5 w-5" />
          Risk Assessment & Affected Areas Map
        </CardTitle>
        <CardDescription>Real-time risk zones and affected areas in Kenya</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 rounded-lg overflow-hidden">
          <div ref={mapContainer} className="w-full h-full rounded-lg" />
        </div>

        {/* Selected Zone Info */}
        {selectedZone && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <h3 className="font-semibold text-lg mb-2">{selectedZone.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge className={riskColors[selectedZone.risk_level]}>
                  {selectedZone.risk_level}
                </Badge>
                <span className="text-xs text-muted-foreground">Risk Level</span>
              </div>
              <div><strong>Type:</strong> {selectedZone.type}</div>
              <div><strong>Status:</strong> {selectedZone.is_active ? 'Active' : 'Inactive'}</div>
            </div>
          </div>
        )}

        {/* Selected Area Info */}
        {selectedArea && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <h3 className="font-semibold text-lg mb-2">{selectedArea.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge className={riskColors[selectedArea.riskLevel]}>
                  {selectedArea.riskLevel}
                </Badge>
                <span className="text-xs text-muted-foreground">Risk Level</span>
              </div>
              <div><strong>Type:</strong> {selectedArea.type}</div>
              <div><strong>Population:</strong> {selectedArea.population.toLocaleString()}</div>
              <div>
                <strong>Vulnerability Factors:</strong>
                <ul className="list-disc list-inside ml-2">
                  {selectedArea.vulnerabilityFactors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Active Risk Zones</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {riskZones.map((zone) => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => setSelectedZone(zone)}
                >
                  <div>
                    <span className="text-sm font-medium">{zone.name}</span>
                    <p className="text-xs text-muted-foreground">{zone.type}</p>
                  </div>
                  <Badge className={riskColors[zone.risk_level]} variant="outline">
                    {zone.risk_level}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Affected Areas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {affectedAreas.map((area) => (
                <div
                  key={area.id}
                  className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => setSelectedArea(area)}
                >
                  <div>
                    <span className="text-sm font-medium">{area.name}</span>
                    <p className="text-xs text-muted-foreground">{area.type}</p>
                    <p className="text-xs text-muted-foreground">{area.population.toLocaleString()} people</p>
                  </div>
                  <Badge className={riskColors[area.riskLevel]} variant="outline">
                    {area.riskLevel}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}