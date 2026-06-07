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
  // PATH 1 — Supabase Edge Function (Resend via server, no CORS issues)
  try {
    if (supabase) {
      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: { to, cartItems, total, orderId, customerName, address, paymentMethod }
      });
      if (!error) {
        console.log('[PhytoNova] Email sent via Edge Function:', data);
        showToast('📧 Order confirmation email sent!');
        return;
      }
      if (error?.message?.includes('404') || error?.context?.status === 404) {
        console.warn('[PhytoNova] Edge Function not deployed yet.');
        showToast('⚠️ Edge Function not deployed. Falling back to EmailJS...');
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
        showToast('⚠️ EmailJS failed. Check template_params match your template.');
        return;
      }
      console.log('[PhytoNova] Email sent via EmailJS');
      showToast('📧 Order confirmation email sent via EmailJS!');
      return;
    } catch (e) {
      console.error('[PhytoNova] EmailJS threw:', e);
    }
  }

  // PATH 3 — Nothing configured
  console.warn('[PhytoNova] No email provider configured.');
  showToast('⚠️ Order saved, but email not sent. Add Supabase Edge Function (Resend) or EmailJS credentials in .env.');
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

      if (window.currentUser?.email) {
        await sendOrderEmail({
          to: window.currentUser.email,
          cartItems: window.cartItems,
          total,
          orderId,
          customerName: name,
          address,
          paymentMethod: selected,
        });
      }

      if (typeof window.addNotification === 'function') {
        window.addNotification('Order Confirmed', 'Your order has been placed successfully and is being processed.', 'Just now');
      }
      window.showToast('🎉 Order placed successfully!');
      trackEvent('purchase', { value: total, currency: 'INR', items: window.cartItems?.length || 0 });

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

// ---------------------------------------------------------------------------
// Attach everything after DOM is ready
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  restoreSession();
});