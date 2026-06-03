/* app.jsx, root app, routing + tweak panel */

const { useState: useAppState, useEffect: useAppEffect, useCallback: useAppCallback } = React;

const DEFAULT_TWEAKS = /*EDITMODE-BEGIN*/{
  "heroLayout": "asymmetric",
  "startScreen": "landing",
  "trialMode": "premium"
}/*EDITMODE-END*/;

const SCREEN_PATHS = {
  landing: '/',
  signup: '/signup',
  login: '/login',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  'daily-word': '/daily-word',
  'our-story': '/our-story',
  'what-we-believe': '/what-we-believe',
  'the-gospel': '/the-gospel',
  privacy: '/privacy',
  terms: '/terms',
  'community-rules': '/community-rules',
};

const PATH_TO_SCREEN = Object.fromEntries(
  Object.entries(SCREEN_PATHS).map(([screen, path]) => [path, screen])
);

function screenFromPathname(pathname) {
  const path = (pathname || '/').replace(/\/$/, '') || '/';
  return PATH_TO_SCREEN[path] || null;
}

function pathFromScreen(screen) {
  return SCREEN_PATHS[screen] || '/';
}

function getInitialScreen() {
  return screenFromPathname(window.location.pathname) || DEFAULT_TWEAKS.startScreen || 'landing';
}

