import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SensorReading {
  id: string;
  sensor_id: string;
  reading_type: string;
  value: number;
  unit: string;
  created_at: string;
  sensors?: {
    name: string;
    type: string;
    location: string;
  };
}

export function SensorReadings() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchReadings = async () => {
      const { data } = await supabase
        .from('sensor_readings')
        .select(`
          *,
          sensors (
            name,
            type,
            location
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) {
        setReadings(data as SensorReading[]);
      }
      setLoading(false);
    };

    fetchReadings();

    // Set up real-time subscription
    const channel = supabase
      .channel('sensor-readings-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sensor_readings'
      }, (payload) => {
        // Add new reading to the top of the list
        setReadings(prev => [payload.new as SensorReading, ...prev.slice(0, 9)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getValueTrend = (value: number, type: string) => {
    // Simple logic to determine if values are in normal range
    switch (type) {
      case 'temperature':
        return value > 30 ? 'high' : value < 15 ? 'low' : 'normal';
      case 'humidity':
        return value > 70 ? 'high' : value < 30 ? 'low' : 'normal';
      case 'water_level':
        return value > 4 ? 'high' : value < 1 ? 'low' : 'normal';
      case 'seismic_magnitude':
        return value > 0.3 ? 'high' : 'normal';
      case 'smoke_density':
        return value > 50 ? 'high' : 'normal';
      default:
        return 'normal';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'high': return <TrendingUp className="h-3 w-3 text-warning" />;
      case 'low': return <TrendingDown className="h-3 w-3 text-info" />;
      default: return <Activity className="h-3 w-3 text-success" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'high': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-info text-info-foreground';
      default: return 'bg-success text-success-foreground';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Latest Sensor Readings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading readings...</div>
        ) : readings.length === 0 ? (
          <div className="text-center text-muted-foreground">No readings available</div>
        ) : (
          readings.map((reading) => {
            const trend = getValueTrend(reading.value, reading.reading_type);
            const timeAgo = new Date(reading.created_at).toLocaleTimeString();
            
            return (
              <div
                key={reading.id}
                className="border border-border rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">
                      {reading.sensors?.name || 'Unknown Sensor'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {reading.sensors?.location}
                    </p>
                  </div>
                  <Badge className={getTrendColor(trend)} variant="outline">
                    {getTrendIcon(trend)}
                    {trend}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {reading.reading_type.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-lg font-bold">
                      {reading.value} {reading.unit}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {timeAgo}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}