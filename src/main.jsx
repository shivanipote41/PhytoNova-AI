import { supabase } from './services/supabase.js';
import { trackEvent } from './services/firebase.js';

// ---------------------------------------------------------------------------
// Helpers — these exist as globals in index.html's inline <script>
// ---------------------------------------------------------------------------
const validateEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
const showToast = (msg) => {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
};
const clearFormErrors = () => {
  ['signin-error', 'signup-error'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  ['signin-email', 'signin-password', 'signup-name', 'signup-email', 'signup-password', 'signup-farm'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error');
  });
};
const switchTab = (tab) => {
  const isSignin = tab === 'signin';
  document.getElementById('signin-form').style.display = isSignin ? 'block' : 'none';
  document.getElementById('tab-signin').classList.toggle('active', isSignin);
  document.getElementById('tab-signup').classList.toggle('active', !isSignin);
};

// ---------------------------------------------------------------------------
// Auto-login on page load
// ---------------------------------------------------------------------------
async function restoreSession() {
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return;

  const u = data.session.user;
  window.currentUser = {
    id: u.id,
    name: u.user_metadata?.full_name || u.email.split('@')[0],
    email: u.email,
    farm: u.user_metadata?.farm_type || '',
    createdAt: u.created_at,
  };
  window.loginSuccess();
  trackEvent('session_restore', { user_id: u.id });
}

// ---------------------------------------------------------------------------
// Override window.handleSignIn
// ---------------------------------------------------------------------------
window.handleSignIn = async function () {
  if (!supabase) {
    showToast('⚠️ Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    return;
  }

  clearFormErrors();
  const emailInput = document.getElementById('signin-email');
  const passwordInput = document.getElementById('signin-password');
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const errorEl = document.getElementById('signin-error');

  if (!email) {
    errorEl.textContent = 'Please enter your email address.';
    emailInput.classList.add('error');
    return;
  }
  if (!validateEmail(email)) {
    errorEl.textContent = 'Enter a valid email like farmer@example.com.';
    emailInput.classList.add('error');
    return;
  }
  if (!password) {
    errorEl.textContent = 'Please enter your password.';
    passwordInput.classList.add('error');
    return;
  }
  if (password.length < 4) {
    errorEl.textContent = 'Password must be at least 4 characters.';
    passwordInput.classList.add('error');
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    errorEl.textContent = error?.message || 'Failed to sign in. Try again.';
    emailInput.classList.add('error');
    passwordInput.classList.add('error');
    return;
  }

  const u = data.user;
  window.currentUser = {
    id: u.id,
    name: u.user_metadata?.full_name || u.email.split('@')[0],
    email: u.email,
    farm: u.user_metadata?.farm_type || '',
    createdAt: u.created_at,
  };

  window.loginSuccess();
  trackEvent('login', { user_id: u.id, method: 'email' });
};

// ---------------------------------------------------------------------------
// Override window.handleSignUp
// ---------------------------------------------------------------------------
window.handleSignUp = async function () {
  if (!supabase) {
    showToast('⚠️ Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    return;
  }

  clearFormErrors();
  const nameInput = document.getElementById('signup-name');
  const emailInput = document.getElementById('signup-email');
  const passwordInput = document.getElementById('signup-password');
  const farmInput = document.getElementById('signup-farm');
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const farmType = farmInput.value;
  const errorEl = document.getElementById('signup-error');

  if (!name) {
    errorEl.textContent = 'Please enter your full name.';
    nameInput.classList.add('error');
    return;
  }
  if (!email) {
    errorEl.textContent = 'Please enter your email address.';
    emailInput.classList.add('error');
    return;
  }
  if (!validateEmail(email)) {
    errorEl.textContent = 'Enter a valid email like farmer@example.com.';
    emailInput.classList.add('error');
    return;
  }
  if (!password) {
    errorEl.textContent = 'Please create a password.';
    passwordInput.classList.add('error');
    return;
  }
  if (password.length < 8) {
    errorEl.textContent = 'Password must be at least 8 characters long.';
    passwordInput.classList.add('error');
    return;
  }
  if (!farmType) {
    errorEl.textContent = 'Please select your farm type.';
    farmInput.classList.add('error');
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name, farm_type: farmType } },
  });

  if (error || !data.user) {
    errorEl.textContent = error?.message || 'Failed to create account. Try again.';
    if (error?.message?.toLowerCase().includes('already')) {
      emailInput.classList.add('error');
    }
    return;
  }

  // Insert profile row
  await supabase.from('profiles').upsert(
    { user_id: data.user.id, full_name: name },
    { onConflict: 'user_id' }
  );

  errorEl.style.color = 'var(--green-neon)';
  errorEl.textContent = '✓ Account created successfully! Redirecting to login...';

  nameInput.value = '';
  emailInput.value = '';
  passwordInput.value = '';
  farmInput.value = '';

  setTimeout(() => {
    switchTab('signin');
    errorEl.style.color = '';
    errorEl.textContent = '';
  }, 2000);

  trackEvent('sign_up', { user_id: data.user.id, method: 'email' });
};