function scrollToWallThread() {
  setTimeout(() => {
    const headings = [...document.querySelectorAll('h2.serif')];
    const wall = headings.find(h => h.textContent.trim().startsWith('The Wall'));
    wall?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
}

function scrollToPricing() {
  setTimeout(() => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  }, 120);
}

function App() {
  // tweaks
  const [tweaks, setTweak] = useTweaks(DEFAULT_TWEAKS);

  // routing
  const [screen, setScreen] = useState(getInitialScreen);
  const [user, setUser] = useState(null);
  const [trialMode, setTrialMode] = useState(tweaks.trialMode || 'premium');

  // posts state, local, mutable
  const [posts, setPosts] = useState(() => SEED_POSTS.map(p => ({ ...p, reactions: { ...p.reactions } })));

  // pending signup info between signup & onboarding
  const [signupInfo, setSignupInfo] = useState(null);

  // sync from tweaks (respect URL routes when they match the active screen)
  useAppEffect(() => {
    const urlScreen = screenFromPathname(window.location.pathname);
    if (urlScreen && urlScreen === screen) return;
    if (tweaks.startScreen && tweaks.startScreen !== screen) {
      setScreen(tweaks.startScreen);
      if (tweaks.startScreen === 'dashboard' && !user) {
        // auto-create a user so dashboard is viewable
        setUser({ name: 'Marcus', city: 'Houston, TX', stage: 'seeking', plan: 'annual' });
      }
    }
  }, [tweaks.startScreen]);

  useAppEffect(() => {
    if (tweaks.trialMode && tweaks.trialMode !== trialMode) {
      setTrialMode(tweaks.trialMode);
    }
  }, [tweaks.trialMode]);

  // Reload the Wall from Supabase (no-op when not configured).
  const reloadPosts = async (uid) => {
    const data = await dbFetchPosts(uid);
    if (data) setPosts(data);
  };

  // Bootstrap session + live data when Supabase is configured.
  useAppEffect(() => {
    if (!isSupabaseConfigured() || !sb) return;
    let active = true;

    (async () => {
      // Google OAuth return, tokens in hash, ?code=, or redirect from /auth/callback
      if (isOAuthCallbackUrl()) {
        const params = new URLSearchParams(window.location.search);
        const oauthResult = await handleOAuthCallback();
        if (oauthResult && active) {
          const { profile, user: authUser, hasStage } = oauthResult;
          const md = authUser.user_metadata || {};
          setSignupInfo({
            name: profile?.name || md.full_name || authUser.email?.split('@')[0] || 'You',
            city: profile?.city || 'somewhere',
            email: authUser.email || '',
            plan: profile?.plan || 'annual',
          });
          if (profile) {
            setUser(profile);
            const m = profile.is_premium ? 'premium' : 'expired';
            setTrialMode(m); setTweak('trialMode', m);
          }
          await reloadPosts(profile?.id || null);
          const nextScreen = params.get('screen') || (hasStage ? 'dashboard' : 'onboarding');
          setScreen(nextScreen);
          setTweak('startScreen', nextScreen);
          clearOAuthUrlParams();
          return;
        }
      }

      const profile = await loadCurrentProfile();
      if (!active) return;
      if (profile) {
        setUser(profile);
        const m = profile.is_premium ? 'premium' : 'expired';
        setTrialMode(m); setTweak('trialMode', m);
      }
      await reloadPosts(profile?.id || null);

      // Returning from Stripe Checkout, give the webhook a moment, then refresh.
      const params = new URLSearchParams(window.location.search);
      if (params.get('checkout') === 'success') {
        setTimeout(async () => {
          const p = await loadCurrentProfile();
          if (p && active) {
            setUser(p);
            const m = p.is_premium ? 'premium' : 'expired';
            setTrialMode(m); setTweak('trialMode', m);
          }
        }, 1800);
      }
    })();

    const { data: authSub } = sb.auth.onAuthStateChange(async (_evt, session) => {
      if (!active) return;
      if (session?.user) {
        const p = await loadCurrentProfile();
        if (p) {
          setUser(p);
          const m = p.is_premium ? 'premium' : 'expired';
          setTrialMode(m); setTweak('trialMode', m);
        }
        await reloadPosts(session.user.id);
      } else {
        await reloadPosts(null);
      }
    });

    return () => { active = false; authSub?.subscription?.unsubscribe?.(); };
  }, []);

  // navigation
  const navigate = useAppCallback((to, opts = {}) => {
    if (to === 'landing') {
      // logout when going home
      if (user) {
        setUser(null);
        if (isSupabaseConfigured()) signOutUser();
      }
    }
    setScreen(to);
    setTweak('startScreen', to);

    const path = pathFromScreen(to);
    const hash = opts.hash || (to === 'landing' && window.location.hash === '#pricing' ? '#pricing' : '');
    const url = path + hash;
    if (opts.replace) {
      window.history.replaceState({ screen: to }, '', url);
    } else {
      window.history.pushState({ screen: to }, '', url);
    }

    if (to === 'landing' && (hash === '#pricing' || window.location.hash === '#pricing')) {
      scrollToPricing();
    } else if (to === 'dashboard' && window.cdddScrollToWall) {
      window.cdddScrollToWall = false;
      scrollToWallThread();
    } else if (to !== 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [user, setTweak]);

  useAppEffect(() => {
    window.cdddNavigate = navigate;
    window.cdddUser = user;
    window.cdddScreen = screen;
  }, [navigate, user, screen]);

  // Browser back/forward
  useAppEffect(() => {
    const onPop = () => {
      const next = screenFromPathname(window.location.pathname) || 'landing';
      setScreen(next);
      setTweak('startScreen', next);
      if (window.location.hash === '#pricing' && next === 'landing') scrollToPricing();
      if (next === 'dashboard' && window.cdddScrollToWall) {
        window.cdddScrollToWall = false;
        scrollToWallThread();
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [setTweak]);

  // Deep link: /#pricing on first load
  useAppEffect(() => {
    if (window.location.hash !== '#pricing') return;
    const pathScreen = screenFromPathname(window.location.pathname);
    if (pathScreen && pathScreen !== 'landing') {
      window.location.href = '/#pricing';
      return;
    }
    if (screen === 'landing') scrollToPricing();
  }, [screen]);

  const handleSignup = async (info) => {
    setSignupInfo(info);
    if (isSupabaseConfigured()) {
      try {
        await signUpUser({
          email: info.email, password: info.password,
          name: info.name, city: info.city, plan: info.plan,
        });
      } catch (e) { console.error('[signup]', e); }
    }
    navigate('onboarding');
  };

  const handleLogin = async (info) => {
    if (isSupabaseConfigured()) {
      try {
        await signInUser({ email: info.email, password: info.password });
        const profile = await loadCurrentProfile();
        if (profile) {
          setUser(profile);
          const m = profile.is_premium ? 'premium' : 'expired';
          setTrialMode(m); setTweak('trialMode', m);
          await reloadPosts(profile.id);
          navigate('dashboard');
          return;
        }
      } catch (e) { console.error('[login]', e); }
    }
    // fallback (unconfigured / failed): original mock behavior
    setUser({ name: 'Marcus', city: 'Houston, TX', stage: 'seeking', plan: 'annual' });
    navigate('dashboard');
  };

  const handleOnboardingComplete = async (stage) => {
    if (isSupabaseConfigured()) {
      const profile = await loadCurrentProfile();
      if (profile) {
        await updateUserRow(profile.id, { stage });
        const updated = { ...profile, stage };
        setUser(updated);
        const m = updated.is_premium ? 'premium' : 'expired';
        setTrialMode(m); setTweak('trialMode', m);
        await reloadPosts(profile.id);
        navigate('dashboard');
        return;
      }
    }
    // fallback (unconfigured / no session yet): original mock behavior
    setUser({
      name: signupInfo?.name || 'You',
      city: signupInfo?.city || 'somewhere',
      stage,
      plan: signupInfo?.plan || 'annual',
    });
    setTrialMode('premium');
    setTweak('trialMode', 'premium');
    navigate('dashboard');
  };

  const handleReact = (postId, kind) => {
    const target = posts.find(p => p.id === postId);
    const prevReaction = target ? target.userReaction : null;

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const next = { ...p, reactions: { ...p.reactions } };
      // toggle off if same
      if (p.userReaction === kind) {
        next.reactions[kind] = Math.max(0, p.reactions[kind] - 1);
        next.userReaction = null;
      } else {
        if (p.userReaction) {
          next.reactions[p.userReaction] = Math.max(0, p.reactions[p.userReaction] - 1);
        }
        next.reactions[kind] = (p.reactions[kind] || 0) + 1;
        next.userReaction = kind;
      }
      return next;
    }));

    if (isSupabaseConfigured() && user?.id) {
      dbToggleReaction({ postId, userId: user.id, kind, current: prevReaction }).catch(console.error);
    }
  };

  const handleSubmitPost = ({ body, category, stage }) => {
    const me = user || { name: 'You', city: 'here', stage: 'seeking' };
    const tempId = 'me-' + Date.now();
    const newPost = {
      id: tempId,
      name: me.name || 'You',
      location: me.city || 'here',
      time: 'just now',
      stage: stage || me.stage,
      category,
      body,
      reactions: { praying: 0, with_you: 0, amen: 0 },
      userReaction: null,
      replies: [],
    };
    setPosts(prev => [newPost, ...prev]);

    if (isSupabaseConfigured() && user?.id) {
      dbCreatePost({
        userId: user.id, name: me.name, location: me.city,
        stage: stage || me.stage, category, body,
      })
        .then(saved => { if (saved) setPosts(prev => prev.map(p => (p.id === tempId ? saved : p))); })
        .catch(console.error);
    }
  };

  const handleReply = (postId, body) => {
    const me = user || { name: 'You', city: 'here', stage: 'seeking' };
    const tempId = 'r-' + Date.now();
    const newReply = {
      id: tempId,
      name: me.name || 'You',
      location: me.city || 'here',
      stage: me.stage || 'seeking',
      time: 'just now',
      body,
      reactions: { praying: 0, with_you: 0, amen: 0 },
      userReaction: null,
    };
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, replies: [...(p.replies || []), newReply] } : p
    ));

    if (isSupabaseConfigured() && user?.id) {
      dbCreateReply({
        postId, userId: user.id, name: me.name, location: me.city,
        stage: me.stage, body,
      })
        .then(saved => {
          if (saved) setPosts(prev => prev.map(p =>
            p.id === postId
              ? { ...p, replies: (p.replies || []).map(r => (r.id === tempId ? saved : r)) }
              : p
          ));
        })
        .catch(console.error);
    }
  };

  const handleReplyReact = (postId, replyId, kind) => {
    const targetPost = posts.find(p => p.id === postId);
    const targetReply = targetPost && (targetPost.replies || []).find(r => r.id === replyId);
    const prevReaction = targetReply ? targetReply.userReaction : null;

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const replies = (p.replies || []).map(r => {
        if (r.id !== replyId) return r;
        const next = { ...r, reactions: { ...r.reactions } };
        if (r.userReaction === kind) {
          next.reactions[kind] = Math.max(0, r.reactions[kind] - 1);
          next.userReaction = null;
        } else {
          if (r.userReaction) {
            next.reactions[r.userReaction] = Math.max(0, r.reactions[r.userReaction] - 1);
          }
          next.reactions[kind] = (r.reactions[kind] || 0) + 1;
          next.userReaction = kind;
        }
        return next;
      });
      return { ...p, replies };
    }));

    if (isSupabaseConfigured() && user?.id) {
      dbToggleReplyReaction({ replyId, userId: user.id, kind, current: prevReaction }).catch(console.error);
    }
  };

  const handleSubscribe = () => {
    if (isSupabaseConfigured() && isStripeConfigured()) {
      // Redirects to Stripe on success; is_premium is flipped by the webhook.
      startCheckout(user, user?.plan).then(ok => {
        if (!ok) { setTrialMode('premium'); setTweak('trialMode', 'premium'); }
      });
      return;
    }
    // fallback (unconfigured): original mock unlock
    setTrialMode('premium');
    setTweak('trialMode', 'premium');
  };

  // Subscribe link inside locked ReplyComposer dispatches this event
  useAppEffect(() => {
    const sub = () => handleSubscribe();
    window.addEventListener('cddd:subscribe', sub);
    return () => window.removeEventListener('cddd:subscribe', sub);
  }, []);

  // active screen
  let view;
  if (screen === 'landing') {
    view = <LandingPage tweaks={tweaks} onNav={navigate} demoPosts={posts} />;
  } else if (screen === 'daily-word') {
    view = <DailyWordPage user={user} onNav={navigate} />;
  } else if (screen === 'our-story') {
    view = <OurStoryPage user={user} onNav={navigate} />;
  } else if (screen === 'what-we-believe') {
    view = <WhatWeBelievePage user={user} onNav={navigate} />;
  } else if (screen === 'the-gospel') {
    view = <TheGospelPage user={user} onNav={navigate} />;
  } else if (screen === 'privacy') {
    view = <PrivacyPage user={user} onNav={navigate} />;
  } else if (screen === 'terms') {
    view = <TermsPage user={user} onNav={navigate} />;
  } else if (screen === 'community-rules') {
    view = <CommunityRulesPage user={user} onNav={navigate} />;
  } else if (screen === 'signup') {
    view = <SignupPage mode="signup" onComplete={handleSignup} onNav={navigate} />;
  } else if (screen === 'login') {
    view = <SignupPage mode="login" onComplete={handleLogin} onNav={navigate} />;
  } else if (screen === 'onboarding') {
    view = <OnboardingPage onComplete={handleOnboardingComplete} onNav={navigate} />;
  } else if (screen === 'dashboard') {
    const activeUser = user || { name: 'Marcus', city: 'Houston, TX', stage: 'seeking', plan: 'annual' };
    view = (
      <DashboardPage
        user={activeUser}
        mode={trialMode}
        posts={posts}
        onReact={handleReact}
        onReply={handleReply}
        onReplyReact={handleReplyReact}
        onSubmitPost={handleSubmitPost}
        onNav={navigate}
        onSubscribe={handleSubscribe}
      />
    );
  }

  return (
    <div>
      {view}
      <TweaksUI
        tweaks={tweaks} setTweak={setTweak}
        screen={screen}
        navigate={navigate}
        user={user}
        setUser={setUser}
        trialMode={trialMode}
        setTrialMode={(m) => { setTrialMode(m); setTweak('trialMode', m); }}
      />
    </div>
  );
}

