import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, MapPin, AlertTriangle, Activity, Users, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from 'date-fns';

interface AreasDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RiskZone {
  id: string;
  name: string;
  type: string;
  risk_level: string;
  coordinates: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AreaStats {
  total_zones: number;
  active_zones: number;
  risk_levels: Record<string, number>;
  types: Record<string, number>;
  sensors_deployed: number;
  population_covered: number;
}

const riskColors = {
  low: 'bg-success text-success-foreground',
  medium: 'bg-warning text-warning-foreground',
  high: 'bg-danger text-danger-foreground',
  critical: 'bg-danger text-danger-foreground animate-pulse',
};

export function AreasDetailsDialog({ isOpen, onClose }: AreasDetailsDialogProps) {
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [areaStats, setAreaStats] = useState<AreaStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAreasDetails();
    }
  }, [isOpen]);

  const fetchAreasDetails = async () => {
    setLoading(true);
    try {
      // Fetch all risk zones
      const { data: zones, error: zonesError } = await supabase
        .from('risk_zones')
        .select('*')
        .order('created_at', { ascending: false });

      if (zonesError) throw zonesError;

      // Fetch sensors count
      const { data: sensors, error: sensorsError } = await supabase
        .from('sensors')
        .select('id');

      if (sensorsError) throw sensorsError;

      setRiskZones((zones || []).map(zone => ({
        ...zone,
        coordinates: zone.coordinates as { lat: number; lng: number }
      })));

      // Calculate statistics
      const activeZones = zones?.filter(z => z.is_active) || [];
      const riskLevels = zones?.reduce((acc, zone) => {
        acc[zone.risk_level] = (acc[zone.risk_level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const types = zones?.reduce((acc, zone) => {
        acc[zone.type] = (acc[zone.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Estimate population coverage (mock calculation)
      const estimatedPopulation = activeZones.length * 50000; // 50k per active zone

      setAreaStats({
        total_zones: zones?.length || 0,
        active_zones: activeZones.length,
        risk_levels: riskLevels,
        types: types,
        sensors_deployed: sensors?.length || 0,
        population_covered: estimatedPopulation,
      });
    } catch (error) {
      console.error('Error fetching areas details:', error);
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
            <Shield className="h-5 w-5 text-primary" />
            Areas Monitored Details
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">Loading areas details...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Statistics */}
            {areaStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{areaStats.total_zones}</p>
                        <p className="text-sm text-muted-foreground">Total Zones</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-success" />
                      <div>
                        <p className="text-2xl font-bold">{areaStats.active_zones}</p>
                        <p className="text-sm text-muted-foreground">Active Zones</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-info" />
                      <div>
                        <p className="text-2xl font-bold">{areaStats.sensors_deployed}</p>
                        <p className="text-sm text-muted-foreground">Sensors Deployed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-warning" />
                      <div>
                        <p className="text-2xl font-bold">{(areaStats.population_covered / 1000000).toFixed(1)}M</p>
                        <p className="text-sm text-muted-foreground">People Protected</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Risk Level Distribution */}
            {areaStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Risk Level Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(areaStats.risk_levels).map(([level, count]) => (
                      <div key={level} className="text-center p-3 border border-border rounded-lg">
                        <Badge className={`${riskColors[level]} mb-2`} variant="outline">
                          {level.toUpperCase()}
                        </Badge>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-sm text-muted-foreground">zones</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Zone Types */}
            {areaStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Monitored Area Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(areaStats.types).map(([type, count]) => (
                      <div key={type} className="p-3 border border-border rounded-lg">
                        <p className="font-semibold capitalize">{type.replace('_', ' ')}</p>
                        <p className="text-2xl font-bold text-primary">{count}</p>
                        <p className="text-sm text-muted-foreground">zones</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Risk Zones List */}
            <Card>
              <CardHeader>
                <CardTitle>All Risk Zones</CardTitle>
              </CardHeader>
              <CardContent>
                {riskZones.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    No risk zones configured
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {riskZones.map((zone) => (
                      <div key={zone.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-primary mt-1" />
                          <div>
                            <h4 className="font-medium">{zone.name}</h4>
                            <p className="text-sm text-muted-foreground capitalize">{zone.type.replace('_', ' ')}</p>
                            <p className="text-xs text-muted-foreground">
                              {zone.coordinates.lat.toFixed(4)}, {zone.coordinates.lng.toFixed(4)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-xs text-muted-foreground">
                                Created {formatDistanceToNow(new Date(zone.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge className={riskColors[zone.risk_level]} variant="outline">
                            {zone.risk_level.toUpperCase()}
                          </Badge>
                          {zone.is_active ? (
                            <Badge variant="outline" className="text-success border-success">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}