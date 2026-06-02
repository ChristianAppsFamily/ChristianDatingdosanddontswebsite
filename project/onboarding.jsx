/* onboarding.jsx — single screen, 2x2 stage selection */

function OnboardingPage({ onComplete, onNav }) {
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = () => {
    if (!selected) return;
    setSubmitting(true);
    setTimeout(() => onComplete(selected), 360);
  };

  return (
    <div data-screen-label="03 Onboarding" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MinimalNav step={1} totalSteps={1} onNav={onNav} />
      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px 72px',
      }}>
        <div style={{ maxWidth: 820, width: '100%' }} className="fade-in">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>One quiet question</div>
            <h1 className="serif" style={{
              margin: 0, fontSize: 'clamp(36px, 4.6vw, 60px)', lineHeight: 1.05,
              fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)',
              textWrap: 'balance',
            }}>
              Where are you <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--orange)' }}>right now?</span>
            </h1>
            <p style={{
              margin: '14px auto 0', maxWidth: 480,
              fontSize: 16.5, color: 'var(--ink-soft)', lineHeight: 1.55,
            }}>
              We'll tune your daily word, your weekly prompt, and your wall to the season you're actually in. You can change this anytime.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 18,
            marginBottom: 36,
          }}>
            {STAGE_ORDER.map(id => (
              <StageCard
                key={id}
                stage={STAGES[id]}
                selected={selected === id}
                onClick={() => setSelected(id)}
              />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              className="btn btn-primary btn-lg"
              disabled={!selected || submitting}
              onClick={submit}
              style={{
                minWidth: 220,
                opacity: selected ? 1 : 0.45,
                cursor: selected ? 'pointer' : 'not-allowed',
                transform: submitting ? 'scale(0.97)' : 'scale(1)',
              }}
            >
              {submitting ? 'One moment…' : 'Continue'}
              {!submitting && <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>
          </div>

          <p style={{
            textAlign: 'center', marginTop: 22,
            fontSize: 13, color: 'var(--ink-mute)',
          }}>
            Anonymous to other members. Only first name + city ever appear on the Wall.
          </p>
        </div>
      </main>
    </div>
  );
}

function StageCard({ stage, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        textAlign: 'left',
        background: 'var(--white)',
        border: selected ? '2px solid var(--orange)' : '2px solid transparent',
        borderRadius: 'var(--r-lg)',
        padding: '28px 26px',
        boxShadow: selected ? '0 0 0 6px rgba(200, 98, 42, 0.10), var(--shadow-card)' : 'var(--shadow-card)',
        cursor: 'pointer',
        transition: 'all 200ms cubic-bezier(.2,.7,.2,1)',
        transform: selected ? 'translateY(-2px)' : 'translateY(0)',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 18,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 'var(--r-md)',
          background: stage.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, flexShrink: 0,
        }}>{stage.glyph}</div>
        <div style={{ flex: 1 }}>
          <h3 className="serif" style={{
            margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: '-0.015em',
            color: 'var(--ink)', lineHeight: 1.15,
          }}>{stage.label}</h3>
          <p style={{
            margin: '6px 0 0', fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.5,
          }}>{stage.note}</p>
        </div>
        <CheckCircle on={selected} color={stage.color} />
      </div>
    </button>
  );
}

