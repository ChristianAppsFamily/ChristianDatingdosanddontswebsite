/* app.jsx — root routing + Supabase/Stripe handlers + Sunlight screens */

const { useCallback: useAppCallback } = React;

const DEFAULT_TWEAKS = /*EDITMODE-BEGIN*/{
  "startScreen": "landing",
  "trialMode": "premium"
}/*EDITMODE-END*/;

const MEMBER_ROUTES = ['dashboard', 'table', 'word', 'journal', 'library'];

const SCREEN_PATHS = {
  landing: '/',
  signup: '/signup',
  login: '/login',
  onboarding: '/onboarding',
  dashboard: '/dashboard',
  table: '/dashboard',
  word: '/word',
  journal: '/journal',
  library: '/library',
  'daily-word': '/daily-word',
  'our-story': '/our-story',
  'what-we-believe': '/what-we-believe',
  'the-gospel': '/the-gospel',
  privacy: '/privacy',
  terms: '/terms',
  'community-rules': '/community-rules',
};

const PATH_TO_SCREEN = {
  '/': 'landing',
  '/signup': 'signup',
  '/login': 'login',
  '/onboarding': 'onboarding',
  '/dashboard': 'dashboard',
  '/word': 'word',
  '/journal': 'journal',
  '/library': 'library',
  '/daily-word': 'daily-word',
  '/our-story': 'our-story',
  '/what-we-believe': 'what-we-believe',
  '/the-gospel': 'the-gospel',
  '/privacy': 'privacy',
  '/terms': 'terms',
  '/community-rules': 'community-rules',
};

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

