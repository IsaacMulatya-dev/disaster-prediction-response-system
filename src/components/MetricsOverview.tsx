import { useState } from "react";
import { TrendingUp, TrendingDown, Activity, Shield, AlertTriangle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtimeSensors, useRealtimeAlerts, useRealtimeRiskZones } from "@/hooks/useRealtimeData";
import { AreasDetailsDialog } from "./AreasDetailsDialog";
import { SystemStatusDialog } from "./SystemStatusDialog";

interface Metric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color: string;
}

const metrics: Metric[] = [
  {
    title: 'Active Sensors',
    value: '847',
    change: '+12 today',
    trend: 'up',
    icon: Activity,
    color: 'text-primary',
  },
  {
    title: 'Areas Monitored',
    value: '23',
    change: 'No change',
    trend: 'stable',
    icon: Shield,
    color: 'text-success',
  },
  {
    title: 'Active Alerts',
    value: '3',
    change: '-2 from yesterday',
    trend: 'down',
    icon: AlertTriangle,
    color: 'text-warning',
  },
  {
    title: 'People Protected',
    value: '1.2M',
    change: '+50K this month',
    trend: 'up',
    icon: Users,
    color: 'text-info',
  },
];

export function MetricsOverview() {
  const { sensors } = useRealtimeSensors();
  const { alerts } = useRealtimeAlerts();
  const { riskZones } = useRealtimeRiskZones();
  const [areasDialogOpen, setAreasDialogOpen] = useState(false);
  const [systemDialogOpen, setSystemDialogOpen] = useState(false);
  
  const activeSensors = sensors.filter(s => s.status === 'online').length;
  const totalSensors = sensors.length;
  const activeAlerts = alerts.filter(a => a.is_active).length;
  const areasMonitored = riskZones.filter(z => z.is_active).length;
  
  const metrics: Metric[] = [
    {
      title: 'Active Sensors',
      value: `${activeSensors}/${totalSensors}`,
      change: `${totalSensors > 0 ? Math.round((activeSensors / totalSensors) * 100) : 0}% online`,
      trend: activeSensors > totalSensors * 0.8 ? 'up' : activeSensors > totalSensors * 0.5 ? 'stable' : 'down',
      icon: Activity,
      color: 'text-primary',
    },
    {
      title: 'Areas Monitored',
      value: areasMonitored.toString(),
      change: `${riskZones.length} total zones`,
      trend: 'stable',
      icon: Shield,
      color: 'text-success',
    },
    {
      title: 'Active Alerts',
      value: activeAlerts.toString(),
      change: activeAlerts > 0 ? 'Attention needed' : 'All clear',
      trend: activeAlerts > 0 ? 'up' : 'down',
      icon: AlertTriangle,
      color: activeAlerts > 0 ? 'text-warning' : 'text-success',
    },
    {
      title: 'System Status',
      value: activeSensors > 0 ? 'Online' : 'Offline',
      change: `${sensors.length} sensors deployed`,
      trend: activeSensors > 0 ? 'up' : 'down',
      icon: Users,
      color: activeSensors > 0 ? 'text-success' : 'text-danger',
    },
  ];

  const handleCardClick = (title: string) => {
    if (title === 'Areas Monitored') {
      setAreasDialogOpen(true);
    } else if (title === 'System Status') {
      setSystemDialogOpen(true);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Activity;
          const isClickable = metric.title === 'Areas Monitored' || metric.title === 'System Status';
          
          return (
            <Card 
              key={metric.title}
              className={isClickable ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}
              onClick={() => handleCardClick(metric.title)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendIcon className={`h-3 w-3 ${
                    metric.trend === 'up' ? 'text-success' : 
                    metric.trend === 'down' ? 'text-danger' : 
                    'text-muted-foreground'
                  }`} />
                  {metric.change}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <AreasDetailsDialog 
        isOpen={areasDialogOpen} 
        onClose={() => setAreasDialogOpen(false)} 
      />
      <SystemStatusDialog 
        isOpen={systemDialogOpen} 
        onClose={() => setSystemDialogOpen(false)} 
      />
    </>
  );
}