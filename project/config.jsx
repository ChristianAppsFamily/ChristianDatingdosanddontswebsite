/* config.jsx — backend wiring: Supabase client + auth/payment helpers

   Supabase is live for this site (project: Christian Dating Coach AI / website schema).
   Stripe keys stay placeholders until products/prices are created — see BACKEND.md.
   Optional overrides: window.__CDDD_CONFIG__ = { SUPABASE_URL, ... } before this script.
*/

const CONFIG = Object.assign({
  // SUPABASE (anon key is public by design)
  SUPABASE_URL: 'https://tgacfeisoaonzushuugh.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnYWNmZWlzb2Fvbnp1c2h1dWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4ODk0MTQsImV4cCI6MjExMDQ2NTQxNH0.6HLWFNUA8tP4SnBABlsr3ZSrgo2jN15cNfiZ7rOE5wY',

  // STRIPE — fill after creating products (see BACKEND.md)
  STRIPE_PUBLISHABLE_KEY: 'pk_test_YOUR_STRIPE_KEY',
  STRIPE_MONTHLY_PRICE_ID: 'price_XXX_MONTHLY',
  STRIPE_ANNUAL_PRICE_ID: 'price_XXX_ANNUAL',

  // APP STORE
  APP_STORE_URL: 'https://apps.apple.com/us/app/christian-dating-dos-and-donts/id911295588',
}, (typeof window !== 'undefined' && window.__CDDD_CONFIG__) || {});

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
    !CONFIG.STRIPE_PUBLISHABLE_KEY.includes('YOUR_STRIPE_KEY') &&
    !!CONFIG.STRIPE_MONTHLY_PRICE_ID &&
    !CONFIG.STRIPE_MONTHLY_PRICE_ID.includes('XXX') &&
    !!CONFIG.STRIPE_ANNUAL_PRICE_ID &&
    !CONFIG.STRIPE_ANNUAL_PRICE_ID.includes('XXX')
  );
}

let sb = null;
if (isSupabaseConfigured() && typeof window !== 'undefined' && window.supabase) {
  try {
    sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  } catch (e) {
    console.error('[config] Failed to create Supabase client:', e);
    sb = null;
  }
}

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

function profileFromRow(row, authUser) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || 'You',
    city: row.city || 'somewhere',
    stage: row.stage || null,
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

function authErrorMessage(err) {
  const msg = (err && (err.message || err.error_description || err.msg)) || String(err || 'Something went wrong');
  if (/invalid login credentials/i.test(msg)) return 'Email or password is incorrect.';
  if (/email not confirmed/i.test(msg)) return 'Confirm your email first. Check your inbox for the link.';
  if (/user already registered/i.test(msg)) return 'An account with that email already exists. Sign in instead.';
  if (/password/i.test(msg) && /least/i.test(msg)) return 'Password must be at least 6 characters.';
  if (/rate limit|too many/i.test(msg)) return 'Too many attempts. Wait a moment and try again.';
  return msg;
}

async function signUpUser({ email, password, name, city, plan }) {
  if (!sb) throw new Error('Supabase not configured');
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { name, city, plan },
      emailRedirectTo: (typeof window !== 'undefined' ? window.location.origin : '') + '/auth/callback',
    },
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

async function resetPassword(email) {
  if (!sb) throw new Error('Supabase not configured');
  const redirectTo = (typeof window !== 'undefined' ? window.location.origin : '') + '/auth/callback?reset=1';
  const { data, error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
  return data;
}

async function signOutUser() {
  if (!sb) return;
  try { await sb.auth.signOut(); } catch (e) { console.error('[auth] signOut', e); }
}

function getOAuthRedirectUrl() {
  return window.location.origin + '/auth/callback';
}

async function signInWithGoogle() {
  if (!sb) throw new Error('Supabase not configured');
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: getOAuthRedirectUrl() },
  });
  if (error) throw error;
}

async function upsertGoogleUser(user) {
  if (!sb || !user?.id) return;
  const md = user.user_metadata || {};
  const name = md.full_name || md.name || user.email?.split('@')[0] || 'You';
  const { error } = await sb.from('users').upsert(
    { id: user.id, email: user.email, name },
    { onConflict: 'id', ignoreDuplicates: true },
  );
  if (error) console.error('[auth] upsertGoogleUser', error);
}

function isOAuthCallbackUrl() {
  const hash = window.location.hash || '';
  const params = new URLSearchParams(window.location.search);
  return (
    hash.includes('access_token') ||
    hash.includes('refresh_token') ||
    params.has('code') ||
    params.get('oauth') === '1'
  );
}

async function handleOAuthCallback() {
  if (!sb) return null;
  const { data: { session }, error } = await sb.auth.getSession();
  if (error || !session?.user) return null;
  const authUser = session.user;
  await upsertGoogleUser(authUser);
  const row = await fetchUserRow(authUser.id);
  return {
    user: authUser,
    row,
    profile: profileFromRow(row, authUser),
    hasStage: !!row?.stage,
  };
}

function clearOAuthUrlParams() {
  window.history.replaceState({}, '', window.location.pathname);
}

async function updateUserRow(userId, patch) {
  if (!sb || !userId) return null;
  const { data, error } = await sb.from('users').update(patch).eq('id', userId).select().maybeSingle();
  if (error) { console.error('[auth] updateUserRow', error); return null; }
  return data;
}

async function loadCurrentProfile() {
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  let row = await fetchUserRow(user.id);
  if (!row) {
    const md = user.user_metadata || {};
    await sb.from('users').upsert({
      id: user.id, email: user.email,
      name: md.name || md.full_name || 'You',
      city: md.city || 'somewhere',
      plan: md.plan || 'annual',
    }).select();
    row = await fetchUserRow(user.id);
  }
  return profileFromRow(row, user);
}

async function startCheckout(user, planOverride) {
  if (!isSupabaseConfigured() || !sb) {
    console.warn('[stripe] Supabase not configured, skipping checkout.');
    return false;
  }
  if (!isStripeConfigured()) {
    console.warn('[stripe] Stripe not configured, skipping checkout.');
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
        successUrl: window.location.origin + '/dashboard?checkout=success',
        cancelUrl: window.location.origin + '/dashboard?checkout=cancel',
      },
    });
    if (error) throw error;

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
  authErrorMessage,
  signUpUser,
  signInUser,
  resetPassword,
  signOutUser,
  getOAuthRedirectUrl,
  signInWithGoogle,
  upsertGoogleUser,
  isOAuthCallbackUrl,
  handleOAuthCallback,
  clearOAuthUrlParams,
  updateUserRow,
  loadCurrentProfile,
  startCheckout,
});
