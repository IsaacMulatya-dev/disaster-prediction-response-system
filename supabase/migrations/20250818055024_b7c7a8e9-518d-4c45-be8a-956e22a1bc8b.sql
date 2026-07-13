-- First check what constraint exists
SELECT constraint_name, check_clause FROM information_schema.check_constraints WHERE table_name = 'alerts';

-- Update the check constraint to allow more disaster types
ALTER TABLE public.alerts DROP CONSTRAINT IF EXISTS alerts_type_check;

-- Add new constraint with more disaster types including drought
ALTER TABLE public.alerts ADD CONSTRAINT alerts_type_check 
CHECK (type IN ('flood', 'wildfire', 'earthquake', 'hurricane', 'volcanic', 'drought', 'landslide', 'cyclone', 'tsunami'));

-- Update existing alerts with correct locations
UPDATE alerts SET 
  location = 'Nairobi County',
  description = 'Heavy rainfall expected with potential flooding in low-lying areas'
WHERE location LIKE '%Nairobi%';

UPDATE alerts SET 
  location = 'Mandera County',
  description = 'Drought conditions with water scarcity affecting pastoral communities'
WHERE location LIKE '%Mandera%';

-- Insert accurate weather alerts for Kenyan counties
INSERT INTO alerts (type, severity, location, description, coordinates) VALUES
('drought', 'high', 'Turkana County', 'Severe drought conditions affecting livestock and crops', '{"lat": 3.1136, "lng": 35.5981}'),
('flood', 'medium', 'Kisumu County', 'Rising water levels in Lake Victoria affecting shoreline communities', '{"lat": -0.1022, "lng": 34.7617}'),
('wildfire', 'low', 'Laikipia County', 'Controlled burns for wildlife management', '{"lat": 0.5143, "lng": 36.7814}'),
('earthquake', 'medium', 'Nakuru County', 'Seismic activity detected in the Rift Valley region', '{"lat": -0.3031, "lng": 36.0800}'),
('flood', 'high', 'Tana River County', 'River overflow due to upstream rains', '{"lat": -1.3733, "lng": 40.0347}');

-- Update sensors with accurate Kenyan locations
UPDATE sensors SET 
  location = 'Nairobi County - Industrial Area',
  coordinates = '{"lat": -1.3197, "lng": 36.8510}'
WHERE location LIKE '%Nairobi%';

-- Insert accurate sensor data for major Kenyan counties
INSERT INTO sensors (name, type, location, status, battery_level, signal_strength, coordinates) VALUES
('ENV-TUR-001', 'Environmental', 'Turkana County - Lodwar', 'online', 85, 72, '{"lat": 3.1136, "lng": 35.5981}'),
('FLOOD-KIS-001', 'Flood Detection', 'Kisumu County - Lakefront', 'online', 92, 88, '{"lat": -0.1022, "lng": 34.7617}'),
('SEIS-NAK-001', 'Seismic', 'Nakuru County - Rift Valley', 'online', 76, 65, '{"lat": -0.3031, "lng": 36.0800}'),
('WATER-TAN-001', 'Water Level', 'Tana River County - Garsen', 'warning', 45, 58, '{"lat": -2.2833, "lng": 40.1167}'),
('FIRE-LAI-001', 'Fire Detection', 'Laikipia County - Nanyuki', 'online', 88, 81, '{"lat": 0.0167, "lng": 37.0833}');

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('alert', 'warning', 'info', 'success')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  alert_threshold TEXT NOT NULL DEFAULT 'medium' CHECK (alert_threshold IN ('low', 'medium', 'high')),
  location_radius INTEGER NOT NULL DEFAULT 50,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_settings
CREATE POLICY "Users can view their own settings" 
ON public.user_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.user_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.user_settings 
FOR UPDATE 
USING (auth.uid() = user_id);