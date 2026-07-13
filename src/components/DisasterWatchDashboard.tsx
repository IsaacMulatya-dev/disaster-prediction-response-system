import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuickActions } from '@/components/QuickActions';
import { SupabaseStatus } from '@/components/SupabaseStatus';
import { 
  MapPin, 
  AlertTriangle, 
  Users, 
  Settings, 
  FileText, 
  Car, 
  Bell, 
  Eye,
  Clock,
  TrendingUp,
  Menu,
  X,
  Activity
} from 'lucide-react';

interface CountyData {
  name: string;
  alertCount: number;
  population: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  coordinates: { lat: number; lng: number };
  lastUpdate: string;
}

interface AlertData {
  id: string;
  type: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  location: string;
  description: string;
  timestamp: string;
  status: 'active' | 'resolved';
  affectedPopulation: number;
}

interface TeamData {
  id: string;
  name: string;
  members: number;
  status: 'available' | 'deployed' | 'offline';
  location: string;
  lastUpdate: string;
  specialization: string;
}

// All 47 Kenya counties with real-time data
const ALL_COUNTIES: CountyData[] = [
  { name: 'Nairobi', alertCount: 3, population: 4.4, riskLevel: 'moderate', coordinates: { lat: -1.2921, lng: 36.8219 }, lastUpdate: '2 min ago' },
  { name: 'Mombasa', alertCount: 9, population: 1.2, riskLevel: 'high', coordinates: { lat: -4.0435, lng: 39.6682 }, lastUpdate: '1 min ago' },
  { name: 'Kisumu', alertCount: 0, population: 0.6, riskLevel: 'low', coordinates: { lat: -0.1022, lng: 34.7617 }, lastUpdate: '3 min ago' },
  { name: 'Nakuru', alertCount: 7, population: 0.8, riskLevel: 'moderate', coordinates: { lat: -0.3031, lng: 36.0800 }, lastUpdate: '2 min ago' },
  { name: 'Eldoret', alertCount: 8, population: 0.5, riskLevel: 'high', coordinates: { lat: 0.5204, lng: 35.2699 }, lastUpdate: '1 min ago' },
  { name: 'Kwale', alertCount: 2, population: 0.9, riskLevel: 'moderate', coordinates: { lat: -4.1737, lng: 39.4521 }, lastUpdate: '4 min ago' },
  { name: 'Kilifi', alertCount: 5, population: 1.1, riskLevel: 'high', coordinates: { lat: -3.5107, lng: 39.9093 }, lastUpdate: '2 min ago' },
  { name: 'Tana River', alertCount: 1, population: 0.3, riskLevel: 'low', coordinates: { lat: -1.5000, lng: 39.0000 }, lastUpdate: '5 min ago' },
  { name: 'Lamu', alertCount: 4, population: 0.2, riskLevel: 'moderate', coordinates: { lat: -2.2719, lng: 40.9020 }, lastUpdate: '3 min ago' },
  { name: 'Taita-Taveta', alertCount: 0, population: 0.3, riskLevel: 'low', coordinates: { lat: -3.4000, lng: 38.4000 }, lastUpdate: '6 min ago' },
  { name: 'Garissa', alertCount: 3, population: 0.8, riskLevel: 'moderate', coordinates: { lat: -0.4567, lng: 39.6583 }, lastUpdate: '2 min ago' },
  { name: 'Wajir', alertCount: 2, population: 0.7, riskLevel: 'moderate', coordinates: { lat: 1.7471, lng: 40.0573 }, lastUpdate: '4 min ago' },
  { name: 'Mandera', alertCount: 1, population: 0.9, riskLevel: 'low', coordinates: { lat: 3.9373, lng: 41.8569 }, lastUpdate: '5 min ago' },
  { name: 'Marsabit', alertCount: 0, population: 0.5, riskLevel: 'low', coordinates: { lat: 2.3346, lng: 37.9908 }, lastUpdate: '7 min ago' },
  { name: 'Isiolo', alertCount: 3, population: 0.3, riskLevel: 'moderate', coordinates: { lat: 0.3546, lng: 37.5833 }, lastUpdate: '3 min ago' },
  { name: 'Meru', alertCount: 2, population: 1.5, riskLevel: 'low', coordinates: { lat: 0.0500, lng: 37.6500 }, lastUpdate: '4 min ago' },
  { name: 'Tharaka-Nithi', alertCount: 1, population: 0.4, riskLevel: 'low', coordinates: { lat: -0.3000, lng: 37.8000 }, lastUpdate: '6 min ago' },
  { name: 'Embu', alertCount: 0, population: 0.6, riskLevel: 'low', coordinates: { lat: -0.5333, lng: 37.4500 }, lastUpdate: '8 min ago' },
  { name: 'Kitui', alertCount: 4, population: 1.1, riskLevel: 'moderate', coordinates: { lat: -1.3667, lng: 38.0167 }, lastUpdate: '2 min ago' },
  { name: 'Machakos', alertCount: 3, population: 1.4, riskLevel: 'moderate', coordinates: { lat: -1.5167, lng: 37.2667 }, lastUpdate: '3 min ago' },
  { name: 'Makueni', alertCount: 2, population: 0.9, riskLevel: 'low', coordinates: { lat: -2.2000, lng: 37.8000 }, lastUpdate: '5 min ago' },
  { name: 'Nyandarua', alertCount: 1, population: 0.6, riskLevel: 'low', coordinates: { lat: -0.5333, lng: 36.6000 }, lastUpdate: '7 min ago' },
  { name: 'Nyeri', alertCount: 0, population: 0.7, riskLevel: 'low', coordinates: { lat: -0.4167, lng: 36.9500 }, lastUpdate: '9 min ago' },
  { name: 'Kirinyaga', alertCount: 2, population: 0.6, riskLevel: 'low', coordinates: { lat: -0.5000, lng: 37.3833 }, lastUpdate: '4 min ago' },
  { name: 'Muranga', alertCount: 3, population: 1.0, riskLevel: 'moderate', coordinates: { lat: -0.7167, lng: 37.1500 }, lastUpdate: '3 min ago' },
  { name: 'Kiambu', alertCount: 5, population: 2.4, riskLevel: 'moderate', coordinates: { lat: -1.1833, lng: 36.8333 }, lastUpdate: '2 min ago' },
  { name: 'Turkana', alertCount: 6, population: 0.9, riskLevel: 'high', coordinates: { lat: 3.1167, lng: 35.6000 }, lastUpdate: '1 min ago' },
  { name: 'West Pokot', alertCount: 4, population: 0.6, riskLevel: 'moderate', coordinates: { lat: 1.2500, lng: 35.1167 }, lastUpdate: '3 min ago' },
  { name: 'Samburu', alertCount: 2, population: 0.3, riskLevel: 'low', coordinates: { lat: 1.2167, lng: 36.6833 }, lastUpdate: '5 min ago' },
  { name: 'Trans Nzoia', alertCount: 3, population: 0.9, riskLevel: 'moderate', coordinates: { lat: 1.1167, lng: 34.9500 }, lastUpdate: '4 min ago' },
  { name: 'Uasin Gishu', alertCount: 4, population: 1.0, riskLevel: 'moderate', coordinates: { lat: 0.5167, lng: 35.2833 }, lastUpdate: '2 min ago' },
  { name: 'Elgeyo-Marakwet', alertCount: 2, population: 0.5, riskLevel: 'low', coordinates: { lat: 0.8000, lng: 35.4667 }, lastUpdate: '6 min ago' },
  { name: 'Nandi', alertCount: 1, population: 0.8, riskLevel: 'low', coordinates: { lat: 0.1833, lng: 35.1167 }, lastUpdate: '8 min ago' },
  { name: 'Baringo', alertCount: 3, population: 0.7, riskLevel: 'moderate', coordinates: { lat: 0.4667, lng: 35.9833 }, lastUpdate: '3 min ago' },
  { name: 'Laikipia', alertCount: 2, population: 0.5, riskLevel: 'low', coordinates: { lat: 0.2000, lng: 36.8000 }, lastUpdate: '5 min ago' },
  { name: 'Narok', alertCount: 4, population: 1.1, riskLevel: 'moderate', coordinates: { lat: -1.0833, lng: 35.8667 }, lastUpdate: '2 min ago' },
  { name: 'Kajiado', alertCount: 3, population: 0.9, riskLevel: 'moderate', coordinates: { lat: -1.8500, lng: 36.7833 }, lastUpdate: '4 min ago' },
  { name: 'Kericho', alertCount: 2, population: 0.8, riskLevel: 'low', coordinates: { lat: -0.3667, lng: 35.2833 }, lastUpdate: '6 min ago' },
  { name: 'Bomet', alertCount: 1, population: 0.7, riskLevel: 'low', coordinates: { lat: -0.7833, lng: 35.3333 }, lastUpdate: '7 min ago' },
  { name: 'Kakamega', alertCount: 4, population: 1.9, riskLevel: 'moderate', coordinates: { lat: 0.2833, lng: 34.7500 }, lastUpdate: '3 min ago' },
  { name: 'Vihiga', alertCount: 2, population: 0.6, riskLevel: 'low', coordinates: { lat: 0.0833, lng: 34.7167 }, lastUpdate: '5 min ago' },
  { name: 'Bungoma', alertCount: 3, population: 1.7, riskLevel: 'moderate', coordinates: { lat: 0.5667, lng: 34.5667 }, lastUpdate: '4 min ago' },
  { name: 'Busia', alertCount: 1, population: 0.9, riskLevel: 'low', coordinates: { lat: 0.4667, lng: 34.1000 }, lastUpdate: '6 min ago' },
  { name: 'Siaya', alertCount: 2, population: 0.9, riskLevel: 'low', coordinates: { lat: 0.0667, lng: 34.2833 }, lastUpdate: '5 min ago' },
  { name: 'Homa Bay', alertCount: 3, population: 1.1, riskLevel: 'moderate', coordinates: { lat: -0.5167, lng: 34.4500 }, lastUpdate: '3 min ago' },
  { name: 'Migori', alertCount: 2, population: 0.9, riskLevel: 'low', coordinates: { lat: -1.0667, lng: 34.4667 }, lastUpdate: '5 min ago' },
  { name: 'Kisii', alertCount: 1, population: 1.3, riskLevel: 'low', coordinates: { lat: -0.6833, lng: 34.7667 }, lastUpdate: '7 min ago' },
  { name: 'Nyamira', alertCount: 0, population: 0.6, riskLevel: 'low', coordinates: { lat: -0.5667, lng: 34.9500 }, lastUpdate: '9 min ago' }
];

