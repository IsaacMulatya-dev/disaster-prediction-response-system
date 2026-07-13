-- Update existing sensors to use Kenyan locations
UPDATE sensors SET 
  name = CASE 
    WHEN id = '65541407-7fe5-40ad-806b-f9ef91a2730d' THEN 'Lake Victoria Water Level Monitor'
    WHEN id = '27016339-6c4b-46cc-b55c-fc40a3212071' THEN 'Nairobi Seismic Detection Station'
    WHEN id = '8362fa94-ec12-437b-9e91-8ba3d44cd6cc' THEN 'Mombasa Coast Weather Station'
    WHEN id = '5914266f-c6ec-40c3-9a3f-56713bfbecf7' THEN 'Mau Forest Fire Detection Sensor'
    ELSE name
  END,
  location = CASE 
    WHEN id = '65541407-7fe5-40ad-806b-f9ef91a2730d' THEN 'Kisumu Bay, Lake Victoria'
    WHEN id = '27016339-6c4b-46cc-b55c-fc40a3212071' THEN 'Nairobi CBD'
    WHEN id = '8362fa94-ec12-437b-9e91-8ba3d44cd6cc' THEN 'Mombasa Port'
    WHEN id = '5914266f-c6ec-40c3-9a3f-56713bfbecf7' THEN 'Mau Forest Complex'
    ELSE location
  END;

-- Insert additional Kenyan sensors
INSERT INTO sensors (name, type, location, coordinates, status, battery_level, signal_strength) VALUES
('Nakuru Weather Monitoring Station', 'Meteorological', 'Nakuru Town', '{"lat": -0.3031, "lng": 36.0800}', 'online', 95, 88),
('Eldoret Agricultural Sensor', 'Meteorological', 'Eldoret, Uasin Gishu', '{"lat": 0.5143, "lng": 35.2697}', 'online', 78, 92),
('Turkana Drought Monitor', 'Meteorological', 'Lodwar, Turkana', '{"lat": 3.1190, "lng": 35.5966}', 'warning', 34, 56),
('Garissa Flood Detection', 'Flood Monitoring', 'Garissa Town', '{"lat": -0.4536, "lng": 39.6401}', 'online', 82, 75),
('Mt. Kenya Forest Fire Sensor', 'Wildfire Monitoring', 'Mt. Kenya Forest', '{"lat": -0.1500, "lng": 37.3500}', 'online', 67, 81),
('Marsabit Earthquake Sensor', 'Earthquake Detection', 'Marsabit Town', '{"lat": 2.3370, "lng": 37.9906}', 'online', 91, 73);

-- Update existing alerts for Kenya
UPDATE alerts SET 
  location = CASE 
    WHEN id = 'ce9de3d4-be76-4afe-8265-bcc7aa41fbb9' THEN 'Kisumu County, Lake Victoria'
    WHEN id = '1fa8dcd4-c71d-44ba-89f8-b2a1b36338e6' THEN 'Mau Forest Complex, Nakuru County'
    WHEN id = '81904e18-ea67-481f-9dab-adf2451c750d' THEN 'Nairobi County, Central Kenya'
    ELSE location
  END,
  description = CASE 
    WHEN id = 'ce9de3d4-be76-4afe-8265-bcc7aa41fbb9' THEN 'Lake Victoria water levels rising rapidly due to heavy rains in catchment areas. Flash flood warning for low-lying settlements.'
    WHEN id = '1fa8dcd4-c71d-44ba-89f8-b2a1b36338e6' THEN 'Elevated fire risk in Mau Forest due to high temperatures and reduced humidity. Community fire prevention measures activated.'
    WHEN id = '81904e18-ea67-481f-9dab-adf2451c750d' THEN 'Magnitude 3.2 earthquake detected along East African Rift. No immediate threat to Nairobi infrastructure.'
    ELSE description
  END;

-- Update existing risk zones for Kenya  
UPDATE risk_zones SET 
  name = CASE 
    WHEN id = '079cf3c8-a7e0-4c0c-a453-d8f23718e493' THEN 'Kisumu Lake Victoria Flood Zone'
    WHEN id = 'fea9dad1-8c0d-47ee-b5ed-0529f6f37a4f' THEN 'Mau Forest Fire Risk Area'
    WHEN id = '09f72aad-4b56-471a-9393-1764bf7bcffa' THEN 'Nairobi Rift Valley Seismic Zone'
    ELSE name
  END,
  type = CASE 
    WHEN id = '079cf3c8-a7e0-4c0c-a453-d8f23718e493' THEN 'Lake Flood Risk'
    WHEN id = 'fea9dad1-8c0d-47ee-b5ed-0529f6f37a4f' THEN 'Forest Fire Risk'
    WHEN id = '09f72aad-4b56-471a-9393-1764bf7bcffa' THEN 'Seismic Activity Zone'
    ELSE type
  END;

-- Update existing predictions for Kenya
UPDATE predictions SET 
  location = CASE 
    WHEN id = 'bdbd3147-acc6-4de3-bffe-4245625e561a' THEN 'Kisumu Bay, Lake Victoria Basin'
    WHEN id = '425d2289-2db5-49c0-8b6f-35956863e33b' THEN 'Mau Forest Region, Central Highlands'
    WHEN id = '1842dea3-b980-427c-809e-405fe19dc801' THEN 'Central Rift Valley, Kenya'
    ELSE location
  END,
  type = CASE 
    WHEN id = 'bdbd3147-acc6-4de3-bffe-4245625e561a' THEN 'Lake Flood Probability'
    WHEN id = '425d2289-2db5-49c0-8b6f-35956863e33b' THEN 'Forest Fire Risk'
    WHEN id = '1842dea3-b980-427c-809e-405fe19dc801' THEN 'Rift Valley Seismic Activity'
    ELSE type
  END,
  timeframe = CASE 
    WHEN id = 'bdbd3147-acc6-4de3-bffe-4245625e561a' THEN 'Next 6 hours'
    WHEN id = '425d2289-2db5-49c0-8b6f-35956863e33b' THEN 'Next 24 hours' 
    WHEN id = '1842dea3-b980-427c-809e-405fe19dc801' THEN 'Next 48 hours'
    ELSE timeframe
  END;