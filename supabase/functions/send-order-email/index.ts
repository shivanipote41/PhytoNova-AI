import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { to, cartItems, total, orderId, customerName, address, paymentMethod } = await req.json()
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not set' }), { status: 500 })
  }

  const itemsHtml = cartItems.map((i: any) =>
    `<tr><td>${i.emoji} ${i.name}</td><td>${i.qty}</td><td>₹${i.price}</td><td>₹${i.price * i.qty}</td></tr>`
  ).join('')

  const htmlBody = `
    <h2>PhytoNova Order Confirmation</h2>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><strong>Customer:</strong> ${customerName}</p>
    <p><strong>Address:</strong> ${address}</p>
    <p><strong>Payment:</strong> ${paymentMethod}</p>
    <table border="1" cellpadding="8"><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>${itemsHtml}</table>
    <h3>Grand Total: ₹${total}</h3>
    <p>Thank you for shopping with PhytoNova!</p>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'PhytoNova <orders@phytonova.ai>',
      to,
      subject: `Your PhytoNova Order Confirmation — ${orderId}`,
      html: htmlBody,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return new Response(JSON.stringify({ error: err }), { status: 500 })
  }

  const data = await res.json()
  return new Response(JSON.stringify(data), { status: 200 })
})