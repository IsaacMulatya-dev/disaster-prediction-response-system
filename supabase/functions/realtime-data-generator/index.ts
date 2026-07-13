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
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate real-time alerts for Kenya
    const alerts = []
    const alertTypes = ['flood', 'wildfire', 'earthquake', 'hurricane', 'drought']
    const severities = ['low', 'medium', 'high', 'critical']
    const kenyanLocations = [
      { name: 'Nairobi County', coords: { lat: -1.2921, lng: 36.8219 } },
      { name: 'Mombasa County', coords: { lat: -4.0435, lng: 39.6682 } },
      { name: 'Kisumu County', coords: { lat: -0.0917, lng: 34.7680 } },
      { name: 'Nakuru County', coords: { lat: -0.3031, lng: 36.0800 } },
      { name: 'Eldoret, Uasin Gishu', coords: { lat: 0.5143, lng: 35.2697 } },
      { name: 'Meru County', coords: { lat: 0.0500, lng: 37.6500 } },
      { name: 'Kisii County', coords: { lat: -0.6774, lng: 34.7680 } },
      { name: 'Kakamega County', coords: { lat: 0.2827, lng: 34.7519 } },
      { name: 'Garissa County', coords: { lat: -0.4536, lng: 39.6401 } },
      { name: 'Marsabit County', coords: { lat: 2.3370, lng: 37.9906 } },
      { name: 'Turkana County', coords: { lat: 3.1190, lng: 35.5966 } },
      { name: 'Mandera County', coords: { lat: 3.9366, lng: 41.8669 } }
    ]

    // Generate 2-5 random alerts
    const alertCount = Math.floor(Math.random() * 4) + 2
    for (let i = 0; i < alertCount; i++) {
      const location = kenyanLocations[Math.floor(Math.random() * kenyanLocations.length)]
      const type = alertTypes[Math.floor(Math.random() * alertTypes.length)]
      const severity = severities[Math.floor(Math.random() * severities.length)]
      
      alerts.push({
        type,
        severity,
        location: location.name,
        coordinates: location.coords,
        description: generateKenyanAlertDescription(type, severity),
        is_active: Math.random() > 0.2, // 80% chance active
        created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() // Within last 24h
      })
    }

    // Clear existing alerts and insert new ones
    await supabase.from('alerts').delete().gte('created_at', '1900-01-01')
    if (alerts.length > 0) {
      await supabase.from('alerts').insert(alerts)
    }

    // Generate real-time predictions for Kenya
    const predictions = []
    const predictionTypes = ['flood', 'wildfire', 'earthquake', 'drought', 'locust_swarm']
    const riskLevels = ['low', 'medium', 'high']
    const timeframes = ['6 hours', '24 hours', '48 hours', '1 week']

    for (let i = 0; i < 5; i++) {
      const location = kenyanLocations[Math.floor(Math.random() * kenyanLocations.length)]
      const type = predictionTypes[Math.floor(Math.random() * predictionTypes.length)]
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)]
      
      predictions.push({
        type,
        risk_level: riskLevel,
        location: location.name,
        coordinates: location.coords,
        confidence: Math.random() * 40 + 60, // 60-100% confidence
        timeframe: timeframes[Math.floor(Math.random() * timeframes.length)],
        created_at: new Date().toISOString()
      })
    }

    // Clear existing predictions and insert new ones
    await supabase.from('predictions').delete().gte('created_at', '1900-01-01')
    if (predictions.length > 0) {
      await supabase.from('predictions').insert(predictions)
    }

    // Generate real-time risk zones for Kenya
    const riskZones = []
    const zoneTypes = ['flood_zone', 'drought_zone', 'seismic_zone', 'wildfire_zone', 'locust_zone']
    const zoneRiskLevels = ['low', 'medium', 'high', 'critical']

    for (let i = 0; i < 6; i++) {
      const location = kenyanLocations[Math.floor(Math.random() * kenyanLocations.length)]
      const type = zoneTypes[Math.floor(Math.random() * zoneTypes.length)]
      const riskLevel = zoneRiskLevels[Math.floor(Math.random() * zoneRiskLevels.length)]
      
      riskZones.push({
        name: `${location.name} ${type.replace('_', ' ').toUpperCase()}`,
        type,
        risk_level: riskLevel,
        coordinates: {
          lat: location.coords.lat + (Math.random() - 0.5) * 0.1,
          lng: location.coords.lng + (Math.random() - 0.5) * 0.1
        },
        is_active: Math.random() > 0.1, // 90% chance active
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }

    // Clear existing risk zones and insert new ones
    await supabase.from('risk_zones').delete().gte('created_at', '1900-01-01')
    if (riskZones.length > 0) {
      await supabase.from('risk_zones').insert(riskZones)
    }

    return new Response(
      JSON.stringify({ 
        message: 'Real-time data generated successfully',
        alertsGenerated: alerts.length,
        predictionsGenerated: predictions.length,
        riskZonesGenerated: riskZones.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Real-time data generation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function generateKenyanAlertDescription(type: string, severity: string): string {
  const descriptions = {
    flood: {
      low: 'Minor flooding reported in low-lying areas near Lake Victoria',
      medium: 'Moderate flooding affecting roads in Central Kenya',
      high: 'Severe flooding with widespread road closures in Coastal region',
      critical: 'Catastrophic flooding - immediate evacuation required in Tana River area'
    },
    wildfire: {
      low: 'Small bushfire detected in Aberdare ranges, containment in progress',
      medium: 'Active wildfire spreading in Mt. Kenya forests, evacuation warnings issued',
      high: 'Large wildfire out of control in Mau Forest, mandatory evacuations',
      critical: 'Extreme fire behavior in Northern Kenya - life-threatening conditions'
    },
    earthquake: {
      low: 'Minor seismic activity recorded in Rift Valley',
      medium: 'Moderate earthquake detected near Nakuru, assessing damage',
      high: 'Strong earthquake in Central Kenya - structural damage reported',
      critical: 'Major earthquake along East African Rift - widespread destruction likely'
    },
    hurricane: {
      low: 'Tropical cyclone conditions developing along Coast',
      medium: 'Cyclone approaching Kenyan coast - prepare for impact',
      high: 'Major cyclone making landfall in Mombasa region',
      critical: 'Catastrophic cyclone - extreme winds affecting entire Coast province'
    },
    drought: {
      low: 'Reduced rainfall reported in Northern counties',
      medium: 'Moderate drought conditions affecting pastoralist communities',
      high: 'Severe drought - livestock deaths reported in ASAL areas',
      critical: 'Extreme drought emergency - humanitarian crisis in Northern Kenya'
    }
  }
  
  return descriptions[type]?.[severity] || `${severity.toUpperCase()} ${type} event detected`
}