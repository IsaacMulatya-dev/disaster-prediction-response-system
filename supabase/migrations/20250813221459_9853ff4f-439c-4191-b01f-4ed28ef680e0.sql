-- Create alerts table for disaster alerts
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('flood', 'wildfire', 'earthquake', 'hurricane', 'volcanic')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  coordinates JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sensors table for IoT sensor network
CREATE TABLE public.sensors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  coordinates JSONB,
  status TEXT NOT NULL CHECK (status IN ('online', 'offline', 'warning')) DEFAULT 'online',
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
  signal_strength INTEGER CHECK (signal_strength >= 0 AND signal_strength <= 100),
  last_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sensor_readings table for real-time sensor data
CREATE TABLE public.sensor_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id UUID NOT NULL REFERENCES public.sensors(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  unit TEXT,
  reading_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create predictions table for AI predictions
CREATE TABLE public.predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 100),
  timeframe TEXT NOT NULL,
  location TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  coordinates JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk_zones table for risk assessment map
CREATE TABLE public.risk_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  type TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_zones ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (disaster info should be publicly accessible)
CREATE POLICY "Public read access for alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Public read access for sensors" ON public.sensors FOR SELECT USING (true);
CREATE POLICY "Public read access for sensor_readings" ON public.sensor_readings FOR SELECT USING (true);
CREATE POLICY "Public read access for predictions" ON public.predictions FOR SELECT USING (true);
CREATE POLICY "Public read access for risk_zones" ON public.risk_zones FOR SELECT USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risk_zones_updated_at
  BEFORE UPDATE ON public.risk_zones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for all tables
ALTER TABLE public.alerts REPLICA IDENTITY FULL;
ALTER TABLE public.sensors REPLICA IDENTITY FULL;
ALTER TABLE public.sensor_readings REPLICA IDENTITY FULL;
ALTER TABLE public.predictions REPLICA IDENTITY FULL;
ALTER TABLE public.risk_zones REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.predictions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_zones;

-- Insert sample data
INSERT INTO public.sensors (name, type, location, coordinates, status, battery_level, signal_strength) VALUES
('Lake Victoria Water Level Sensor', 'Flood Monitoring', 'Kisumu Bay', '{"lat": -0.0917, "lng": 34.7680}', 'online', 87, 92),
('Seismic Monitoring Station', 'Earthquake Detection', 'Nairobi', '{"lat": -1.2921, "lng": 36.8219}', 'online', 94, 78),
('Weather Station Alpha', 'Meteorological', 'Mombasa', '{"lat": -4.0435, "lng": 39.6682}', 'warning', 23, 45),
('Fire Detection Sensor', 'Wildfire Monitoring', 'Mau Forest', '{"lat": -0.6015, "lng": 35.6070}', 'offline', 0, 0);

INSERT INTO public.alerts (type, severity, location, description, coordinates) VALUES
('flood', 'high', 'Kisumu, Kenya', 'Lake Victoria water levels rising rapidly. Flash flood warning issued for low-lying areas.', '{"lat": -0.0917, "lng": 34.7680}'),
('wildfire', 'medium', 'Mau Forest, Kenya', 'Elevated fire risk detected due to high temperatures and low humidity.', '{"lat": -0.6015, "lng": 35.6070}'),
('earthquake', 'low', 'Nairobi, Kenya', 'Magnitude 3.2 earthquake detected. No immediate threat to infrastructure.', '{"lat": -1.2921, "lng": 36.8219}');

INSERT INTO public.predictions (type, confidence, timeframe, location, risk_level, coordinates) VALUES
('Flood Probability', 78, 'Next 6 hours', 'Kisumu Bay Area', 'high', '{"lat": -0.0917, "lng": 34.7680}'),
('Wildfire Risk', 45, 'Next 24 hours', 'Mau Forest Region', 'medium', '{"lat": -0.6015, "lng": 35.6070}'),
('Seismic Activity', 23, 'Next 48 hours', 'Rift Valley', 'low', '{"lat": -1.2921, "lng": 36.8219}');

INSERT INTO public.risk_zones (name, risk_level, type, coordinates) VALUES
('Kisumu Flood Zone', 'high', 'Flood Risk', '{"lat": -0.0917, "lng": 34.7680}'),
('Mau Forest Fire Risk', 'medium', 'Wildfire Risk', '{"lat": -0.6015, "lng": 35.6070}'),
('Nairobi Seismic Zone', 'low', 'Earthquake Risk', '{"lat": -1.2921, "lng": 36.8219}');