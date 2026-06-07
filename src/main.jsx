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
// Attach everything after DOM is ready
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  restoreSession();
});