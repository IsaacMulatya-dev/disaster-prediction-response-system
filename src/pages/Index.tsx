import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import EmergencyResponseDashboard from "@/components/EmergencyResponseDashboard";
import EnvironmentalMonitoringAndRisk from "@/components/EnvironmentalMonitoringAndRisk";
import { useRealtimeDataSimulation } from "@/hooks/useRealtimeDataSimulation";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  
  // Start comprehensive real-time data simulation
  useRealtimeDataSimulation();

  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, loading });
    if (!loading && !isAuthenticated) {
      console.log('Redirecting to auth page');
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout, redirecting to auth');
        navigate('/auth');
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeout);
  }, [loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <DashboardHeader />
      
      <main className="space-y-8">
        <EmergencyResponseDashboard />
        <EnvironmentalMonitoringAndRisk />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
