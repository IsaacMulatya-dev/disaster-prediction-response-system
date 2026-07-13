import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { type, userId, title, message, notificationType = 'info' } = await req.json()

    if (type === 'create') {
      // Create new notification
      const { data, error } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: userId,
          title: title,
          message: message,
          type: notificationType,
          is_read: false
        })

      if (error) {
        console.error('Error creating notification:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Notification created successfully:', data)
      return new Response(
        JSON.stringify({ success: true, data }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (type === 'broadcast') {
      // Broadcast notification to all users
      const { data: users, error: usersError } = await supabaseClient
        .from('profiles')
        .select('user_id')

      if (usersError) {
        console.error('Error fetching users:', usersError)
        return new Response(
          JSON.stringify({ error: usersError.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Create notifications for all users
      const notifications = users.map(user => ({
        user_id: user.user_id,
        title: title,
        message: message,
        type: notificationType,
        is_read: false
      }))

      const { data, error } = await supabaseClient
        .from('notifications')
        .insert(notifications)

      if (error) {
        console.error('Error broadcasting notifications:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Notifications broadcasted successfully')
      return new Response(
        JSON.stringify({ success: true, count: notifications.length }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request type' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in notification service:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})