/* ----------------------------------------------------------------
   TWEAKS PANEL UI
   ---------------------------------------------------------------- */
function TweaksUI({ tweaks, setTweak, screen, navigate, user, setUser, trialMode, setTrialMode }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Jump to screen" />
      <TweakRadio
        value={screen}
        onChange={(v) => navigate(v)}
        options={[
          { value: 'landing',    label: 'Landing' },
          { value: 'signup',     label: 'Sign up' },
          { value: 'onboarding', label: 'Onboard' },
          { value: 'dashboard',  label: 'Dashboard' },
        ]}
      />

      {screen === 'landing' && (
        <>
          <TweakSection label="Hero layout" />
          <TweakRadio
            value={tweaks.heroLayout}
            onChange={(v) => setTweak('heroLayout', v)}
            options={[
              { value: 'centered',   label: 'Centered' },
              { value: 'asymmetric', label: 'Asymmetric' },
              { value: 'verse',      label: 'Verse' },
            ]}
          />
          <div style={{ fontSize: 11, color: 'rgba(41,38,27,.55)', lineHeight: 1.4, marginTop: -2 }}>
            Three hero compositions to compare.
          </div>
        </>
      )}

      {screen === 'dashboard' && (
        <>
          <TweakSection label="Account state" />
          <TweakRadio
            value={trialMode}
            onChange={setTrialMode}
            options={[
              { value: 'premium', label: 'Premium' },
              { value: 'expired', label: 'Trial ended' },
            ]}
          />
          <div style={{ fontSize: 11, color: 'rgba(41,38,27,.55)', lineHeight: 1.4, marginTop: -2 }}>
            Daily Word always stays open.
          </div>
        </>
      )}

      {screen === 'dashboard' && user && (
        <>
          <TweakSection label="Your life stage" />
          <TweakRadio
            value={user.stage}
            onChange={(v) => setUser({ ...user, stage: v })}
            options={STAGE_ORDER.map(id => ({
              value: id,
              label: STAGES[id].label,
            }))}
          />
        </>
      )}
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