const HIGH_RISK_COUNTIES = ALL_COUNTIES.filter(county => 
  county.riskLevel === 'high' || county.riskLevel === 'critical'
);

const ALERTS_DATA: AlertData[] = [
  { id: '1', type: 'Flood', severity: 'high', location: 'Mombasa', description: 'Heavy rainfall causing flooding in coastal areas', timestamp: '2 min ago', status: 'active', affectedPopulation: 150000 },
  { id: '2', type: 'Fire', severity: 'moderate', location: 'Nakuru', description: 'Wildfire spreading in national park', timestamp: '15 min ago', status: 'active', affectedPopulation: 25000 },
  { id: '3', type: 'Storm', severity: 'critical', location: 'Eldoret', description: 'Severe thunderstorm with strong winds', timestamp: '1 hour ago', status: 'active', affectedPopulation: 80000 },
  { id: '4', type: 'Drought', severity: 'high', location: 'Turkana', description: 'Prolonged drought affecting livestock and agriculture', timestamp: '30 min ago', status: 'active', affectedPopulation: 120000 },
  { id: '5', type: 'Landslide', severity: 'moderate', location: 'Muranga', description: 'Heavy rains causing soil erosion and landslides', timestamp: '45 min ago', status: 'active', affectedPopulation: 35000 },
  { id: '6', type: 'Earthquake', severity: 'low', location: 'Nairobi', description: 'Minor seismic activity detected', timestamp: '2 hours ago', status: 'active', affectedPopulation: 50000 }
];

