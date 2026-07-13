import { AlertTriangle, Droplets, Flame, Zap, Wind, Mountain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRealtimeAlerts } from "@/hooks/useRealtimeData";
import { formatDistanceToNow } from 'date-fns';

const alertIcons = {
  flood: Droplets,
  wildfire: Flame,
  earthquake: Zap,
  hurricane: Wind,
  volcanic: Mountain,
};

const alertColors = {
  flood: 'text-flood',
  wildfire: 'text-wildfire',
  earthquake: 'text-earthquake',
  hurricane: 'text-hurricane',
  volcanic: 'text-volcanic',
};

const severityColors = {
  low: 'bg-success text-success-foreground',
  medium: 'bg-warning text-warning-foreground',
  high: 'bg-danger text-danger-foreground',
  critical: 'bg-danger text-danger-foreground animate-pulse',
};

export function DisasterAlerts() {
  const { alerts, loading } = useRealtimeAlerts();
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Active Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center text-muted-foreground">No active alerts</div>
        ) : (
          alerts.map((alert) => {
            const Icon = alertIcons[alert.type];
            const timeAgo = formatDistanceToNow(new Date(alert.created_at), { addSuffix: true });
            return (
              <div
                key={alert.id}
                className="border border-border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${alertColors[alert.type]}`} />
                    <span className="font-medium capitalize">{alert.type}</span>
                    <Badge className={severityColors[alert.severity]} variant="outline">
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{timeAgo}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{alert.location}</p>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}