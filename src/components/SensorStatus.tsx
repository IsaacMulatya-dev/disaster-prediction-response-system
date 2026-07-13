import { useState } from "react";
import { Activity, Wifi, WifiOff, Battery, Signal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRealtimeSensors } from "@/hooks/useRealtimeData";
import { useIoTSimulation } from "@/hooks/useIoTSimulation";
import { formatDistanceToNow } from 'date-fns';
import { SensorDetailsDialog } from "./SensorDetailsDialog";

const statusColors = {
  online: 'bg-success text-success-foreground',
  offline: 'bg-destructive text-destructive-foreground',
  warning: 'bg-warning text-warning-foreground',
};

export function SensorStatus() {
  const { sensors, loading } = useRealtimeSensors();
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  // Start real-time IoT simulation
  useIoTSimulation();
  
  const onlineSensors = sensors.filter(s => s.status === 'online').length;
  const totalSensors = sensors.length;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            IoT Sensor Network
          </div>
          <Badge variant="outline" className="text-primary">
            {onlineSensors}/{totalSensors} Online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading sensors...</div>
        ) : sensors.length === 0 ? (
          <div className="text-center text-muted-foreground">No sensors found</div>
        ) : (
          sensors.map((sensor) => {
            const timeAgo = formatDistanceToNow(new Date(sensor.last_update), { addSuffix: true });
            return (
              <div
                key={sensor.id}
                className="border border-border rounded-lg p-4 space-y-3 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedSensorId(sensor.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{sensor.name}</h4>
                    <p className="text-xs text-muted-foreground">{sensor.type}</p>
                    <p className="text-xs text-muted-foreground">{sensor.location}</p>
                  </div>
                  <Badge className={statusColors[sensor.status]} variant="outline">
                    {sensor.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Battery className="h-3 w-3" />
                      <span>Battery: {sensor.battery_level}%</span>
                    </div>
                    <Progress value={sensor.battery_level} className="h-1" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      {sensor.status === 'offline' ? (
                        <WifiOff className="h-3 w-3" />
                      ) : (
                        <Signal className="h-3 w-3" />
                      )}
                      <span>Signal: {sensor.signal_strength}%</span>
                    </div>
                    <Progress value={sensor.signal_strength} className="h-1" />
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Last update: {timeAgo}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
      
      <SensorDetailsDialog
        sensorId={selectedSensorId}
        isOpen={!!selectedSensorId}
        onClose={() => setSelectedSensorId(null)}
      />
    </Card>
  );
}