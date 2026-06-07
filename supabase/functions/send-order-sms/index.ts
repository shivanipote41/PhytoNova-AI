import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    const { phone, total, orderId } = await req.json()
    if (!phone) {
      return new Response(JSON.stringify({ error: 'Phone number required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }
    const cleanPhone = phone.replace(/\D/g, '')
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return new Response(JSON.stringify({ error: 'Invalid Indian mobile number' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }
    const message = `PhytoNova Order Confirmed! Order ID: ${orderId}. Total: Rs.${total}. Thank you for shopping!`
    const fast2smsApiKey = Deno.env.get('FAST2SMS_API_KEY')
    if (fast2smsApiKey) {
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsApiKey}&route=q&message=${encodeURIComponent(message)}&language=english&numbers=${cleanPhone}`
      const resp = await fetch(url)
      const text = await resp.text()
      if (!resp.ok) {
        return new Response(JSON.stringify({ error: 'Fast2SMS error', detail: text }), { status: 500, headers: { 'Content-Type': 'application/json' } })
      }
      return new Response(JSON.stringify({ provider: 'fast2sms', result: text }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioFrom = Deno.env.get('TWILIO_PHONE_NUMBER')
    if (twilioSid && twilioToken && twilioFrom) {
      const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioSid}:${twilioToken}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `From=${encodeURIComponent(twilioFrom)}&To=${encodeURIComponent('+91' + cleanPhone)}&Body=${encodeURIComponent(message)}`
      })
      if (!resp.ok) {
        const err = await resp.text()
        return new Response(JSON.stringify({ error: 'Twilio error', detail: err }), { status: 500, headers: { 'Content-Type': 'application/json' } })
      }
      const data = await resp.json()
      return new Response(JSON.stringify({ provider: 'twilio', result: data }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    return new Response(JSON.stringify({ error: 'No SMS provider configured. Set FAST2SMS_API_KEY or TWILIO_* secrets in Supabase dashboard.' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})