// ---------------------------------------------------------------------------
// Override window.saveDiseaseImage
// ---------------------------------------------------------------------------
window.saveDiseaseImage = async function (imageSrc, file, analysisResult) {
  if (!supabase) {
    showToast('⚠️ Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    return;
  }
  if (!window.currentUser?.id) {
    showToast('⚠️ Please sign in to save scans.');
    return;
  }

  try {
    const { error } = await supabase.from('detections').insert({
      user_id: window.currentUser.id,
      image_url: imageSrc,
      disease: analysisResult.name,
      confidence: analysisResult.confidence,
      treatment: Array.isArray(analysisResult.recommendations)
        ? analysisResult.recommendations.join('\n')
        : '',
    });

    if (error) throw error;

    showToast('✅ Image saved to database');
    trackEvent('disease_save', {
      disease: analysisResult.name,
      confidence: analysisResult.confidence,
    });

    if (typeof window.loadDiseaseHistory === 'function') {
      window.loadDiseaseHistory();
    }
  } catch (err) {
    console.error('saveDiseaseImage error:', err);
    showToast('⚠️ Failed to save image to database. See console for details.');
  }
};

// ---------------------------------------------------------------------------
// Override window.loadDiseaseHistory
// ---------------------------------------------------------------------------
window.loadDiseaseHistory = async function () {
  if (!supabase) return;

  const historyGrid = document.getElementById('historyGrid');
  if (!historyGrid) return;

  historyGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.55);padding:24px;">Loading saved scans...</div>`;

  const userId = window.currentUser?.id;
  if (!userId) {
    historyGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.55);padding:24px;">Please sign in to view your scan history.</div>`;
    return;
  }

  const { data: items, error } = await supabase
    .from('detections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    historyGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.55);padding:24px;">Unable to load saved scans.</div>`;
    return;
  }

  if (!items?.length) {
    historyGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.55);padding:24px;">No saved scans yet. Upload or capture a plant image to store it here.</div>`;
    return;
  }

  historyGrid.innerHTML = items.map((item) => {
    const resultName = item.disease || 'Plant scan';
    const tagType = item.type || 'healthy';
    const createdAt = new Date(item.created_at).toLocaleString();
    return `
      <div style="background:var(--glass);border:1px solid var(--glass-border);border-radius:16px;overflow:hidden;">
        <img src="${item.image_url}" alt="Saved scan" style="width:100%;height:140px;object-fit:cover;display:block;" />
        <div style="padding:12px;">
          <div style="font-size:13px;font-weight:700;margin-bottom:8px;min-height:38px;">${resultName}</div>
          <div class="disease-tag ${tagType}" style="margin-bottom:10px;font-size:11px;">${resultName}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.45);">${createdAt}</div>
        </div>
      </div>
    `;
  }).join('');
};

// ---------------------------------------------------------------------------
// Override window.handleLogout
// ---------------------------------------------------------------------------
window.handleLogout = (function () {
  const original = window.handleLogout;
  return async function () {
    if (typeof supabase !== 'undefined' && supabase) {
      await supabase.auth.signOut();
    }
    if (typeof original === 'function') {
      original();
    }
  };
})();

