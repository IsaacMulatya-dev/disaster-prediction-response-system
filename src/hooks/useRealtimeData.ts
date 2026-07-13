import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Alert {
  id: string;
  type: 'flood' | 'wildfire' | 'earthquake' | 'hurricane' | 'volcanic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  coordinates?: { lat: number; lng: number };
  is_active: boolean;
  created_at: string;
}

export interface Sensor {
  id: string;
  name: string;
  type: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  status: 'online' | 'offline' | 'warning';
  battery_level: number;
  signal_strength: number;
  last_update: string;
}

export interface Prediction {
  id: string;
  type: string;
  confidence: number;
  timeframe: string;
  location: string;
  risk_level: 'low' | 'medium' | 'high';
  coordinates?: { lat: number; lng: number };
}

export interface RiskZone {
  id: string;
  name: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  coordinates: { lat: number; lng: number };
  is_active: boolean;
}

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (data) {
        const typedAlerts: Alert[] = data.map(item => ({
          ...item,
          type: item.type as Alert['type'],
          severity: item.severity as Alert['severity'],
          coordinates: item.coordinates as { lat: number; lng: number } | undefined
        }));
        setAlerts(typedAlerts);
      }
      setLoading(false);
    };

    fetchAlerts();

    // Set up real-time subscription
    const channel = supabase
      .channel('alerts-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'alerts'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAlerts(prev => [payload.new as Alert, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setAlerts(prev => prev.map(alert => 
            alert.id === payload.new.id ? payload.new as Alert : alert
          ));
        } else if (payload.eventType === 'DELETE') {
          setAlerts(prev => prev.filter(alert => alert.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { alerts, loading };
}

export function useRealtimeSensors() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchSensors = async () => {
      const { data } = await supabase
        .from('sensors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        const typedSensors: Sensor[] = data.map(item => ({
          ...item,
          status: item.status as Sensor['status'],
          coordinates: item.coordinates as { lat: number; lng: number } | undefined
        }));
        setSensors(typedSensors);
      }
      setLoading(false);
    };

    fetchSensors();

    // Set up real-time subscription
    const channel = supabase
      .channel('sensors-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sensors'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setSensors(prev => [payload.new as Sensor, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setSensors(prev => prev.map(sensor => 
            sensor.id === payload.new.id ? payload.new as Sensor : sensor
          ));
        } else if (payload.eventType === 'DELETE') {
          setSensors(prev => prev.filter(sensor => sensor.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { sensors, loading };
}

export function useRealtimePredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchPredictions = async () => {
      const { data } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        const typedPredictions: Prediction[] = data.map(item => ({
          ...item,
          risk_level: item.risk_level as Prediction['risk_level'],
          coordinates: item.coordinates as { lat: number; lng: number } | undefined
        }));
        setPredictions(typedPredictions);
      }
      setLoading(false);
    };

    fetchPredictions();

    // Set up real-time subscription
    const channel = supabase
      .channel('predictions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'predictions'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPredictions(prev => [payload.new as Prediction, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setPredictions(prev => prev.map(prediction => 
            prediction.id === payload.new.id ? payload.new as Prediction : prediction
          ));
        } else if (payload.eventType === 'DELETE') {
          setPredictions(prev => prev.filter(prediction => prediction.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { predictions, loading };
}

export function useRealtimeRiskZones() {
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchRiskZones = async () => {
      const { data } = await supabase
        .from('risk_zones')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (data) {
        const typedRiskZones: RiskZone[] = data.map(item => ({
          ...item,
          risk_level: item.risk_level as RiskZone['risk_level'],
          coordinates: item.coordinates as { lat: number; lng: number }
        }));
        setRiskZones(typedRiskZones);
      }
      setLoading(false);
    };

    fetchRiskZones();

    // Set up real-time subscription
    const channel = supabase
      .channel('risk-zones-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'risk_zones'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setRiskZones(prev => [payload.new as RiskZone, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setRiskZones(prev => prev.map(zone => 
            zone.id === payload.new.id ? payload.new as RiskZone : zone
          ));
        } else if (payload.eventType === 'DELETE') {
          setRiskZones(prev => prev.filter(zone => zone.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { riskZones, loading };
}