function scrollToTableFeed() {
  setTimeout(() => {
    const el = document.getElementById('tbl-h') || document.querySelector('.tbl-feed');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
}

function scrollToPricing() {
  setTimeout(() => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  }, 120);
}

function storageKey(user, kind) {
  const id = user?.id || user?.email || user?.name || 'guest';
  return `cddd:${kind}:${id}`;
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch (e) {
    return fallback;
  }
}

function saveJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

function tweaksEnabled() {
  try {
    return new URLSearchParams(window.location.search).get('tweaks') === '1';
  } catch (e) {
    return false;
  }
}

function App() {
  const [tweaks, setTweak] = useTweaks(DEFAULT_TWEAKS);
  const [screen, setScreen] = useState(getInitialScreen);
  const [user, setUser] = useState(null);
  const [trialMode, setTrialMode] = useState(tweaks.trialMode || 'premium');
  const [posts, setPosts] = useState(() => SEED_POSTS.map(p => ({
    ...p,
    reactions: { ...p.reactions },
    replies: (p.replies || []).map(r => ({ ...r, reactions: { ...r.reactions } })),
  })));
  const [signupInfo, setSignupInfo] = useState(null);
  const [saved, setSaved] = useState([]);
  const [entries, setEntries] = useState([]);
  const [toast, setToast] = useState(null);
  const showTweaks = tweaksEnabled();

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    const urlScreen = screenFromPathname(window.location.pathname);
    if (urlScreen && urlScreen === screen) return;
    if (tweaks.startScreen && tweaks.startScreen !== screen) {
      setScreen(tweaks.startScreen);
      if (MEMBER_ROUTES.includes(tweaks.startScreen) && !user) {
        setUser({ name: 'Marcus', city: 'Houston, TX', stage: 'seeking', plan: 'annual' });
      }
    }
  }, [tweaks.startScreen]);

  useEffect(() => {
    if (tweaks.trialMode && tweaks.trialMode !== trialMode) {
      setTrialMode(tweaks.trialMode);
    }
  }, [tweaks.trialMode]);

  useEffect(() => {
    if (!user) {
      setSaved([]);
      setEntries([]);
      return;
    }
    setSaved(loadJson(storageKey(user, 'saved'), []));
    setEntries(loadJson(storageKey(user, 'entries'), []));
  }, [user?.id, user?.email, user?.name]);

  const reloadPosts = async (uid) => {
    const data = await dbFetchPosts(uid);
    if (data) setPosts(data);
  };

  useEffect(() => {
    if (!isSupabaseConfigured() || !sb) return;
    let active = true;

    (async () => {
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

  const navigate = useAppCallback((to, opts = {}) => {
    let next = to === 'table' ? 'dashboard' : to;
    if (next === 'landing' && user) {
      setUser(null);
      if (isSupabaseConfigured()) signOutUser();
    }
    setScreen(next);
    setTweak('startScreen', next);

    const path = pathFromScreen(next);
    const hash = opts.hash || (next === 'landing' && window.location.hash === '#pricing' ? '#pricing' : '');
    const url = path + hash;
    if (opts.replace) {
      window.history.replaceState({ screen: next }, '', url);
    } else {
      window.history.pushState({ screen: next }, '', url);
    }

    if (next === 'landing' && (hash === '#pricing' || window.location.hash === '#pricing')) {
      scrollToPricing();
    } else if (next === 'dashboard' && window.cdddScrollToWall) {
      window.cdddScrollToWall = false;
      scrollToTableFeed();
    } else if (next !== 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [user, setTweak]);

  useEffect(() => {
    window.cdddNavigate = navigate;
    window.cdddUser = user;
    window.cdddScreen = screen;
  }, [navigate, user, screen]);

  useEffect(() => {
    const onPop = () => {
      const next = screenFromPathname(window.location.pathname) || 'landing';
      setScreen(next);
      setTweak('startScreen', next);
      if (window.location.hash === '#pricing' && next === 'landing') scrollToPricing();
      if (next === 'dashboard' && window.cdddScrollToWall) {
        window.cdddScrollToWall = false;
        scrollToTableFeed();
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [setTweak]);

  useEffect(() => {
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
    setToast('Shared with the Table');
    if (isSupabaseConfigured() && user?.id) {
      dbCreatePost({
        userId: user.id, name: me.name, location: me.city,
        stage: stage || me.stage, category, body,
      })
        .then(savedPost => { if (savedPost) setPosts(prev => prev.map(p => (p.id === tempId ? savedPost : p))); })
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
        .then(savedReply => {
          if (savedReply) setPosts(prev => prev.map(p =>
            p.id === postId
              ? { ...p, replies: (p.replies || []).map(r => (r.id === tempId ? savedReply : r)) }
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
      startCheckout(user, user?.plan).then(ok => {
        if (!ok) { setTrialMode('premium'); setTweak('trialMode', 'premium'); }
      });
      return;
    }
    setTrialMode('premium');
    setTweak('trialMode', 'premium');
    setToast('Welcome to the Table');
  };

  useEffect(() => {
    const sub = () => handleSubscribe();
    window.addEventListener('cddd:subscribe', sub);
    return () => window.removeEventListener('cddd:subscribe', sub);
  }, [user, trialMode]);

  const onSaveWord = (w) => {
    setSaved(s => {
      const has = s.includes(w.reference);
      const next = has ? s.filter(x => x !== w.reference) : [...s, w.reference];
      if (user) saveJson(storageKey(user, 'saved'), next);
      setToast(has ? 'Removed from your library' : 'Saved to your library');
      return next;
    });
  };

  const onSaveEntry = (e) => {
    setEntries(x => {
      const next = [e, ...x];
      if (user) saveJson(storageKey(user, 'entries'), next);
      setToast('Saved to your reflections');
      return next;
    });
  };

  const expired = trialMode === 'expired';
  const activeUser = user || { name: 'Marcus', city: 'Houston, TX', stage: 'seeking', plan: 'annual' };
  const shellUser = { ...activeUser, plan: expired ? 'expired' : activeUser.plan };
  const memberHandlers = {
    subscribe: handleSubscribe,
    react: handleReact,
    replyReact: handleReplyReact,
    reply: handleReply,
    post: handleSubmitPost,
  };

  let view;
  if (screen === 'landing') {
    view = <Landing onNav={navigate} posts={posts} />;
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
    view = <AuthPage key="signup" mode="signup" onComplete={handleSignup} onNav={navigate} />;
  } else if (screen === 'login') {
    view = <AuthPage key="login" mode="login" onComplete={handleLogin} onNav={navigate} />;
  } else if (screen === 'onboarding') {
    view = <Onboarding onComplete={handleOnboardingComplete} onNav={navigate} />;
  } else if (MEMBER_ROUTES.includes(screen)) {
    const route = screen === 'dashboard' || screen === 'table' ? 'table' : screen;
    view = (
      <AppShell user={shellUser} route={route} onNav={navigate}>
        {route === 'table' && (
          <TablePage
            user={activeUser}
            expired={expired}
            posts={posts}
            saved={saved}
            onSave={onSaveWord}
            h={memberHandlers}
            onNav={navigate}
          />
        )}
        {route === 'word' && (
          <WordPage user={activeUser} saved={saved} onSave={onSaveWord} onNav={navigate} />
        )}
        {route === 'journal' && (
          <JournalPage user={activeUser} entries={entries} onSaveEntry={onSaveEntry} onNav={navigate} />
        )}
        {route === 'library' && (
          <LibraryPage saved={saved} entries={entries} onNav={navigate} />
        )}
      </AppShell>
    );
  }

  return (
    <div>
      {view}
      <Toast msg={toast} />
      {showTweaks && (
        <TweaksPanel title="Tweaks">
          <TweakSection label="Jump to screen" />
          <TweakRadio
            value={screen === 'table' ? 'dashboard' : screen}
            onChange={(v) => navigate(v)}
            options={[
              { value: 'landing', label: 'Landing' },
              { value: 'signup', label: 'Sign up' },
              { value: 'onboarding', label: 'Onboard' },
              { value: 'dashboard', label: 'The Table' },
              { value: 'word', label: 'Daily Word' },
              { value: 'journal', label: 'Journal' },
              { value: 'library', label: 'Library' },
            ]}
          />
          {(screen === 'dashboard' || screen === 'table' || screen === 'word' || screen === 'journal' || screen === 'library') && (
            <>
              <TweakSection label="Account state" />
              <TweakRadio
                value={trialMode}
                onChange={(m) => { setTrialMode(m); setTweak('trialMode', m); }}
                options={[
                  { value: 'premium', label: 'Premium' },
                  { value: 'expired', label: 'Trial ended' },
                ]}
              />
              {user && (
                <>
                  <TweakSection label="Your life stage" />
                  <TweakRadio
                    value={user.stage}
                    onChange={(v) => setUser({ ...user, stage: v })}
                    options={STAGE_ORDER.map(id => ({ value: id, label: STAGES[id].label }))}
                  />
                </>
              )}
            </>
          )}
        </TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
