import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface NotificationRequest {
  patient_id: string;
  test_id?: string;
  message: string;
  notification_type: string;
}

// Normalize Ethiopian phone numbers to international format
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 251
  if (cleaned.startsWith('0')) {
    cleaned = '251' + cleaned.substring(1);
  }
  
  // If doesn't start with 251, prepend it
  if (!cleaned.startsWith('251')) {
    cleaned = '251' + cleaned;
  }
  
  return '+' + cleaned;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { patient_id, test_id, message, notification_type }: NotificationRequest = await req.json()
    
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!botToken || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get patient information
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patient_id)
      .single()

    if (patientError || !patient) {
      throw new Error('Patient not found')
    }

    console.log('Found patient:', patient.full_name)

    // Check if patient has Telegram connected
    if (!patient.telegram_connected || !patient.telegram_chat_id) {
      // Create notification record with failed status
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          patient_id,
          test_id,
          notification_type,
          message,
          status: 'failed',
          error_message: 'Patient not connected to Telegram'
        })

      if (notifError) {
        console.error('Failed to create notification record:', notifError)
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Patient not connected to Telegram',
          phone: normalizePhoneNumber(patient.phone || '')
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create notification record
    const { data: notification, error: createError } = await supabase
      .from('notifications')
      .insert({
        patient_id,
        test_id,
        notification_type,
        message,
        status: 'pending'
      })
      .select()
      .single()

    if (createError) {
      console.error('Failed to create notification:', createError)
      throw new Error('Failed to create notification record')
    }

    console.log('Created notification:', notification.id)

    // Format message with hospital branding
    const formattedMessage = `🏥 *Girum Hospital*

${message}

---
This is an automated message from Girum Hospital Lab Department. 
If you have questions, please contact us at +251-11-XXX-XXXX`

    // Send Telegram message
    try {
      const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: patient.telegram_chat_id,
          text: formattedMessage,
          parse_mode: 'Markdown'
        }),
      })

      const telegramData = await telegramResponse.json()
      
      if (!telegramResponse.ok) {
        throw new Error(`Telegram API error: ${telegramData.description || 'Unknown error'}`)
      }

      console.log('Telegram message sent successfully:', telegramData.message_id)

      // Update notification as delivered
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          status: 'delivered',
          telegram_message_id: telegramData.message_id.toString(),
          sent_at: new Date().toISOString(),
          delivered_at: new Date().toISOString()
        })
        .eq('id', notification.id)

      if (updateError) {
        console.error('Failed to update notification status:', updateError)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          notification_id: notification.id,
          telegram_message_id: telegramData.message_id,
          patient_name: patient.full_name,
          normalized_phone: normalizePhoneNumber(patient.phone || '')
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )

    } catch (telegramError) {
      console.error('Telegram sending failed:', telegramError)

      // Update notification as failed
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          status: 'failed',
          error_message: telegramError.message,
          sent_at: new Date().toISOString()
        })
        .eq('id', notification.id)

      if (updateError) {
        console.error('Failed to update notification status:', updateError)
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: telegramError.message,
          notification_id: notification.id,
          normalized_phone: normalizePhoneNumber(patient.phone || '')
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})