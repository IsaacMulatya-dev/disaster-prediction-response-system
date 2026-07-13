import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuickActions } from '@/components/QuickActions';
import { useRealtimeCountyData } from '@/hooks/useRealtimeCountyData';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { useAuth } from '@/hooks/useAuth';
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
  Activity,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Trash2,
  Sun,
  Moon,
  LogOut,
  User,
  Mail,
  Phone,
  Shield,
  Volume2,
  VolumeX
} from 'lucide-react';
 

interface TeamData {
  id: string;
  name: string;
  members: number;
  status: 'available' | 'deployed' | 'offline';
  location: string;
  lastUpdate: string;
  specialization: string;
}

// Demo teams removed - only registered teams will be shown

export function EmergencyResponseDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCounty, setSelectedCounty] = useState<any>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTeamTab, setActiveTeamTab] = useState('register');
  const [selectedDeploymentCounty, setSelectedDeploymentCounty] = useState('');
  const [selectedDeploymentTeam, setSelectedDeploymentTeam] = useState('');
 
  const [registeredTeams, setRegisteredTeams] = useState<any[]>([]);
  const [deployedTeams, setDeployedTeams] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Use real-time data hooks
  const { counties, highRiskCounties, countiesWithAlerts, isLoading: countiesLoading, lastUpdate: countyLastUpdate } = useRealtimeCountyData();
  const { alerts, activeAlerts, criticalAlerts, isLoading: alertsLoading, lastUpdate } = useRealtimeAlerts();
  
  // Get user data from auth context
  const { user, profile } = useAuth();

  // Real-time updates and notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      console.log('Updating real-time data...');
      
      // Check for critical alerts and send notifications
      if (notificationsEnabled && criticalAlerts.length > 0) {
        const latestCriticalAlert = criticalAlerts[0];
        if (Notification.permission === 'granted') {
          new Notification(`🚨 CRITICAL ALERT: ${latestCriticalAlert.type}`, {
            body: `${latestCriticalAlert.location} - ${latestCriticalAlert.description}`,
            icon: '/favicon.ico',
            tag: 'critical-alert',
            requireInteraction: true
          });
        }
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [notificationsEnabled, criticalAlerts]);

  // Load teams from localStorage on component mount
  useEffect(() => {
    const savedTeams = localStorage.getItem('registeredTeams');
    const savedDeployments = localStorage.getItem('deployedTeams');
    
    if (savedTeams) {
      setRegisteredTeams(JSON.parse(savedTeams));
    }
    if (savedDeployments) {
      setDeployedTeams(JSON.parse(savedDeployments));
    }
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedNotifications = localStorage.getItem('notificationsEnabled') !== 'false';
    const savedSound = localStorage.getItem('soundEnabled') !== 'false';
    const savedEmail = localStorage.getItem('emailAlerts') !== 'false';
    const savedSms = localStorage.getItem('smsAlerts') === 'true';
    const savedPush = localStorage.getItem('pushNotifications') !== 'false';

    setIsDarkMode(savedDarkMode);
    setNotificationsEnabled(savedNotifications);
    setSoundEnabled(savedSound);
    setEmailAlerts(savedEmail);
    setSmsAlerts(savedSms);
    setPushNotifications(savedPush);

    // Apply dark mode
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('soundEnabled', soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('emailAlerts', emailAlerts.toString());
  }, [emailAlerts]);

  useEffect(() => {
    localStorage.setItem('smsAlerts', smsAlerts.toString());
  }, [smsAlerts]);

  useEffect(() => {
    localStorage.setItem('pushNotifications', pushNotifications.toString());
  }, [pushNotifications]);

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

  // Team management functions
  const availableTeams = registeredTeams.filter(team => team.status === 'available' || team.status === 'Available');
  
  // Debug logging for teams
  console.log('Teams debug:', {
    registeredTeams: registeredTeams.map(t => ({ id: t.id, name: t.name, status: t.status })),
    availableTeams: availableTeams.map(t => ({ id: t.id, name: t.name, status: t.status }))
  });

  // Handle team registration
  const handleTeamRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const teamSizeValue = formData.get('teamSize') as string;
    const parsedSize = parseInt(teamSizeValue);
    
    // Validate team size
    if (isNaN(parsedSize) || parsedSize < 1) {
      alert('Please enter a valid team size (minimum 1 member)');
      setIsSubmitting(false);
      return;
    }
    
    const newTeam = {
      id: Date.now().toString(),
      name: formData.get('teamName') as string,
      county: formData.get('county') as string,
      officeNumber: formData.get('officeNumber') as string,
      specialization: formData.get('specialization') as string,
      leader: formData.get('teamLeader') as string,
      contact: formData.get('contactNumber') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      size: parsedSize,
      status: formData.get('availability') as string,
      location: formData.get('county') as string,
      equipment: formData.get('equipment') as string,
      notes: formData.get('notes') as string,
      createdAt: new Date().toISOString()
    };

    const updatedTeams = [...registeredTeams, newTeam];
    setRegisteredTeams(updatedTeams);
    localStorage.setItem('registeredTeams', JSON.stringify(updatedTeams));
    
    // Reset form
    e.currentTarget.reset();
    setIsSubmitting(false);
    
    // Show success message
    alert('Team registered successfully!');
  };

  // Handle team deployment
  const handleTeamDeployment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const teamId = formData.get('deploymentTeam') as string;
    
    // Debug logging
    console.log('Deployment form data:', {
      teamId,
      availableTeams: availableTeams.length,
      registeredTeams: registeredTeams.length
    });
    
    const selectedTeam = registeredTeams.find(team => team.id === teamId);
    
    if (!teamId || teamId === '') {
      alert('Please select a team to deploy');
      setIsSubmitting(false);
      return;
    }
    
    if (!selectedTeam) {
      alert(`Team with ID ${teamId} not found. Please refresh and try again.`);
      setIsSubmitting(false);
      return;
    }

    const deployment = {
      id: Date.now().toString(),
      teamId: teamId,
      teamName: selectedTeam.name,
      county: formData.get('deploymentCounty') as string,
      location: formData.get('deploymentLocation') as string,
      emergencyType: formData.get('emergencyType') as string,
      priority: formData.get('priority') as string,
      duration: formData.get('estimatedDuration') as string,
      instructions: formData.get('deploymentInstructions') as string,
      contactPerson: formData.get('contactPerson') as string,
      deployedAt: new Date().toISOString(),
      status: 'deployed'
    };

    // Update team status to deployed
    const updatedTeams = registeredTeams.map(team => 
      team.id === teamId ? { ...team, status: 'deployed' } : team
    );
    setRegisteredTeams(updatedTeams);
    localStorage.setItem('registeredTeams', JSON.stringify(updatedTeams));

    // Add to deployed teams
    const updatedDeployments = [...deployedTeams, deployment];
    setDeployedTeams(updatedDeployments);
    localStorage.setItem('deployedTeams', JSON.stringify(updatedDeployments));
    
    // Reset form
    e.currentTarget.reset();
    setSelectedDeploymentCounty('');
    setSelectedDeploymentTeam('');
    setIsSubmitting(false);
    
    // Show success message
    alert('Team deployed successfully!');
  };

  // Handle team recall
  const handleTeamRecall = (deploymentId: string) => {
    const deployment = deployedTeams.find(d => d.id === deploymentId);
    if (!deployment) return;

    // Update team status back to available
    const updatedTeams = registeredTeams.map(team => 
      team.id === deployment.teamId ? { ...team, status: 'available' } : team
    );
    setRegisteredTeams(updatedTeams);
    localStorage.setItem('registeredTeams', JSON.stringify(updatedTeams));

    // Remove from deployed teams
    const updatedDeployments = deployedTeams.filter(d => d.id !== deploymentId);
    setDeployedTeams(updatedDeployments);
    localStorage.setItem('deployedTeams', JSON.stringify(updatedDeployments));
    
    alert('Team recalled successfully!');
  };

  // Handle team deletion
  const handleTeamDelete = (teamId: string) => {
    const team = registeredTeams.find(t => t.id === teamId);
    if (!team) return;

    // Check if team is currently deployed
    const isDeployed = deployedTeams.some(d => d.teamId === teamId);
    if (isDeployed) {
      alert('Cannot delete a team that is currently deployed. Please recall the team first.');
      return;
    }

    // Confirm deletion
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${team.name}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmDelete) return;

    // Remove team from registered teams
    const updatedTeams = registeredTeams.filter(t => t.id !== teamId);
    setRegisteredTeams(updatedTeams);
    localStorage.setItem('registeredTeams', JSON.stringify(updatedTeams));
    
    alert('Team deleted successfully!');
  };

  // Settings functions
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Apply dark mode to document
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', (!isDarkMode).toString());
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      // Clear all data
      localStorage.clear();
      // Redirect to login or reload
      window.location.reload();
    }
  };

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    
    if (newValue) {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Show a test notification
          new Notification('Emergency Response System', {
            body: 'Real-time alerts are now enabled. You will receive emergency notifications.',
            icon: '/favicon.ico',
            tag: 'emergency-alerts'
          });
        }
      }
    }
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    
    if (newValue) {
      // Play a test sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBS13yO/eizEIHWq+8+OWT');
      audio.play().catch(() => {
        console.log('Audio playback failed - user may need to interact with page first');
      });
    }
  };

  const toggleEmailAlerts = () => {
    const newValue = !emailAlerts;
    setEmailAlerts(newValue);
    
    if (newValue) {
      // Simulate email alert configuration
      console.log('Email alerts enabled - configuring emergency notification emails');
      alert('Email alerts enabled! Emergency notifications will be sent to your registered email address.');
    }
  };

  const toggleSmsAlerts = () => {
    const newValue = !smsAlerts;
    setSmsAlerts(newValue);
    
    if (newValue) {
      // Simulate SMS alert configuration
      console.log('SMS alerts enabled - configuring emergency notification SMS');
      alert('SMS alerts enabled! Emergency notifications will be sent to your registered phone number.');
    }
  };

  const togglePushNotifications = async () => {
    const newValue = !pushNotifications;
    setPushNotifications(newValue);
    
    if (newValue) {
      // Request push notification permission
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'BEl62iUYgUivxIkv69yViEuiBIa40HI0pFfB7t1BQnFjXKOnVs3H5iYf1QBONVq5FDaGpfSJXW-mjE5MptF8GUk'
          });
          console.log('Push subscription successful:', subscription);
          alert('Push notifications enabled! You will receive real-time emergency alerts.');
        } catch (error) {
          console.error('Push subscription failed:', error);
          alert('Push notifications setup failed. Please check your browser settings.');
        }
      } else {
        alert('Push notifications not supported in this browser.');
      }
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'deployed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'training': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'maintenance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };


  const renderDashboard = () => {
    const totalAffectedPopulation = activeAlerts.reduce((sum, alert) => sum + alert.affectedPopulation, 0);
    const overallRiskLevel = highRiskCounties.length > 5 ? 'High' : 
                            highRiskCounties.length > 2 ? 'Moderate' : 'Low';
    
    return (
      <div className="space-y-6">
      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                  <p className="metric-label">Active Alerts</p>
                  <p className="metric-value">{activeAlerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                  <p className="metric-label">Risk Level</p>
                  <p className="metric-value">{overallRiskLevel}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                  <p className="metric-label">Affected Population</p>
                  <p className="metric-value">{(totalAffectedPopulation / 1000000).toFixed(1)}M</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                  <p className="metric-label">Last Updated</p>
                  <p className="metric-value">Live</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      
    </div>
  );
  };

  const renderCounties = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">All Counties (47 Total)</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">47 Counties</Badge>
          <Badge variant="outline" className="text-green-600">
            Last Update: {countyLastUpdate.toLocaleTimeString()}
          </Badge>
        </div>
      </div>
      {countiesLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Updating real-time county data...</span>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {counties.map((county) => (
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
                  {(county.population / 1000000).toFixed(1)}M population
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {county.lastUpdate}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-2 p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3" />
                    {county.temperature}°C
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    {county.humidity}%
                  </div>
                  <div className="flex items-center gap-1">
                    <CloudRain className="h-3 w-3" />
                    {county.rainfall}mm
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    {county.windSpeed}km/h
                  </div>
                </div>
                {county.disasterRisk && county.disasterRisk.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600">
                      Risks: {county.disasterRisk.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Real-Time Alerts</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{activeAlerts.length} Active</Badge>
          <Badge variant="outline" className="text-green-600">
            Last Update: {lastUpdate.toLocaleTimeString()}
          </Badge>
        </div>
      </div>
      {alertsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Updating real-time alerts...</span>
        </div>
      ) : (
      <div className="space-y-3">
          {activeAlerts.map((alert) => {
            // Find available teams for this county
            const availableTeamsForCounty = registeredTeams.filter(team => 
              team.county === alert.county && team.status === 'available'
            );
            
            return (
            <Card 
              key={alert.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedAlert(alert)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold capitalize">{alert.type}</h3>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <Badge variant="outline" className="text-blue-600">
                      {alert.source.replace('_', ' ')}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{alert.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {alert.county}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    {alert.affectedPopulation.toLocaleString()} affected
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3" />
                    {alert.confidence}% confidence
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {alert.priority} priority
                  </div>
                </div>
                {alert.weatherData && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-muted-foreground mb-2 p-2 bg-gray-50 rounded">
                    <div>🌡️ {alert.weatherData.temperature}°C</div>
                    <div>💧 {alert.weatherData.humidity}%</div>
                    <div>🌧️ {alert.weatherData.rainfall}mm</div>
                    <div>💨 {alert.weatherData.windSpeed}km/h</div>
                    <div>📊 {alert.weatherData.pressure}hPa</div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {alert.status}
                  </Badge>
                  {availableTeamsForCounty.length > 0 && (
                    <div className="text-xs text-green-600">
                      {availableTeamsForCounty.length} team(s) available for deployment
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )})}
      </div>
      )}
    </div>
  );

  const renderTeams = () => {

    return (
      <div className="space-y-6">
      <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Team Management</h2>
          <div className="flex gap-2">
            <Button
              variant={activeTeamTab === 'register' ? 'default' : 'outline'}
              onClick={() => setActiveTeamTab('register')}
            >
              Register Team
            </Button>
            <Button
              variant={activeTeamTab === 'deploy' ? 'default' : 'outline'}
              onClick={() => setActiveTeamTab('deploy')}
            >
              Deploy Team {deployedTeams.length > 0 && `(${deployedTeams.length})`}
            </Button>
            <Button
              variant={activeTeamTab === 'manage' ? 'default' : 'outline'}
              onClick={() => setActiveTeamTab('manage')}
            >
              Manage Teams {registeredTeams.length > 0 && `(${registeredTeams.length})`}
            </Button>
      </div>
        </div>

        {/* Team Registration Tab */}
        {activeTeamTab === 'register' && (
          <Card>
            <CardHeader>
              <CardTitle>Register Emergency Response Team</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleTeamRegistration}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="teamName" className="text-sm font-medium">
                      Team Name *
                    </label>
                  <input
                    id="teamName"
                    name="teamName"
                    type="text"
                    placeholder="e.g., Emergency Response Team Alpha"
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                    required
                  />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="county" className="text-sm font-medium">
                      County *
                    </label>
                    <select
                      id="county"
                      name="county"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                      required
                    >
                      <option value="">Select County</option>
                      {counties.map((county) => (
                        <option key={county.name} value={county.name}>
                          {county.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="officeNumber" className="text-sm font-medium">
                      Office Team Number *
                    </label>
                    <input
                      id="officeNumber"
                      name="officeNumber"
                      type="text"
                      placeholder="e.g., ERT-001"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="specialization" className="text-sm font-medium">
                      Specialization *
                    </label>
                    <select
                      id="specialization"
                      name="specialization"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                      required
                    >
                      <option value="">Select Specialization</option>
                      <option value="flood-response">Flood Response</option>
                      <option value="fire-rescue">Fire & Rescue</option>
                      <option value="medical-emergency">Medical Emergency</option>
                      <option value="search-rescue">Search & Rescue</option>
                      <option value="logistics">Logistics</option>
                      <option value="communications">Communications</option>
                      <option value="technical-rescue">Technical Rescue</option>
                      <option value="hazmat">Hazmat Response</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="teamLeader" className="text-sm font-medium">
                      Team Leader Name *
                    </label>
                    <input
                      id="teamLeader"
                      name="teamLeader"
                      type="text"
                      placeholder="Full name of team leader"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="contactNumber" className="text-sm font-medium">
                      Contact Number *
                    </label>
                    <input
                      id="contactNumber"
                      name="contactNumber"
                      type="tel"
                      placeholder="+254 700 000 000"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="text-sm font-medium">
                      Phone Number *
                    </label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="+254 700 000 000"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="teamSize" className="text-sm font-medium">
                    Team Size *
                  </label>
                  <input
                    id="teamSize"
                    name="teamSize"
                    type="number"
                    min="1"
                    max="50"
                    placeholder="Number of team members"
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="availability" className="text-sm font-medium">
                    Availability Status *
                  </label>
                  <select
                    id="availability"
                    name="availability"
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                    required
                  >
                    <option value="">Select Availability</option>
                    <option value="available">Available</option>
                    <option value="deployed">Currently Deployed</option>
                    <option value="training">In Training</option>
                    <option value="maintenance">Equipment Maintenance</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="equipment" className="text-sm font-medium">
                    Equipment & Resources
                  </label>
                  <textarea
                    id="equipment"
                    name="equipment"
                    rows={3}
                    placeholder="List available equipment and resources..."
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    placeholder="Any additional information about the team..."
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Register Team'}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={(e) => e.currentTarget.closest('form')?.reset()}>
                    Clear Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Team Deployment Tab */}
        {activeTeamTab === 'deploy' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Deploy Team to Emergency Location</CardTitle>
                {availableTeams.length === 0 && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                    ⚠️ No registered teams available for deployment. Please register teams first.
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleTeamDeployment}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="deploymentCounty" className="text-sm font-medium">
                        Target County *
                      </label>
                      <select
                        id="deploymentCounty"
                        name="deploymentCounty"
                        value={selectedDeploymentCounty}
                        onChange={(e) => setSelectedDeploymentCounty(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                        required
                      >
                        <option value="">Select County</option>
                        {counties.map((county) => (
                          <option key={county.name} value={county.name}>
                            {county.name} {county.alertCount > 0 && `(${county.alertCount} alerts)`}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="deploymentLocation" className="text-sm font-medium">
                        Specific Location *
                      </label>
                      <input
                        id="deploymentLocation"
                        name="deploymentLocation"
                        type="text"
                        placeholder="e.g., Central Business District, Mombasa"
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="deploymentTeam" className="text-sm font-medium">
                        Select Team *
                      </label>
                      <select
                        id="deploymentTeam"
                        name="deploymentTeam"
                        value={selectedDeploymentTeam}
                        onChange={(e) => setSelectedDeploymentTeam(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                        required
                      >
                        <option value="">Select Registered Team</option>
                        {availableTeams.length === 0 ? (
                          <option value="" disabled>No registered teams available</option>
                        ) : (
                          availableTeams.map((team) => (
                            <option key={team.id} value={team.id}>
                              {team.name} - {team.specialization} ({team.county}) - {team.size} members
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="emergencyType" className="text-sm font-medium">
                        Emergency Type *
                      </label>
                      <select
                        id="emergencyType"
                        name="emergencyType"
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                        required
                      >
                        <option value="">Select Emergency Type</option>
                        <option value="flood">Flood Emergency</option>
                        <option value="fire">Fire Emergency</option>
                        <option value="medical">Medical Emergency</option>
                        <option value="search-rescue">Search & Rescue</option>
                        <option value="evacuation">Evacuation</option>
                        <option value="logistics">Logistics Support</option>
                        <option value="communications">Communications</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="priority" className="text-sm font-medium">
                        Priority Level *
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                        required
                      >
                        <option value="">Select Priority</option>
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="estimatedDuration" className="text-sm font-medium">
                        Estimated Duration *
                      </label>
                      <select
                        id="estimatedDuration"
                        name="estimatedDuration"
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                        required
                      >
                        <option value="">Select Duration</option>
                        <option value="1-4 hours">1-4 hours</option>
                        <option value="4-8 hours">4-8 hours</option>
                        <option value="8-24 hours">8-24 hours</option>
                        <option value="1-3 days">1-3 days</option>
                        <option value="3-7 days">3-7 days</option>
                        <option value="1+ weeks">1+ weeks</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="deploymentInstructions" className="text-sm font-medium">
                      Deployment Instructions *
                    </label>
                    <textarea
                      id="deploymentInstructions"
                      name="deploymentInstructions"
                      rows={4}
                      placeholder="Provide specific instructions for the team deployment..."
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contactPerson" className="text-sm font-medium">
                      On-Site Contact Person
                    </label>
                    <input
                      id="contactPerson"
                      name="contactPerson"
                      type="text"
                      placeholder="Name and contact of person at deployment location"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? 'Deploying...' : 'Deploy Team'}
                    </Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={(e) => e.currentTarget.closest('form')?.reset()}>
                      Clear Form
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Current Deployments */}
            <Card>
              <CardHeader>
                <CardTitle>Current Deployments</CardTitle>
              </CardHeader>
              <CardContent>
                {deployedTeams.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No teams currently deployed</p>
                    <p className="text-sm">Deploy a team to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deployedTeams.map((deployment) => (
                      <div key={deployment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{deployment.teamName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {deployment.emergencyType} • {deployment.location}, {deployment.county}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Priority: {deployment.priority}</span>
                            <span>Duration: {deployment.duration}</span>
                            <span>Deployed: {new Date(deployment.deployedAt).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Deployed
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTeamRecall(deployment.id)}
                          >
                            Recall
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Team Management Tab */}
        {activeTeamTab === 'manage' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registered Teams ({registeredTeams.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {registeredTeams.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No teams registered yet</p>
                    <p className="text-sm">Register a team to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {registeredTeams.map((team) => (
                      <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{team.name}</h4>
                            <Badge className={getStatusColor(team.status)}>
                              {team.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">County:</span> {team.county}
                            </div>
                            <div>
                              <span className="font-medium">Specialization:</span> {team.specialization}
                            </div>
                            <div>
                              <span className="font-medium">Leader:</span> {team.leader}
                            </div>
                            <div>
                              <span className="font-medium">Size:</span> {team.size && !isNaN(team.size) ? team.size : 'Not specified'} members
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            <span className="font-medium">Office Number:</span> {team.officeNumber} • 
                            <span className="font-medium ml-2">Contact:</span> {team.contact} •
                            <span className="font-medium ml-2">Phone:</span> {team.phoneNumber} •
                            <span className="font-medium ml-2">Registered:</span> {new Date(team.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setActiveTeamTab('deploy');
                              setSelectedDeploymentTeam(team.id);
                            }}
                            disabled={team.status !== 'available'}
                          >
                            {team.status === 'available' ? 'Deploy' : 'Deployed'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleTeamDelete(team.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete team"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
  };


  const renderSettings = () => {
    // Use user data from component level
    const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Emergency Response User';
    const displayEmail = profile?.email || user?.email || 'admin@kenya-disaster.gov';
    const displayRole = profile?.role || 'Emergency Response Administrator';
    const lastLogin = user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : new Date().toLocaleString();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Settings</h2>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{displayName}</h3>
                  <p className="text-sm text-muted-foreground">{displayRole}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{displayEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">+254 700 000 000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{displayRole}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Last login: {lastLogin}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Dark Mode</h3>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <Button
              onClick={toggleDarkMode}
              variant={isDarkMode ? "default" : "outline"}
              size="sm"
            >
              {isDarkMode ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
              {isDarkMode ? 'Dark' : 'Light'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Emergency Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Real-time Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Receive emergency alerts and updates
                </p>
              </div>
              <Button
                onClick={toggleNotifications}
                variant={notificationsEnabled ? "default" : "outline"}
                size="sm"
              >
                {notificationsEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Sound Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Play sound for critical alerts
                </p>
              </div>
              <Button
                onClick={toggleSound}
                variant={soundEnabled ? "default" : "outline"}
                size="sm"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                {soundEnabled ? 'On' : 'Off'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Send emergency alerts via email
                </p>
              </div>
              <Button
                onClick={toggleEmailAlerts}
                variant={emailAlerts ? "default" : "outline"}
                size="sm"
              >
                {emailAlerts ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">SMS Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Send critical alerts via SMS
                </p>
              </div>
              <Button
                onClick={toggleSmsAlerts}
                variant={smsAlerts ? "default" : "outline"}
                size="sm"
              >
                {smsAlerts ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Browser push notifications for alerts
                </p>
              </div>
              <Button
                onClick={togglePushNotifications}
                variant={pushNotifications ? "default" : "outline"}
                size="sm"
              >
                {pushNotifications ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      </div>
    );
  };

  const renderHighRiskCounties = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">High Risk Counties</h2>
        <div className="flex items-center gap-2">
          <Badge variant="destructive">{highRiskCounties.length} High Risk</Badge>
          <Badge variant="outline" className="text-green-600">
            Last Update: {countyLastUpdate.toLocaleTimeString()}
          </Badge>
        </div>
      </div>
      
      {countiesLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Updating real-time high risk data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {highRiskCounties.map((county) => (
            <Card
              key={county.name}
              className="cursor-pointer hover:shadow-lg transition-shadow border-red-200 bg-red-50/50"
              onClick={() => setSelectedCounty(county)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-red-800">{county.name}</h3>
                  <Badge className="bg-red-100 text-red-800">
                    {county.riskLevel}
                  </Badge>
                </div>
                
                {/* Real-time Weather Data */}
                <div className="grid grid-cols-2 gap-2 mb-3 p-2 bg-white/50 rounded-md">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Thermometer className="h-3 w-3" />
                      Temp
                    </div>
                    <div className="font-semibold text-sm">{county.temperature}°C</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Droplets className="h-3 w-3" />
                      Rain
                    </div>
                    <div className="font-semibold text-sm">{county.rainfall}mm</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Wind className="h-3 w-3" />
                      Wind
                    </div>
                    <div className="font-semibold text-sm">{county.windSpeed}km/h</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <CloudRain className="h-3 w-3" />
                      Humidity
                    </div>
                    <div className="font-semibold text-sm">{county.humidity}%</div>
                  </div>
                </div>

                {/* Risk Information */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Population:</span>
                    <span className="font-medium">{(county.population / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Level:</span>
                    <span className="font-medium text-red-600">{county.riskLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Disaster Risks:</span>
                    <span className="font-medium text-red-600">{county.disasterRisk.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Update:</span>
                    <span className="font-medium">{county.lastUpdate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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
              <p className="text-xs text-muted-foreground sidebar-text">Disaster Management Dashboard</p>
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
                variant={activeTab === 'high-risk-counties' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('high-risk-counties')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                High Risk Counties
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
          {activeTab === 'high-risk-counties' && renderHighRiskCounties()}
        </div>
      </div>
    </div>
  );
}

export default EmergencyResponseDashboard;
