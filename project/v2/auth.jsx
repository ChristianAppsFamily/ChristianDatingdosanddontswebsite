/* auth.jsx — sign up / sign in / onboarding (wired to Supabase when configured) */
function AuthPage({ mode, onComplete, onNav }) {
  const isSignup = mode === 'signup';
  const [f, setF] = useState({ name: '', city: '', email: '', password: '' });
  const [plan, setPlan] = useState('annual');
  const [tried, setTried] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState(null);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const emailBad = tried && !/^\S+@\S+\.\S+$/.test(f.email);
  const submit = e => {
    e.preventDefault(); setTried(true);
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return;
    onComplete({
      name: f.name.trim() || 'You',
      city: f.city.trim() || 'somewhere',
      email: f.email.trim(),
      password: f.password,
      plan,
    });
  };
  const handleGoogle = async () => {
    if (typeof isSupabaseConfigured !== 'function' || !isSupabaseConfigured()) {
      setGoogleError('Something went wrong. Please try again.');
      return;
    }
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google auth error:', err);
      setGoogleError('Something went wrong. Please try again.');
      setGoogleLoading(false);
    }
  };
  return (
    <div className="auth" data-screen-label={isSignup ? '02 Sign up' : '02 Sign in'}>
      <div className="auth-main">
        <div className="auth-top">
          <Brand onClick={() => onNav('landing')} />
          <button className="btn btn-text btn-sm" onClick={() => onNav('landing')}><Icon name="arrow-left" /> Back</button>
        </div>
        <form className="auth-form rise" onSubmit={submit} noValidate>
          <p className="mk-mark">{isSignup ? 'New here' : 'Welcome back'}</p>
          <h1 className="display">{isSignup ? 'Start your free trial.' : 'Sign in to the Table.'}</h1>
          <p className="lead">{isSignup ? 'Seven days free. Cancel anytime. We never share your name beyond first name + city.' : 'Pick up right where you left off.'}</p>

          <button type="button" className="btn btn-line btn-block" disabled={googleLoading} onClick={handleGoogle} style={{ marginTop: 8 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
            </svg>
            {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
          </button>
          {googleError && <p className="hint" style={{ color: 'var(--error)', marginTop: -4 }}>Something went wrong. Try again.</p>}

          <div className="auth-or" aria-hidden="true"><span>or continue with email</span></div>

          {isSignup && <>
            <div className="field"><label htmlFor="a-name">First name</label><input id="a-name" className="input" value={f.name} onChange={set('name')} placeholder="Marcus" autoComplete="given-name" /></div>
            <div className="field"><label htmlFor="a-city">City</label><input id="a-city" className="input" value={f.city} onChange={set('city')} placeholder="Houston, TX" aria-describedby="a-city-h" /><span className="hint" id="a-city-h">Only your first name + city are ever shown publicly.</span></div>
          </>}
          <div className="field">
            <label htmlFor="a-email">Email</label>
            <input id="a-email" className="input" type="email" value={f.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" aria-invalid={emailBad} aria-describedby={emailBad ? 'a-email-e' : undefined} />
            {emailBad && <span className="hint" id="a-email-e" style={{ color: 'var(--error)' }}>Enter an email address like you@example.com.</span>}
          </div>
          <div className="field"><label htmlFor="a-pw">Password</label><input id="a-pw" className="input" type="password" value={f.password} onChange={set('password')} placeholder="••••••••" autoComplete={isSignup ? 'new-password' : 'current-password'} /></div>
          {isSignup && (
            <div className="field">
              <span className="lbl" id="plan-lbl">Choose a plan</span>
              <div className="plans" role="radiogroup" aria-labelledby="plan-lbl">
                {[['monthly', 'Monthly', '$6.99/mo'], ['annual', 'Annual', '$49/yr', 'Save 42%']].map(([id, l, p, tag]) => (
                  <button type="button" key={id} className="plan-opt" role="radio" aria-checked={plan === id} onClick={() => setPlan(id)}>
                    <b>{l}</b><span>{p}</span>{tag && <em>{tag}</em>}
                    <span className="radio">{plan === id && <Icon name="check" />}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 8 }}>{isSignup ? 'Continue' : 'Sign in'}</button>
          <p className="switch-line">{isSignup ? 'Already a member? ' : 'New here? '}<button type="button" onClick={() => onNav(isSignup ? 'login' : 'signup')}>{isSignup ? 'Sign in' : 'Start free trial'}</button></p>
        </form>
      </div>
      <aside className="auth-side inverse" aria-label="From the community">
        <p className="mk-mark">From the Table this morning</p>
        <blockquote>“Single brothers — stop praying for a wife while you're still avoiding the work of becoming a husband. The waiting is the workshop.”</blockquote>
        <cite><b>Tomás</b> — California <StageBadge stage="seeking" /></cite>
        <div className="auth-stats">
          <div><b>2,400+</b><span>members</span></div>
          <div><b>140</b><span>posts this week</span></div>
          <div><b>4</b><span>life stages</span></div>
        </div>
      </aside>
    </div>
  );
}

function Onboarding({ onComplete, onNav }) {
  const [sel, setSel] = useState(null);
  const [busy, setBusy] = useState(false);
  const go = () => { if (!sel) return; setBusy(true); setTimeout(() => onComplete(sel), 320); };
  const onKey = e => {
    const i = STAGE_ORDER.indexOf(sel);
    if (['ArrowDown', 'ArrowRight'].includes(e.key)) { e.preventDefault(); setSel(STAGE_ORDER[(i + 1) % 4]); }
    if (['ArrowUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); setSel(STAGE_ORDER[(i + 3) % 4]); }
  };
  return (
    <div className="onb" data-screen-label="03 Onboarding">
      <header className="onb-top"><div className="wrap"><Brand onClick={() => onNav('landing')} /><div className="progress">Step 1 of 1 <i></i></div></div></header>
      <main className="onb-main">
        <div className="wrap"><div className="onb-inner rise">
          <p className="mk-mark">One quiet question</p>
          <h1 className="display">Where are you right now?</h1>
          <p className="onb-lead">We'll tune your daily word, your weekly prompt, and your table to the season you're actually in. You can change this anytime.</p>
          <div className="stage-grid" role="radiogroup" aria-label="Your life stage" onKeyDown={onKey}>
            {STAGE_ORDER.map(id => {
              const s = STAGES[id];
              return (
                <button key={id} className="stage-opt" data-s={id} role="radio" aria-checked={sel === id} tabIndex={sel ? (sel === id ? 0 : -1) : (id === 'seeking' ? 0 : -1)} onClick={() => setSel(id)}>
                  <span className="stage-ico"><Icon name={s.icon} /></span>
                  <span><h3>{s.label}</h3><p>{s.note}</p></span>
                  <span className="radio">{sel === id && <Icon name="check" />}</span>
                </button>
              );
            })}
          </div>
          <div className="onb-foot">
            <button className="btn btn-primary" style={{ minWidth: 240 }} disabled={!sel || busy} onClick={go}>{busy ? 'One moment…' : <>Continue <Icon name="arrow-right" /></>}</button>
            <p>Anonymous to other members. Only first name + city ever appear on the Table.</p>
          </div>
        </div></div>
      </main>
    </div>
  );
}

Object.assign(window, { AuthPage, Onboarding });
