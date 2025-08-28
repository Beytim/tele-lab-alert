import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const update: TelegramUpdate = await req.json()
    
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!botToken || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (update.message && update.message.text) {
      const message = update.message
      const chatId = message.chat.id
      const text = message.text.trim()
      const userId = message.from.id
      const username = message.from.username

      console.log(`Received message: ${text} from user ${userId}`)

      if (text.startsWith('/start')) {
        await handleStartCommand(text, chatId, userId, username, botToken, supabase)
      } else if (text === '/help') {
        await handleHelpCommand(chatId, botToken)
      } else if (text === '/status') {
        await handleStatusCommand(chatId, userId, botToken, supabase)
      } else if (text === '/stop') {
        await handleStopCommand(chatId, userId, botToken, supabase)
      } else {
        await sendMessage(chatId, 'I understand the following commands:\n\n/start +1234567890 - Connect your phone number\n/help - Show this help\n/status - Check your connection status\n/stop - Disconnect from notifications', botToken)
      }
    }

    return new Response('OK', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Error', {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    })
  }
})

async function handleStartCommand(
  text: string, 
  chatId: number, 
  userId: number, 
  username: string | undefined,
  botToken: string,
  supabase: any
) {
  const parts = text.split(' ')
  
  if (parts.length < 2) {
    await sendMessage(
      chatId,
      'Welcome to Girum Hospital Lab Notification Bot! 🏥\n\nTo connect your account, please use:\n/start +your_phone_number\n\nExample: /start +251911234567',
      botToken
    )
    return
  }

  const phone = parts[1]
  
  // Validate phone number format
  if (!phone.startsWith('+') || phone.length < 10) {
    await sendMessage(
      chatId,
      '❌ Invalid phone number format. Please use international format:\n\nExample: /start +251911234567',
      botToken
    )
    return
  }

  try {
    // Check if patient exists with this phone number
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('phone', phone)
      .single()

    if (error || !patient) {
      await sendMessage(
        chatId,
        '❌ Phone number not found in our system.\n\nPlease contact the hospital to register your phone number, or verify you entered it correctly.',
        botToken
      )
      return
    }

    // Update patient with Telegram info
    const { error: updateError } = await supabase
      .from('patients')
      .update({
        telegram_chat_id: chatId.toString(),
        telegram_username: username,
        telegram_connected: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', patient.id)

    if (updateError) {
      console.error('Database update error:', updateError)
      await sendMessage(
        chatId,
        '❌ Failed to connect your account. Please try again later.',
        botToken
      )
      return
    }

    await sendMessage(
      chatId,
      `✅ Successfully connected!\n\nHello ${patient.full_name}, you will now receive lab results and medical notifications here.\n\nUse /help to see available commands.`,
      botToken
    )

  } catch (error) {
    console.error('Start command error:', error)
    await sendMessage(
      chatId,
      '❌ An error occurred. Please try again later.',
      botToken
    )
  }
}

async function handleHelpCommand(chatId: number, botToken: string) {
  const helpText = `🏥 *Girum Hospital Lab Bot Help*

*Available Commands:*
/start +phone - Connect your phone number
/help - Show this help message
/status - Check your connection status
/stop - Disconnect from notifications

*About This Bot:*
This bot delivers your lab results and medical notifications securely. Your data is protected and only you will receive your results.

*Need Help?*
Contact Girum Hospital at +251-11-XXX-XXXX`

  await sendMessage(chatId, helpText, botToken)
}

async function handleStatusCommand(
  chatId: number, 
  userId: number, 
  botToken: string, 
  supabase: any
) {
  try {
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('telegram_chat_id', chatId.toString())
      .single()

    if (error || !patient) {
      await sendMessage(
        chatId,
        '❌ You are not connected to any patient account.\n\nUse /start +your_phone_number to connect.',
        botToken
      )
      return
    }

    // Get recent notifications count
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('id, status')
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const totalNotifications = notifications?.length || 0
    const deliveredCount = notifications?.filter(n => n.status === 'delivered').length || 0

    const statusText = `✅ *Connection Status*

*Patient:* ${patient.full_name}
*Phone:* ${patient.phone}
*Status:* Connected
*Connected Since:* ${new Date(patient.updated_at).toLocaleDateString()}

*Notification Stats:*
📊 Total Received: ${totalNotifications}
✅ Successfully Delivered: ${deliveredCount}

You will receive lab results and medical notifications here automatically.`

    await sendMessage(chatId, statusText, botToken)

  } catch (error) {
    console.error('Status command error:', error)
    await sendMessage(
      chatId,
      '❌ Unable to check status. Please try again later.',
      botToken
    )
  }
}

async function handleStopCommand(
  chatId: number, 
  userId: number, 
  botToken: string, 
  supabase: any
) {
  try {
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('telegram_chat_id', chatId.toString())
      .single()

    if (error || !patient) {
      await sendMessage(
        chatId,
        'You are not connected to any account.',
        botToken
      )
      return
    }

    // Disconnect patient
    const { error: updateError } = await supabase
      .from('patients')
      .update({
        telegram_chat_id: null,
        telegram_username: null,
        telegram_connected: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', patient.id)

    if (updateError) {
      console.error('Disconnect error:', updateError)
      await sendMessage(
        chatId,
        '❌ Failed to disconnect. Please try again later.',
        botToken
      )
      return
    }

    await sendMessage(
      chatId,
      '✅ Successfully disconnected from notifications.\n\nYou will no longer receive lab results here. Use /start +your_phone_number to reconnect anytime.',
      botToken
    )

  } catch (error) {
    console.error('Stop command error:', error)
    await sendMessage(
      chatId,
      '❌ An error occurred. Please try again later.',
      botToken
    )
  }
}

async function sendMessage(chatId: number, text: string, botToken: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Telegram API error:', errorData)
    }
  } catch (error) {
    console.error('Send message error:', error)
  }
}