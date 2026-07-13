import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Battery, Signal, MapPin, Calendar, Thermometer, Droplets, Wind } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from 'date-fns';

interface SensorDetailsDialogProps {
  sensorId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface SensorReading {
  id: string;
  reading_type: string;
  value: number;
  unit: string;
  created_at: string;
}

interface SensorDetails {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  battery_level: number;
  signal_strength: number;
  last_update: string;
  coordinates?: any;
  recent_readings: SensorReading[];
}

const statusColors = {
  online: 'bg-success text-success-foreground',
  offline: 'bg-destructive text-destructive-foreground',
  warning: 'bg-warning text-warning-foreground',
};

const readingIcons = {
  temperature: Thermometer,
  humidity: Droplets,
  wind_speed: Wind,
  pressure: Activity,
};

export function SensorDetailsDialog({ sensorId, isOpen, onClose }: SensorDetailsDialogProps) {
  const [sensorDetails, setSensorDetails] = useState<SensorDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sensorId && isOpen) {
      fetchSensorDetails();
    }
  }, [sensorId, isOpen]);

  const fetchSensorDetails = async () => {
    if (!sensorId) return;
    
    setLoading(true);
    try {
      // Fetch sensor details
      const { data: sensor, error: sensorError } = await supabase
        .from('sensors')
        .select('*')
        .eq('id', sensorId)
        .single();

      if (sensorError) throw sensorError;

      // Fetch recent readings
      const { data: readings, error: readingsError } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('sensor_id', sensorId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (readingsError) throw readingsError;

      setSensorDetails({
        ...sensor,
        coordinates: sensor.coordinates as { lat: number; lng: number } | undefined,
        recent_readings: readings || []
      });
    } catch (error) {
      console.error('Error fetching sensor details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Sensor Details
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">Loading sensor details...</div>
          </div>
        ) : sensorDetails ? (
          <div className="space-y-6">
            {/* Sensor Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{sensorDetails.name}</h3>
                    <p className="text-sm text-muted-foreground">{sensorDetails.type}</p>
                  </div>
                  <Badge className={statusColors[sensorDetails.status]} variant="outline">
                    {sensorDetails.status.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Location</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{sensorDetails.location}</p>
                    {sensorDetails.coordinates && (
                      <p className="text-xs text-muted-foreground">
                        {sensorDetails.coordinates.lat.toFixed(4)}, {sensorDetails.coordinates.lng.toFixed(4)}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Battery Level</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{sensorDetails.battery_level}%</span>
                      </div>
                      <Progress value={sensorDetails.battery_level} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Signal className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Signal Strength</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{sensorDetails.signal_strength}%</span>
                      </div>
                      <Progress value={sensorDetails.signal_strength} className="h-2" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Last update: {formatDistanceToNow(new Date(sensorDetails.last_update), { addSuffix: true })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Readings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Readings</CardTitle>
              </CardHeader>
              <CardContent>
                {sensorDetails.recent_readings.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    No recent readings available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sensorDetails.recent_readings.map((reading) => {
                      const IconComponent = readingIcons[reading.reading_type as keyof typeof readingIcons] || Activity;
                      return (
                        <div key={reading.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center gap-3">
                            <IconComponent className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium text-sm capitalize">{reading.reading_type.replace('_', ' ')}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(reading.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{reading.value} {reading.unit}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No sensor details available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}