// ---------------------------------------------------------------------------
// BUG 2 — Override window.loadProfileFields (Supabase-backed)
// ---------------------------------------------------------------------------
const originalLoadProfileFields = window.loadProfileFields;
window.loadProfileFields = async function () {
  if (!supabase || !window.currentUser?.id) {
    showToast('⚠️ Could not load profile — Supabase not available. Showing saved data.');
    if (typeof originalLoadProfileFields === 'function') originalLoadProfileFields();
    return;
  }
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', window.currentUser.id)
      .maybeSingle();
    if (error) throw error;

    const name = profile?.full_name || window.currentUser.name || 'User';
    const email = window.currentUser.email || 'email@example.com';
    const bio = profile?.bio || 'Experienced grower focused on regenerative practices.';

    const sName = document.getElementById('settingsName'); if (sName) sName.value = name;
    const sEmail = document.getElementById('settingsEmail'); if (sEmail) sEmail.value = email;
    const sBio = document.getElementById('settingsBio'); if (sBio) sBio.value = bio;
    const pName = document.getElementById('profileName'); if (pName) pName.textContent = name;
    const pEmail = document.getElementById('profileEmail'); if (pEmail) pEmail.textContent = email;
    const pBio = document.getElementById('profileBio'); if (pBio) pBio.textContent = bio;
    const myd = document.getElementById('memberYearDisplay');
    if (myd && window.currentUser.createdAt) myd.textContent = new Date(window.currentUser.createdAt).getFullYear();

    if (!localStorage.getItem('userAvatar')) {
      const initial = (window.currentUser.name || name).charAt(0).toUpperCase();
      ['sidebarAvatar', 'topbarAvatar', 'communityAvatar', 'profileAvatar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.backgroundImage = ''; el.style.color = ''; el.textContent = initial; }
      });
    }
  } catch (err) {
    console.error('[PhytoNova] loadProfileFields error:', err);
    showToast('⚠️ Could not load profile from database.');
    if (typeof originalLoadProfileFields === 'function') originalLoadProfileFields();
  }
};

// ---------------------------------------------------------------------------
// BUG 2 — Override window.saveProfileChanges (Supabase-backed)
// ---------------------------------------------------------------------------
window.saveProfileChanges = async function () {
  const name = document.getElementById('settingsName')?.value.trim();
  const email = document.getElementById('settingsEmail')?.value.trim();
  const bio = document.getElementById('settingsBio')?.value.trim();

  if (!supabase || !window.currentUser?.id) {
    showToast('⚠️ Supabase not available. Saving locally only.');
    if (name) { localStorage.setItem('userName', name); document.getElementById('sidebarName').textContent = name; }
    if (email) { localStorage.setItem('userEmail', email); }
    if (bio) localStorage.setItem('userBio', bio);
    const pBio = document.getElementById('profileBio'); if (pBio) pBio.textContent = bio || '';
    showToast('✅ Profile saved (local only)');
    return;
  }

  try {
    await supabase.from('profiles').update({ full_name: name, bio }).eq('user_id', window.currentUser.id);
    await supabase.auth.updateUser({ data: { full_name: name } });
  } catch (err) {
    console.error('[PhytoNova] saveProfileChanges error:', err);
  }

  if (name) {
    localStorage.setItem('userName', name);
    document.getElementById('sidebarName').textContent = name;
    document.getElementById('profileName').textContent = name;
    window.currentUser.name = name;
  }
  if (email) { localStorage.setItem('userEmail', email); document.getElementById('profileEmail').textContent = email; }
  if (bio) { localStorage.setItem('userBio', bio); const pBio = document.getElementById('profileBio'); if (pBio) pBio.textContent = bio; }
  showToast('✅ Profile saved');
};

// ---------------------------------------------------------------------------
// BUG 3 — Override window.addToCart (cart total + toast)
// ---------------------------------------------------------------------------
window.addToCart = (function () {
  const originalAddToCart = window.addToCart;
  return function (...args) {
    if (typeof originalAddToCart === 'function') originalAddToCart.apply(this, args);
    const total = calculateCartTotal();
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = '₹' + total.toLocaleString('en-IN');
    if (typeof window.updateCartTotalDisplay === 'function') window.updateCartTotalDisplay();
    showToast(`✅ Added. Cart total: ₹${total.toLocaleString('en-IN')}`);
  };
})();

