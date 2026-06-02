/* config.jsx — backend wiring config + Supabase client + auth/payment helpers

   ─────────────────────────────────────────────────────────────────────────
   👉 FILL IN YOUR REAL CREDENTIALS BELOW.
   Until these are filled in, the app automatically falls back to the original
   local/mock behavior so the prototype keeps working during setup.
   ───────────────────────────────────────────────────────────────────────── */

const CONFIG = {
  // SUPABASE
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',   // ← Project URL
  SUPABASE_ANON_KEY: 'YOUR_ANON_KEY',                 // ← Anon (public) key

  // STRIPE
  STRIPE_PUBLISHABLE_KEY: 'pk_test_YOUR_STRIPE_KEY',  // ← Publishable key
  STRIPE_MONTHLY_PRICE_ID: 'price_XXX_MONTHLY',       // ← Monthly price ID
  STRIPE_ANNUAL_PRICE_ID:  'price_XXX_ANNUAL',        // ← Annual price ID

  // APP STORE
  APP_STORE_URL: 'https://apps.apple.com/app/idYOUR_APP_ID', // ← App Store URL
};

/* True only once real Supabase credentials have been dropped in above.
   Every backend call is guarded by this so the prototype degrades gracefully
   to its original in-memory behavior until you're configured. */
function isSupabaseConfigured() {
  return (
    !!CONFIG.SUPABASE_URL &&
    !CONFIG.SUPABASE_URL.includes('YOUR_PROJECT') &&
    !!CONFIG.SUPABASE_ANON_KEY &&
    CONFIG.SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY'
  );
}

function isStripeConfigured() {
  return (
    !!CONFIG.STRIPE_PUBLISHABLE_KEY &&
    !CONFIG.STRIPE_PUBLISHABLE_KEY.includes('YOUR_STRIPE_KEY')
  );
}

/* Supabase client (only created when configured + library is present). */
let sb = null;
if (isSupabaseConfigured() && typeof window !== 'undefined' && window.supabase) {
  try {
    sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  } catch (e) {
    console.error('[config] Failed to create Supabase client:', e);
    sb = null;
  }
}

/* ----------------------------------------------------------------
   TIME — turn a stored timestamp into the "3 hours ago" style string
   the cards already render. Keeps the existing visual language.
   ---------------------------------------------------------------- */
function timeAgo(input) {
  if (!input) return 'just now';
  const then = new Date(input).getTime();
  if (Number.isNaN(then)) return String(input);
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 45) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(input).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ----------------------------------------------------------------
   AUTH — thin wrappers around Supabase Auth.
   `profileFromRow` maps a public.users row → the shape the UI expects.
   ---------------------------------------------------------------- */
function profileFromRow(row, authUser) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || 'You',
    city: row.city || 'somewhere',
    stage: row.stage || 'seeking',
    plan: row.plan || 'annual',
    is_premium: !!row.is_premium,
    email: row.email || authUser?.email || '',
  };
}

async function fetchUserRow(userId) {
  if (!sb || !userId) return null;
  const { data, error } = await sb.from('users').select('*').eq('id', userId).maybeSingle();
  if (error) { console.error('[auth] fetchUserRow', error); return null; }
  return data;
}

/* Sign up with email/password and stash name/city/plan in auth metadata.
   The public.users row is created by a DB trigger from that metadata. */
async function signUpUser({ email, password, name, city, plan }) {
  if (!sb) throw new Error('Supabase not configured');
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { name, city, plan } },
  });
  if (error) throw error;
  return data;
}

async function signInUser({ email, password }) {
  if (!sb) throw new Error('Supabase not configured');
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOutUser() {
  if (!sb) return;
  try { await sb.auth.signOut(); } catch (e) { console.error('[auth] signOut', e); }
}

/* Persist onboarding/profile changes (stage, plan, etc.) on the user row. */
async function updateUserRow(userId, patch) {
  if (!sb || !userId) return null;
  const { data, error } = await sb.from('users').update(patch).eq('id', userId).select().maybeSingle();
  if (error) { console.error('[auth] updateUserRow', error); return null; }
  return data;
}

/* Load the currently authenticated profile (or null). */
async function loadCurrentProfile() {
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  let row = await fetchUserRow(user.id);
  // Trigger may not have populated yet on a brand-new account — backfill once.
  if (!row) {
    const md = user.user_metadata || {};
    await sb.from('users').upsert({
      id: user.id, email: user.email,
      name: md.name || 'You', city: md.city || 'somewhere', plan: md.plan || 'annual',
    }).select();
    row = await fetchUserRow(user.id);
  }
  return profileFromRow(row, user);
}

/* ----------------------------------------------------------------
   STRIPE CHECKOUT — calls the `create-checkout-session` Edge Function,
   then redirects with Stripe.js. The webhook flips is_premium server-side.
   ---------------------------------------------------------------- */
async function startCheckout(user, planOverride) {
  if (!isSupabaseConfigured() || !sb) {
    console.warn('[stripe] Supabase not configured — skipping checkout.');
    return false;
  }
  if (!isStripeConfigured()) {
    console.warn('[stripe] Stripe not configured — skipping checkout.');
    return false;
  }
  const plan = planOverride || user?.plan || 'annual';
  const priceId = plan === 'monthly'
    ? CONFIG.STRIPE_MONTHLY_PRICE_ID
    : CONFIG.STRIPE_ANNUAL_PRICE_ID;

  try {
    const { data, error } = await sb.functions.invoke('create-checkout-session', {
      body: {
        priceId,
        plan,
        userId: user?.id || null,
        email: user?.email || null,
        successUrl: window.location.origin + window.location.pathname + '?checkout=success',
        cancelUrl: window.location.origin + window.location.pathname + '?checkout=cancel',
      },
    });
    if (error) throw error;

    // Prefer the session URL (no client key needed); fall back to Stripe.js redirect.
    if (data?.url) { window.location.href = data.url; return true; }
    if (data?.id && window.Stripe) {
      const stripe = window.Stripe(CONFIG.STRIPE_PUBLISHABLE_KEY);
      await stripe.redirectToCheckout({ sessionId: data.id });
      return true;
    }
    console.error('[stripe] Unexpected checkout response:', data);
    return false;
  } catch (e) {
    console.error('[stripe] startCheckout failed:', e);
    return false;
  }
}

Object.assign(window, {
  CONFIG,
  sb,
  isSupabaseConfigured,
  isStripeConfigured,
  timeAgo,
  profileFromRow,
  fetchUserRow,
  signUpUser,
  signInUser,
  signOutUser,
  updateUserRow,
  loadCurrentProfile,
  startCheckout,
});
