import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, Database, Wifi, AlertTriangle, CheckCircle, Clock, Cpu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from 'date-fns';

interface SystemStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  response_time: number;
  data_quality: number;
  network_stability: number;
  alert_processing: number;
  last_maintenance: string;
  active_incidents: number;
  services: ServiceStatus[];
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  last_check: string;
  response_time: number;
}

const statusColors = {
  healthy: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  critical: 'bg-danger text-danger-foreground',
  online: 'bg-success text-success-foreground',
  offline: 'bg-destructive text-destructive-foreground',
  degraded: 'bg-warning text-warning-foreground',
};

export function SystemStatusDialog({ isOpen, onClose }: SystemStatusDialogProps) {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSystemStatus();
    }
  }, [isOpen]);

  const fetchSystemStatus = async () => {
    setLoading(true);
    try {
      // Fetch real data to determine system health
      const [sensorsResult, alertsResult, zonesResult] = await Promise.all([
        supabase.from('sensors').select('id, status, last_update'),
        supabase.from('alerts').select('id, is_active, created_at'),
        supabase.from('risk_zones').select('id, is_active')
      ]);

      const sensors = sensorsResult.data || [];
      const alerts = alertsResult.data || [];
      const zones = zonesResult.data || [];

      const onlineSensors = sensors.filter(s => s.status === 'online').length;
      const sensorUptime = sensors.length > 0 ? (onlineSensors / sensors.length) * 100 : 0;
      const activeAlerts = alerts.filter(a => a.is_active).length;
      const activeZones = zones.filter(z => z.is_active).length;

      // Calculate system health based on real data
      let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (sensorUptime < 50) overallStatus = 'critical';
      else if (sensorUptime < 80 || activeAlerts > 5) overallStatus = 'warning';

      // Mock additional system metrics
      const mockSystemHealth: SystemHealth = {
        overall_status: overallStatus,
        uptime: '99.8%',
        response_time: Math.random() * 100 + 50, // 50-150ms
        data_quality: Math.min(95 + Math.random() * 5, 100),
        network_stability: sensorUptime,
        alert_processing: 98.5,
        last_maintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        active_incidents: activeAlerts > 3 ? 1 : 0,
        services: [
          {
            name: 'IoT Sensor Network',
            status: sensorUptime > 80 ? 'online' : sensorUptime > 50 ? 'degraded' : 'offline',
            uptime: sensorUptime,
            last_check: new Date().toISOString(),
            response_time: Math.random() * 50 + 20
          },
          {
            name: 'Alert Processing',
            status: 'online',
            uptime: 99.9,
            last_check: new Date().toISOString(),
            response_time: Math.random() * 30 + 10
          },
          {
            name: 'Risk Assessment Engine',
            status: activeZones > 0 ? 'online' : 'degraded',
            uptime: activeZones > 0 ? 98.7 : 85.2,
            last_check: new Date().toISOString(),
            response_time: Math.random() * 200 + 100
          },
          {
            name: 'Weather Integration',
            status: 'online',
            uptime: 97.3,
            last_check: new Date().toISOString(),
            response_time: Math.random() * 500 + 200
          },
          {
            name: 'Data Storage',
            status: 'online',
            uptime: 99.99,
            last_check: new Date().toISOString(),
            response_time: Math.random() * 20 + 5
          }
        ]
      };

      setSystemHealth(mockSystemHealth);
    } catch (error) {
      console.error('Error fetching system status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            System Status & Health
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">Loading system status...</div>
          </div>
        ) : systemHealth ? (
          <div className="space-y-6">
            {/* Overall System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>System Overview</span>
                  <Badge className={statusColors[systemHealth.overall_status]} variant="outline">
                    {systemHealth.overall_status.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border border-border rounded-lg">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                    <p className="text-2xl font-bold">{systemHealth.uptime}</p>
                    <p className="text-sm text-muted-foreground">System Uptime</p>
                  </div>
                  
                  <div className="text-center p-4 border border-border rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-info" />
                    <p className="text-2xl font-bold">{systemHealth.response_time.toFixed(0)}ms</p>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  </div>
                  
                  <div className="text-center p-4 border border-border rounded-lg">
                    <Database className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{systemHealth.data_quality.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Data Quality</p>
                  </div>
                  
                  <div className="text-center p-4 border border-border rounded-lg">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-warning" />
                    <p className="text-2xl font-bold">{systemHealth.active_incidents}</p>
                    <p className="text-sm text-muted-foreground">Active Incidents</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Network Stability</span>
                    <span>{systemHealth.network_stability.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.network_stability} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Alert Processing</span>
                    <span>{systemHealth.alert_processing}%</span>
                  </div>
                  <Progress value={systemHealth.alert_processing} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Data Quality Score</span>
                    <span>{systemHealth.data_quality.toFixed(1)}%</span>
                  </div>
                  <Progress value={systemHealth.data_quality} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Service Status */}
            <Card>
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemHealth.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Server className="h-4 w-4 text-primary" />
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Last checked: {formatDistanceToNow(new Date(service.last_check), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{service.uptime.toFixed(1)}% uptime</p>
                          <p className="text-xs text-muted-foreground">{service.response_time.toFixed(0)}ms response</p>
                        </div>
                        <Badge className={statusColors[service.status]} variant="outline">
                          {service.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Info */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance & Operations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="h-4 w-4 text-primary" />
                      <span className="font-medium">Last Maintenance</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(systemHealth.last_maintenance), { addSuffix: true })}
                    </p>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wifi className="h-4 w-4 text-primary" />
                      <span className="font-medium">Next Scheduled Maintenance</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      In 23 days (Weekly maintenance window)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No system status available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}