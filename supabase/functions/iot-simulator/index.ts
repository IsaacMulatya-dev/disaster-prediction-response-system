import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openWeatherApiKey = Deno.env.get('OPENWEATHERMAP_API_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get all sensors
    const { data: sensors, error: sensorsError } = await supabase
      .from('sensors')
      .select('*')

    if (sensorsError) {
      throw sensorsError
    }

    const updates = []
    const readings = []

    // Simulate real-time updates for each sensor
    for (const sensor of sensors) {
      // Simulate battery drain and signal fluctuation
      let newBatteryLevel = sensor.battery_level
      let newSignalStrength = sensor.signal_strength
      let newStatus = sensor.status

      // Battery slowly drains over time
      if (Math.random() < 0.3) {
        newBatteryLevel = Math.max(0, newBatteryLevel - Math.floor(Math.random() * 3))
      }

      // Signal strength fluctuates
      newSignalStrength = Math.max(0, Math.min(100, 
        newSignalStrength + (Math.random() - 0.5) * 20
      ))

      // Update status based on battery and signal
      if (newBatteryLevel === 0 || newSignalStrength < 10) {
        newStatus = 'offline'
      } else if (newBatteryLevel < 20 || newSignalStrength < 30) {
        newStatus = 'warning'
      } else {
        newStatus = 'online'
      }

      // Only update if values changed
      if (newBatteryLevel !== sensor.battery_level || 
          newSignalStrength !== sensor.signal_strength || 
          newStatus !== sensor.status) {
        
        updates.push({
          id: sensor.id,
          battery_level: Math.floor(newBatteryLevel),
          signal_strength: Math.floor(newSignalStrength),
          status: newStatus,
          last_update: new Date().toISOString()
        })
      }

      // Generate sensor readings based on type with real weather data integration
      let value = 0
      let unit = ''
      let readingType = ''

      // Get weather data for sensor location if coordinates available
      let weatherData = null
      if (sensor.coordinates && sensor.coordinates.lat && sensor.coordinates.lng) {
        try {
          const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${sensor.coordinates.lat}&lon=${sensor.coordinates.lng}&appid=${openWeatherApiKey}&units=metric`
          )
          if (weatherResponse.ok) {
            weatherData = await weatherResponse.json()
          }
        } catch (error) {
          console.log('Weather API error:', error)
        }
      }

      switch (sensor.type) {
        case 'Flood Monitoring':
          // Use real precipitation data if available
          value = weatherData?.rain?.['1h'] ? 
            2.5 + weatherData.rain['1h'] / 10 + Math.random() * 2 : 
            2.5 + Math.random() * 3
          unit = 'm'
          readingType = 'water_level'
          break
        case 'Earthquake Detection':
          value = Math.random() * 0.5 // Seismic activity (typically low)
          unit = 'magnitude'
          readingType = 'seismic_magnitude'
          break
        case 'Meteorological':
          const readingTypes = ['temperature', 'humidity', 'pressure', 'wind_speed']
          readingType = readingTypes[Math.floor(Math.random() * readingTypes.length)]
          switch (readingType) {
            case 'temperature':
              value = weatherData?.main?.temp ?? (20 + Math.random() * 15)
              unit = '°C'
              break
            case 'humidity':
              value = weatherData?.main?.humidity ?? (40 + Math.random() * 40)
              unit = '%'
              break
            case 'pressure':
              value = weatherData?.main?.pressure ?? (1010 + Math.random() * 20)
              unit = 'hPa'
              break
            case 'wind_speed':
              value = weatherData?.wind?.speed ?? (Math.random() * 15)
              unit = 'm/s'
              break
          }
          break
        case 'Wildfire Monitoring':
          const fireReadings = ['temperature', 'smoke_density', 'co2_level']
          readingType = fireReadings[Math.floor(Math.random() * fireReadings.length)]
          switch (readingType) {
            case 'temperature':
              value = weatherData?.main?.temp ? 
                weatherData.main.temp + Math.random() * 10 : 
                25 + Math.random() * 20
              unit = '°C'
              break
            case 'smoke_density':
              value = Math.random() * 100 // 0-100 particles/m³
              unit = 'particles/m³'
              break
            case 'co2_level':
              value = 400 + Math.random() * 200 // 400-600 ppm
              unit = 'ppm'
              break
          }
          break
      }

      // Only add readings for online sensors
      if (newStatus === 'online') {
        readings.push({
          sensor_id: sensor.id,
          reading_type: readingType,
          value: Math.round(value * 100) / 100, // Round to 2 decimal places
          unit: unit,
          created_at: new Date().toISOString()
        })
      }
    }

    // Update sensors if there are changes
    if (updates.length > 0) {
      for (const update of updates) {
        await supabase
          .from('sensors')
          .update(update)
          .eq('id', update.id)
      }
    }

    // Insert new sensor readings
    if (readings.length > 0) {
      await supabase
        .from('sensor_readings')
        .insert(readings)
    }

    return new Response(
      JSON.stringify({ 
        message: 'IoT simulation with weather data completed',
        sensorsUpdated: updates.length,
        readingsAdded: readings.length,
        weatherDataUsed: !!openWeatherApiKey
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('IoT Simulation Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})