const TEAMS_DATA: TeamData[] = [
  { id: '1', name: 'Emergency Response Team A', members: 12, status: 'deployed', location: 'Mombasa', lastUpdate: '5 min ago', specialization: 'Flood Response' },
  { id: '2', name: 'Search & Rescue Team B', members: 8, status: 'available', location: 'Nairobi', lastUpdate: '10 min ago', specialization: 'Urban Search' },
  { id: '3', name: 'Medical Team C', members: 15, status: 'deployed', location: 'Eldoret', lastUpdate: '2 min ago', specialization: 'Emergency Medicine' },
  { id: '4', name: 'Firefighting Team D', members: 10, status: 'deployed', location: 'Nakuru', lastUpdate: '8 min ago', specialization: 'Wildfire Control' },
  { id: '5', name: 'Logistics Team E', members: 6, status: 'available', location: 'Nairobi', lastUpdate: '15 min ago', specialization: 'Supply Chain' }
];

export function EmergencyResponseDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      console.log('Updating real-time data...');
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Quick Actions functionality
  const handleEmergencyPlan = () => {
    console.log('Generating emergency response plan...');
    // TODO: API call to generate plan based on current alerts
  };

  const handleEvacuation = () => {
    console.log('Initiating evacuation procedures...');
    // TODO: API call to evacuation service
  };

  const handleAlertTeam = () => {
    console.log('Alerting emergency teams...');
    // TODO: API call to team notification service
  };

  const handleMonitor = () => {
    console.log('Starting enhanced monitoring...');
    // TODO: API call to monitoring service
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'deployed': return 'bg-blue-100 text-blue-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Real-time Metrics - Moved to top */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{ALERTS_DATA.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                <p className="text-2xl font-bold">Moderate</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Affected Population</p>
                <p className="text-2xl font-bold">2.9M</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p className="text-2xl font-bold">2 min ago</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCounties = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">All Counties</h2>
        <Badge variant="outline">47 Total</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_COUNTIES.map((county) => (
          <Card 
            key={county.name}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedCounty(county)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{county.name}</h3>
                <Badge className={getRiskColor(county.riskLevel)}>
                  {county.riskLevel}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  {county.alertCount} alerts
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  {county.population}M population
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {county.lastUpdate}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-6">
      {/* High Risk Counties Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">High Risk Counties</h2>
          <Badge variant="outline">{HIGH_RISK_COUNTIES.length} High Risk</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HIGH_RISK_COUNTIES.map((county) => (
            <Card 
              key={county.name}
              className="cursor-pointer hover:shadow-lg transition-shadow border-orange-200"
              onClick={() => setSelectedCounty(county)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{county.name}</h3>
                  <Badge className={getRiskColor(county.riskLevel)}>
                    {county.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{county.alertCount} Active Alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>{county.population}M Population</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span>Updated: {county.lastUpdate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Alerts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Active Alerts</h2>
          <Badge variant="outline">{ALERTS_DATA.length} Active</Badge>
        </div>
        <div className="space-y-3">
          {ALERTS_DATA.map((alert) => (
            <Card 
              key={alert.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedAlert(alert)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{alert.type}</h3>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{alert.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {alert.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    {alert.affectedPopulation.toLocaleString()} affected
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    {alert.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTeams = () => (
    <div className="space-y-6">
      {/* Quick Actions Section */}
      <QuickActions />
      
      {/* Emergency Teams Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Emergency Teams</h2>
          <Badge variant="outline">{TEAMS_DATA.length} Teams</Badge>
        </div>
        <div className="space-y-3">
          {TEAMS_DATA.map((team) => (
            <Card 
              key={team.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedTeam(team)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{team.name}</h3>
                  <Badge className={getStatusColor(team.status)}>
                    {team.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    {team.members} members
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {team.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3" />
                    {team.specialization}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Last update: {team.lastUpdate}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Settings</h2>
      
      {/* Supabase Status */}
      <div className="flex justify-center">
        <SupabaseStatus />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-alerts</span>
                <Badge variant="outline">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Real-time updates</span>
                <Badge variant="outline">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Emergency protocols</span>
                <Badge variant="outline">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email alerts</span>
                <Badge variant="outline">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SMS alerts</span>
                <Badge variant="outline">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Push notifications</span>
                <Badge variant="outline">Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCountyFocus = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">COUNTY FOCUS</h2>
        <Badge variant="outline">{HIGH_RISK_COUNTIES.length} High Risk</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {HIGH_RISK_COUNTIES.map((county) => (
          <Card 
            key={county.name}
            className="cursor-pointer hover:shadow-lg transition-shadow border-orange-200"
            onClick={() => setSelectedCounty(county)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{county.name}</h3>
                <Badge className={getRiskColor(county.riskLevel)}>
                  {county.riskLevel.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">{county.alertCount} Active Alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>{county.population}M Population</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>Updated: {county.lastUpdate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Toggle Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          size="icon"
          variant="outline"
          className="bg-background/80 backdrop-blur-sm"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 bg-card border-r min-h-screen p-4">
          <div className="flex items-center gap-2 mb-6">
            <div>
              <h1 className="text-xl font-bold">Emergency Response System</h1>
              <p className="text-xs text-muted-foreground">Disaster Management Dashboard</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('dashboard')}
            >
              <Activity className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'counties' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('counties')}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Counties
            </Button>
            <Button
              variant={activeTab === 'alerts' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('alerts')}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alerts
            </Button>
            <Button
              variant={activeTab === 'teams' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('teams')}
            >
              <Users className="h-4 w-4 mr-2" />
              Teams
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            
            <div className="pt-4 border-t">
              <Button
                variant={activeTab === 'county-focus' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('county-focus')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                COUNTY FOCUS
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 p-6 overflow-auto ${sidebarOpen ? 'ml-0' : ''}`}>
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'counties' && renderCounties()}
          {activeTab === 'alerts' && renderAlerts()}
          {activeTab === 'teams' && renderTeams()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'county-focus' && renderCountyFocus()}
        </div>
      </div>
    </div>
  );
}

export default EmergencyResponseDashboard;
