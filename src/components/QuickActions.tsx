import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Car, 
  Bell, 
  Eye,
  AlertTriangle,
  Users,
  MapPin,
  Activity
} from 'lucide-react';

export function QuickActions() {
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

  const handleEmergencyResponse = () => {
    console.log('Activating emergency response protocols...');
    // TODO: API call to emergency response system
  };

  const handleResourceAllocation = () => {
    console.log('Allocating emergency resources...');
    // TODO: API call to resource management system
  };

  const handlePublicAlert = () => {
    console.log('Sending public safety alert...');
    // TODO: API call to public notification system
  };

  const handleSituationReport = () => {
    console.log('Generating situation report...');
    // TODO: API call to reporting system
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Emergency Response Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={handleEmergencyPlan}
            className="h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <FileText className="h-6 w-6" />
            <span className="text-sm">Emergency Plan</span>
          </Button>
          <Button 
            onClick={handleEvacuation}
            className="h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <Car className="h-6 w-6" />
            <span className="text-sm">Evacuation</span>
          </Button>
          <Button 
            onClick={handleAlertTeam}
            className="h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <Bell className="h-6 w-6" />
            <span className="text-sm">Alert Team</span>
          </Button>
          <Button 
            onClick={handleMonitor}
            className="h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <Eye className="h-6 w-6" />
            <span className="text-sm">Monitor</span>
          </Button>
          <Button 
            onClick={handleEmergencyResponse}
            className="h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <AlertTriangle className="h-6 w-6" />
            <span className="text-sm">Emergency Response</span>
          </Button>
          <Button 
            onClick={handleResourceAllocation}
            className="h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <Users className="h-6 w-6" />
            <span className="text-sm">Resources</span>
          </Button>
          <Button 
            onClick={handlePublicAlert}
            className="h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <MapPin className="h-6 w-6" />
            <span className="text-sm">Public Alert</span>
          </Button>
          <Button 
            onClick={handleSituationReport}
            className="h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <FileText className="h-6 w-6" />
            <span className="text-sm">Situation Report</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