function CheckCircle({ on, color }) {
  return (
    <div style={{
      width: 24, height: 24, borderRadius: '50%',
      border: on ? `2px solid ${color || 'var(--orange)'}` : '1.5px solid var(--cream-edge)',
      background: on ? (color || 'var(--orange)') : 'transparent',
      color: 'var(--white)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 200ms ease',
    }}>
      {on && (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="pop-in">
          <path d="M3 8.5 L6.5 12 L13 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

function MinimalNav({ step, totalSteps, onNav }) {
  return (
    <header style={{ padding: '24px 28px', borderBottom: '1px solid var(--line)' }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0,
      }}>
        <Logo onClick={() => onNav && onNav('landing')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--ink-mute)' }}>Step {step} of {totalSteps}</div>
          <div style={{
            width: 80, height: 4, borderRadius: 'var(--r-pill)',
            background: 'var(--cream-edge)', overflow: 'hidden',
          }}>
            <div style={{
              width: `${(step / totalSteps) * 100}%`, height: '100%',
              background: 'var(--orange)', borderRadius: 'inherit',
              transition: 'width 320ms ease',
            }} />
          </div>
        </div>
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------
   SIGNUP — very light form to bridge landing -> onboarding
   ---------------------------------------------------------------- */
function SignupPage({ onComplete, onNav, mode = 'signup' }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('annual');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState(null);
  const isSignup = mode === 'signup';

  const submit = (e) => {
    e?.preventDefault?.();
    onComplete({
      name: name.trim() || 'You',
      city: city.trim() || 'somewhere',
      email: email.trim(),
      password,
      plan,
    });
  };

  const handleGoogleAuth = async () => {
    if (!isSupabaseConfigured()) {
      setGoogleError('Something went wrong. Please try again.');
      return;
    }
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error('Google auth error:', e);
      setGoogleError('Something went wrong. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div data-screen-label={isSignup ? '02 Sign up' : '02 Sign in'} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '24px 28px', borderBottom: '1px solid var(--line)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 0 }}>
          <Logo onClick={() => onNav('landing')} />
          <button className="btn btn-ghost btn-sm" onClick={() => onNav('landing')}>← Back</button>
        </div>
      </header>

      <main style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        alignItems: 'stretch',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '48px 32px',
        }}>
          <form onSubmit={submit} className="fade-in" style={{
            width: '100%', maxWidth: 420,
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div className="eyebrow">{isSignup ? 'New here' : 'Welcome back'}</div>
            <h1 className="serif" style={{
              margin: '4px 0 0', fontSize: 'clamp(32px, 3.4vw, 44px)',
              fontWeight: 600, letterSpacing: '-0.018em', lineHeight: 1.1,
            }}>
              {isSignup ? 'Start your free trial.' : 'Sign in to the Wall.'}
            </h1>
            <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.5 }}>
              {isSignup
                ? 'Seven days free. Cancel anytime. We never share your name beyond first name + city.'
                : 'Pick up right where you left off.'}
            </p>

            <div style={{ height: 8 }} />

            <button
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleAuth}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, width: '100%', height: 48,
                background: 'var(--white)',
                border: '1.5px solid var(--line)',
                borderRadius: 'var(--r-pill)',
                fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600,
                color: 'var(--ink)', cursor: googleLoading ? 'not-allowed' : 'pointer',
                opacity: googleLoading ? 0.7 : 1,
                transition: 'all 160ms ease',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={e => {
                if (googleLoading) return;
                e.currentTarget.style.borderColor = 'var(--orange)';
                e.currentTarget.style.background = 'var(--cream)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--line)';
                e.currentTarget.style.background = 'var(--white)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseDown={e => { if (!googleLoading) e.currentTarget.style.transform = 'scale(0.97)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }} aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
              {googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
            </button>
            {googleError && (
              <p style={{ margin: '-8px 0 0', fontSize: 13, color: 'var(--orange)' }}>Something went wrong. Try again.</p>
            )}

            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              margin: '20px 0',
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              <span style={{ fontSize: 13, color: 'var(--ink-mute)', whiteSpace: 'nowrap' }}>
                or continue with email
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>

            {isSignup && (
              <>
                <Field label="First name">
                  <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Marcus" autoFocus />
                </Field>
                <Field label="City" hint="Only your first name + city are ever shown publicly.">
                  <input className="input" value={city} onChange={e => setCity(e.target.value)} placeholder="Houston, TX" />
                </Field>
              </>
            )}
            <Field label="Email">
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoFocus={!isSignup} />
            </Field>
            <Field label="Password">
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </Field>

            {isSignup && (
              <>
                <div className="eyebrow" style={{ marginTop: 6 }}>Choose a plan</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <PlanPick label="Monthly" price="$12.99/mo" active={plan === 'monthly'} onClick={() => setPlan('monthly')} />
                  <PlanPick label="Annual" price="$89/yr" tag="Save 43%" active={plan === 'annual'} onClick={() => setPlan('annual')} />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 10 }}>
              {isSignup ? 'Continue' : 'Sign in'}
            </button>
            <div style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--ink-mute)' }}>
              {isSignup ? 'Already a member? ' : 'New here? '}
              <button type="button" onClick={() => onNav(isSignup ? 'login' : 'signup')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--orange)', fontWeight: 600 }}>
                {isSignup ? 'Sign in' : 'Start free trial'}
              </button>
            </div>
          </form>
        </div>

        <aside style={{
          background: 'var(--cream-deep)',
          borderLeft: '1px solid var(--line)',
          padding: '64px 48px',
          display: 'flex', alignItems: 'center',
        }}>
          <div style={{ maxWidth: 440 }}>
            <div className="eyebrow">From the wall this morning</div>
            <blockquote className="serif" style={{
              margin: '14px 0 22px', fontSize: 26, lineHeight: 1.3,
              fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.012em', fontStyle: 'italic',
              textWrap: 'balance',
            }}>
              “Single brothers — stop praying for a wife while you're still avoiding the work of becoming a husband. The waiting is the workshop.”
            </blockquote>
            <div style={{ fontSize: 14, color: 'var(--ink-mute)' }}>
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Tomás</span> — California · Seeking
            </div>
            <div style={{
              marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--line)',
              display: 'flex', gap: 22, fontSize: 13, color: 'var(--ink-soft)',
            }}>
              <Stat n="140" l="posts this week" />
              <Stat n="4" l="life stages" />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', letterSpacing: '0.01em' }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 12, color: 'var(--ink-mute)', lineHeight: 1.4 }}>{hint}</span>}
    </label>
  );
}

function PlanPick({ label, price, tag, active, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      textAlign: 'left',
      background: active ? 'var(--orange-soft)' : 'var(--white)',
      border: active ? '1.5px solid var(--orange)' : '1px solid var(--line)',
      borderRadius: 'var(--r-md)', padding: '12px 14px',
      cursor: 'pointer', transition: 'all 160ms ease',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{label}</div>
        <CheckCircle on={active} />
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>{price}</div>
      {tag && (
        <div style={{
          position: 'absolute', top: -8, right: 10,
          background: 'var(--orange)', color: 'var(--white)',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
          padding: '2px 8px', borderRadius: 'var(--r-pill)',
        }}>{tag}</div>
      )}
    </button>
  );
}

function Stat({ n, l }) {
  return (
    <div>
      <div className="serif" style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 4 }}>{l}</div>
    </div>
  );
}

Object.assign(window, { OnboardingPage, SignupPage });