// ---------------------------------------------------------------------------
// BUG 3 — Override window.changeQty (cart total after qty change)
// ---------------------------------------------------------------------------
window.changeQty = (function () {
  const originalChangeQty = window.changeQty;
  return function (...args) {
    if (typeof originalChangeQty === 'function') originalChangeQty.apply(this, args);
    const total = calculateCartTotal();
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = '₹' + total.toLocaleString('en-IN');
    if (typeof window.updateCartTotalDisplay === 'function') window.updateCartTotalDisplay();
  };
})();

// ---------------------------------------------------------------------------
// Checkout Integration — Order Saving + Email
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helper: calculateCartTotal
// ---------------------------------------------------------------------------
const calculateCartTotal = () => window.cartItems?.reduce((sum, i) => sum + i.price * i.qty, 0) || 0;

// ---------------------------------------------------------------------------
// Helper: sendOrderEmail
// ---------------------------------------------------------------------------
const sendOrderEmail = async ({ to, cartItems, total, orderId, customerName, address, paymentMethod }) => {
  // PATH 0 — Local Vite proxy (bypasses CORS, works immediately in dev)
  try {
    if (import.meta.env.DEV && import.meta.env.VITE_RESEND_API_KEY) {
      const itemsText = (cartItems || []).map(i => `${i.emoji} ${i.name} x${i.qty} = ₹${i.price * i.qty}`).join('\n');
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #2d6a4f;">🪴 PhytoNova Order Confirmation</h2>
          <p>Hi <strong>${customerName || 'Customer'}</strong>,</p>
          <p>Your order <strong>#${orderId}</strong> has been received!</p>
          <h3>Order Details</h3>
          <pre style="background: #f5f5f5; padding: 10px; border-radius: 8px;">${itemsText || 'No items'}</pre>
          <p><strong>Total:</strong> ₹${(total || 0).toLocaleString('en-IN')}</p>
          <p><strong>Payment:</strong> ${paymentMethod || 'UPI'}</p>
          <p><strong>Delivery Address:</strong><br>${address || 'Not provided'}</p>
          <p style="margin-top: 20px;">Thank you for choosing PhytoNova! 🌿</p>
        </div>
      `;
      const primaryResp = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'PhytoNova <onboarding@resend.dev>',
          to,
          subject: 'Your PhytoNova Order Confirmation — ' + orderId,
          html: htmlBody,
        }),
      });
      if (primaryResp.ok) {
        console.log('[PhytoNova] Email sent via Resend proxy');
        showToast('📧 Order confirmation sent to your email!');
        return { success: true, via: 'resend', reason: 'Sent via Resend' };
      }
      const errText = await primaryResp.text();

      // PATH 0 FALLBACK — Resend domain restriction (403)
      if (primaryResp.status === 403) {
        console.warn('[PhytoNova] Resend 403 (domain not verified). Retrying to developer inbox.');
        showToast('⚠️ Resend restricted: sending to developer email instead. Verify domain at resend.com to email customers.');

        const fallbackResp = await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'PhytoNova <onboarding@resend.dev>',
            to: 'shivanipote1118@gmail.com',
            subject: '[PhytoNova DEV] Order for ' + customerName + ' — ' + orderId,
            html: htmlBody,
          }),
        });
        if (fallbackResp.ok) {
          console.log('[PhytoNova] Email sent to developer inbox via Resend fallback');
          showToast('📧 Order confirmation sent to developer inbox. Verify domain at resend.com to email customers directly.');
          return { success: true, via: 'resend-fallback', reason: 'Domain not verified; sent to developer email' };
        }
        const fallbackErr = await fallbackResp.text();
        console.warn('[PhytoNova] Resend fallback also failed:', fallbackResp.status, fallbackErr);
        return { success: false, via: null, reason: 'Resend 403 (domain not verified) and fallback also failed: ' + fallbackErr };
      }

      console.warn('[PhytoNova] Resend proxy returned non-OK:', primaryResp.status, errText);
    }
  } catch (e) {
    console.warn('[PhytoNova] Resend proxy error:', e);
  }

  // PATH 1 — Supabase Edge Function (Resend via server, no CORS issues)
  try {
    if (supabase) {
      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: { to, cartItems, total, orderId, customerName, address, paymentMethod }
      });
      if (!error) {
        console.log('[PhytoNova] Email sent via Edge Function:', data);
        return { success: true, via: 'supabase-edge', reason: 'Sent via Resend' };
      }
      if (error?.message?.includes('404') || error?.context?.status === 404) {
        console.warn('[PhytoNova] Edge Function not deployed yet.');
      } else {
        console.warn('[PhytoNova] Edge Function error:', error);
      }
    }
  } catch (e) {
    console.warn('[PhytoNova] Edge Function threw:', e);
  }

  // PATH 2 — EmailJS REST API (browser-safe, CORS enabled)
  const emailjsService = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const emailjsTemplate = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (emailjsService && emailjsTemplate && emailjsPublicKey) {
    try {
      const itemsText = (cartItems || []).map(i => `${i.emoji} ${i.name} x${i.qty} = ₹${i.price * i.qty}`).join('\n');
      const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: emailjsService,
          template_id: emailjsTemplate,
          user_id: emailjsPublicKey,
          template_params: {
            to_email: to,
            order_id: orderId,
            customer_name: customerName,
            items_list: itemsText || 'No items',
            total_amount: '₹' + (total || 0).toLocaleString('en-IN'),
            address: address || 'Not provided',
            payment_method: paymentMethod || 'UPI',
          }
        })
      });
      if (!resp.ok) {
        const errText = await resp.text();
        console.error('[PhytoNova] EmailJS error:', resp.status, errText);
        return { success: false, via: 'emailjs', reason: 'EmailJS failed. Check template_params.' };
      }
      console.log('[PhytoNova] Email sent via EmailJS');
      return { success: true, via: 'emailjs', reason: 'Sent via EmailJS' };
    } catch (e) {
      console.error('[PhytoNova] EmailJS threw:', e);
    }
  }

  // PATH 3 — Nothing configured
  console.warn('[PhytoNova] No email provider configured.');
  return { success: false, via: null, reason: 'Unable to send confirmation email. You may contact support if needed.' };
};

const sendOrderSMS = async ({ phone, total, orderId }) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.functions.invoke('send-order-sms', {
        body: { phone, total, orderId }
      });
      if (!error) {
        console.log('[PhytoNova] SMS sent:', data);
        return { success: true, via: data.provider || 'supabase-edge', reason: 'SMS sent' };
      }
      console.warn('[PhytoNova] SMS error:', error);
    }
  } catch (e) {
    console.warn('[PhytoNova] SMS threw:', e);
  }
  return { success: false, via: null, reason: 'Unable to send confirmation SMS. Your order is still confirmed.' };
};

// ---------------------------------------------------------------------------
// Override window.goPayStep
// ---------------------------------------------------------------------------
window.goPayStep = (function () {
  const originalGoPayStep = window.goPayStep;
  return async function (step) {
    if (step === 2) {
      const name = document.getElementById('addr-name')?.value.trim();
      const phone = document.getElementById('addr-phone')?.value.trim();
      const address = document.getElementById('addr-address')?.value.trim();

      if (!name || !phone || !address) {
        window.showToast('⚠️ Please complete delivery name, phone and address.');
        return;
      }
      if (typeof window.validatePhone === 'function' && !window.validatePhone(phone)) {
        window.showToast('⚠️ Please enter a valid phone number.');
        return;
      }
    }

    if (step === 3) {
      const paymentMethod = document.querySelector('input[name="payment"]:checked');
      const selected = paymentMethod ? paymentMethod.value : 'upi';
      if (selected === 'upi') {
        const upi = document.getElementById('upiId')?.value.trim();
        if (typeof window.validateUPI === 'function' && !window.validateUPI(upi)) {
          window.showToast('⚠️ Please enter a valid UPI ID.');
          return;
        }
      } else if (selected === 'card') {
        if (typeof window.validateCard === 'function' && !window.validateCard()) return;
      } else if (selected === 'netbanking') {
        if (typeof window.validateNetBanking === 'function' && !window.validateNetBanking()) return;
      }

      const name = document.getElementById('addr-name')?.value.trim();
      const phone = document.getElementById('addr-phone')?.value.trim();
      const address = document.getElementById('addr-address')?.value.trim();
      const total = calculateCartTotal();
      const orderId = 'PNI-' + Math.floor(Math.random() * 900000 + 100000);

      const orderIdEl = document.getElementById('orderId');
      if (orderIdEl) orderIdEl.textContent = orderId;

      if (supabase && window.currentUser?.id) {
        try {
          await supabase.from('orders').insert({
            user_id: window.currentUser.id,
            customer_name: name,
            customer_email: window.currentUser.email,
            customer_phone: phone,
            customer_address: address,
            cart_items: window.cartItems,
            total_price: total,
            status: 'confirmed',
          });
        } catch (err) {
          console.error('[PhytoNova] Failed to save order to Supabase:', err);
        }
      }

      const emailResult = await sendOrderEmail({
        to: window.currentUser?.email,
        cartItems: window.cartItems,
        total,
        orderId,
        customerName: name,
        address,
        paymentMethod: selected,
      });
      window.updateOrderStatus('email', emailResult.success, emailResult.reason);

      let smsResult = { success: false, reason: 'Skipped because email succeeded' };
      if (!emailResult.success && phone) {
        smsResult = await sendOrderSMS({ phone, total, orderId });
        window.updateOrderStatus('sms', smsResult.success, smsResult.reason);
      } else {
        window.updateOrderStatus('sms', false, smsResult.reason);
      }

      // queued toasts — sequential via queue
      if (emailResult.success) {
        window.showToast('📧 ' + emailResult.reason);
      } else {
        window.showToast('⚠️ Email failed: ' + emailResult.reason);
        if (smsResult.success) {
          window.showToast('📱 ' + smsResult.reason);
        } else {
          window.showToast('⚠️ SMS failed: ' + smsResult.reason);
        }
      }

      setTimeout(() => {
        if (typeof window.addNotification === 'function') {
          window.addNotification('Order Confirmed', 'Your order has been placed successfully and is being processed.', 'Just now');
        }
        window.showToast('🎉 Order placed successfully!');
        trackEvent('purchase', { value: total, currency: 'INR', items: window.cartItems?.length || 0 });
      }, 1000);

      return originalGoPayStep(step);
    }

    return originalGoPayStep(step);
  };
})();

// ---------------------------------------------------------------------------
// Override window.renderCart — ensure #cartTotal is always accurate
// ---------------------------------------------------------------------------
window.renderCart = (function () {
  const originalRenderCart = window.renderCart;
  return function (...args) {
    if (typeof originalRenderCart === 'function') {
      originalRenderCart.apply(this, args);
    }
    const total = calculateCartTotal();
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = '₹' + total.toLocaleString('en-IN');
  };
})();

// -----------------------------------------------------------------------
// window.placeOrder — real checkout: save to Supabase, email, SMS, status panel
// -------------------------------------------------------------------------
window.placeOrder = async function () {
  try {
    console.log('[PhytoNova] placeOrder START');

    const name = document.getElementById('addr-name')?.value.trim();
    const phone = document.getElementById('addr-phone')?.value.trim();
    const address = document.getElementById('addr-address')?.value.trim();

    if (!name || !phone || !address) {
      window.showToast('⚠️ Please complete delivery name, phone and address.');
      return;
    }
    if (typeof window.validatePhone === 'function' && !window.validatePhone(phone)) {
      window.showToast('⚠️ Please enter a valid phone number.');
      return;
    }

    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'upi';
    if (paymentMethod === 'upi') {
      const upi = document.getElementById('upiId')?.value.trim();
      const upiValid = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(upi || '');
      if (!upiValid) { window.showToast('⚠️ Please enter a valid UPI ID.'); return; }
    } else if (paymentMethod === 'card') {
      const cno = document.getElementById('cardNumber')?.value.trim();
      const exp = document.getElementById('cardExpiry')?.value.trim();
      const cvv = document.getElementById('cardCvv')?.value.trim();
      const cardOk = cno && cno.replace(/\s/g, '').length >= 13 && exp && cvv;
      if (!cardOk) { window.showToast('⚠️ Please enter valid card details.'); return; }
    } else if (paymentMethod === 'netbanking') {
      const acc = document.getElementById('accNumber')?.value.trim();
      const ifsc = document.getElementById('ifscCode')?.value.trim();
      if (!acc || !ifsc) { window.showToast('⚠️ Please enter account number and IFSC code.'); return; }
    }

    if (!window.cartItems?.length) {
      window.showToast('⚠️ Your cart is empty.');
      return;
    }

    const total = window.calculateCartTotal ? window.calculateCartTotal() : window.cartItems.reduce((s, i) => s + i.price * i.qty, 0);
    const orderId = 'PNI-' + Math.floor(Math.random() * 900000 + 100000);
    const email = window.currentUser?.email || 'guest@phytanova.ai';
    const customerName = window.currentUser?.name || name;
    const deliveryAddress = address;

    // Bridge updateOrderStatus if the inline HTML defines it but hasn't put it on window
    if (!window.updateOrderStatus && typeof updateOrderStatus === 'function') {
      window.updateOrderStatus = updateOrderStatus;
    }

    // Save to Supabase orders table
    let dbOk = false;
    try {
      if (supabase) {
        const { error } = await supabase.from('orders').insert([{
          user_id: window.currentUser?.id || null,
          order_id: orderId,
          items: window.cartItems,
          total,
          status: 'pending',
          delivery_name: name,
          delivery_phone: phone,
          delivery_address: deliveryAddress,
          payment_method: paymentMethod,
        }]);
        if (!error) {
          dbOk = true;
        } else {
          console.warn('[PhytoNova] Order save error:', error);
        }
      }
    } catch (e) {
      console.warn('[PhytoNova] Order save exception:', e);
    }
    console.log('[PhytoNova] Order saved:', dbOk);

    // Send email
    const emailResult = await sendOrderEmail({
      to: email,
      cartItems: window.cartItems,
      total,
      orderId,
      customerName,
      address: deliveryAddress,
      paymentMethod,
    });
    console.log('[PhytoNova] Email result:', emailResult);

    // Send SMS
    const smsResult = await sendOrderSMS({
      phone,
      orderId,
      total,
      customerName,
    });
    console.log('[PhytoNova] SMS result:', smsResult);

    // Update UI
    console.log('[PhytoNova] placeOrder proceeding to step 3');
    document.getElementById('orderId').textContent = orderId;
    window.showToast('🎉 Order placed successfully!');
    if (typeof window.addNotification === 'function') {
      window.addNotification('Order Confirmed', 'Your order has been placed successfully and is being processed.', 'Just now');
    }
    window.cartItems = [];
    if (typeof window.renderCart === 'function') window.renderCart();

    // Advance checkout step UI to step 3
    [1, 2, 3].forEach(n => {
      const stepEl = document.getElementById('checkout-step' + n);
      if (stepEl) stepEl.style.display = n === 3 ? 'block' : 'none';
      const pstep = document.getElementById('pstep' + n);
      if (pstep) pstep.className = 'payment-step' + (n < 3 ? ' done' : n === 3 ? ' active' : '');
    });

    trackEvent('purchase', { value: total, currency: 'INR', items: window.cartItems?.length || 0 });
    console.log('[PhytoNova] placeOrder SUCCESS');
  } catch (err) {
    console.error('[PhytoNova] placeOrder CRASH:', err);
    window.showToast('⚠️ Something went wrong. Please try again.');
  }
};

// ---------------------------------------------------------------------------
// Attach everything after DOM is ready
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  restoreSession();

  // Wire Place Order button robustly — uses addEventListener + MutationObserver
  const wirePlaceOrder = () => {
    const btn = document.querySelector('button[onclick*="goPayStep(3)"]');
    if (!btn) return;
    if (btn.dataset.wired === '1') return;
    btn.dataset.wired = '1';
    btn.removeAttribute('onclick');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.placeOrder) window.placeOrder();
    });
  };

  // Try wiring on DOM ready + whenever payment modal opens
  setTimeout(wirePlaceOrder, 200);
  const modal = document.getElementById('paymentModal');
  if (modal) {
    const observer = new MutationObserver(() => {
      if (modal.classList.contains('active')) wirePlaceOrder();
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  // Simplify goPayStep override for step 3 — non-async to avoid return value issues
  if (typeof window.goPayStep === 'function') {
    const __origGoPayStep = window.goPayStep;
    window.goPayStep = function (step) {
      if (step === 3 && window.placeOrder) {
        window.placeOrder();
        return;
      }
      return __origGoPayStep(step);
    };
  }
});