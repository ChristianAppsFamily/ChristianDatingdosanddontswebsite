/* landing.jsx — public-facing landing page with hero variations */

function LandingPage({ tweaks, onNav, demoPosts }) {
  return (
    <div data-screen-label="01 Landing">
      <AppBanner />
      <TopNav onNav={onNav} />
      <Hero variant={tweaks.heroLayout} onNav={onNav} />
      <PreviewSection demoPosts={demoPosts} onNav={onNav} />
      <FeaturesSection />
      <ClarityCalloutSection onNav={onNav} />
      <PricingSection onNav={onNav} />
      <ClosingCTA onNav={onNav} />
      <Footer />
    </div>
  );
}

/* ----------------------------------------------------------------
   HERO — three layout variants via tweak
   ---------------------------------------------------------------- */
function Hero({ variant = 'centered', onNav }) {
  if (variant === 'asymmetric') return <HeroAsymmetric onNav={onNav} />;
  if (variant === 'verse')      return <HeroVerse onNav={onNav} />;
  return <HeroCentered onNav={onNav} />;
}

function HeroHeadline({ size = 'lg' }) {
  const fs = size === 'xl' ? 'clamp(40px, 5.4vw, 76px)' : 'clamp(36px, 4.2vw, 60px)';
  return (
    <h1 className="serif" style={{
      fontSize: fs, lineHeight: 1.08,
      fontWeight: 600, letterSpacing: '-0.025em',
      margin: '0 0 16px', color: 'var(--ink)',
      textWrap: 'balance',
    }}>
      A safe place for Christians navigating dating with faith.
    </h1>
  );
}

function HeroTagline() {
  return (
    <p style={{
      fontSize: 18.5, lineHeight: 1.55, color: 'var(--ink)',
      maxWidth: 560, margin: '0 0 14px', fontWeight: 500,
      textWrap: 'pretty',
    }}>
      The dating season is real. So is the faith it takes to walk through it with integrity.
    </p>
  );
}

function HeroSubhead({ wide = false }) {
  return (
    <p style={{
      fontSize: 18.5, lineHeight: 1.55, color: 'var(--ink-soft)',
      maxWidth: wide ? 620 : 560, marginTop: 0, marginBottom: 32,
      textWrap: 'pretty',
    }}>
      A daily word, a weekly question, and a community of believers who are in it too.
    </p>
  );
}

function HeroCTAs({ onNav }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
      <button className="btn btn-primary btn-lg" onClick={() => onNav('signup')}>
        Join the community
        <ArrowRight />
      </button>
      <button className="btn btn-ghost btn-lg" onClick={() => {
        document.getElementById('how-it-works')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      }}>
        See how it works
      </button>
      <div style={{ fontSize: 13, color: 'var(--ink-mute)', marginLeft: 6 }}>
        7 days free. $12.99/mo or $89/yr after.
      </div>
    </div>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 2 }}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* --- Variant A: CENTERED --- */
function HeroCentered({ onNav }) {
  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      <HeroBackdrop />
      <div className="container fade-in" style={{
        padding: '72px 28px 80px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center',
      }}>
        <HeroHeadline size="xl" />
        <HeroTagline />
        <HeroSubhead />
        <HeroCTAs onNav={onNav} />
      </div>
    </section>
  );
}

/* --- Variant B: ASYMMETRIC (text + stacked post cards) --- */
function HeroAsymmetric({ onNav }) {
  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      <HeroBackdrop />
      <div className="container fade-in" style={{
        padding: '64px 28px 80px',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)',
        gap: 56, alignItems: 'center',
      }}>
        <div>
          <HeroHeadline />
          <HeroTagline />
          <HeroSubhead wide />
          <HeroCTAs onNav={onNav} />
        </div>
        <HeroStack />
      </div>
    </section>
  );
}

function HeroStack() {
  // Layered preview of 3 community posts as a visual
  const samples = [
    { name: 'Marcus', location: 'Texas', stage: 'seeking', category: 'prayer', body: "Praying for discernment — 3 months in and I want to honor Him either way." },
    { name: 'Diane', location: 'Georgia', stage: 'starting', category: 'praise', body: "Finally had the boundary conversation. God gave me the words." },
    { name: 'Daniel', location: 'NC', stage: 'engaged', category: 'praise', body: "She said yes. Glory to God." },
  ];
  return (
    <div style={{
      position: 'relative', height: 480,
    }}>
      <div style={{
        position: 'absolute', top: 30, left: 20, right: 50,
        transform: 'rotate(-2.5deg)',
      }}>
        <MiniPost p={samples[0]} reactions={{ praying: 24, with_you: 11, amen: 17 }} />
      </div>
      <div style={{
        position: 'absolute', top: 170, left: 50, right: 10,
        transform: 'rotate(1.2deg)',
      }}>
        <MiniPost p={samples[1]} reactions={{ praying: 8, with_you: 41, amen: 28 }} highlight />
      </div>
      <div style={{
        position: 'absolute', top: 310, left: 30, right: 40,
        transform: 'rotate(-1deg)',
      }}>
        <MiniPost p={samples[2]} reactions={{ praying: 41, with_you: 67, amen: 124 }} />
      </div>
    </div>
  );
}

function MiniPost({ p, reactions, highlight }) {
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 'var(--r-lg)',
      padding: '16px 18px',
      boxShadow: highlight ? '0 12px 32px rgba(74,47,22,0.18)' : 'var(--shadow-card)',
      border: highlight ? '1.5px solid rgba(200, 98, 42, 0.25)' : 'none',
    }}>
      <div style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 8 }}>
        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{p.name}</span> — {p.location}
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <CategoryTag kind={p.category || 'prayer'} />
        <StageTag stage={p.stage} small />
      </div>
      <div className="serif" style={{
        fontSize: 15.5, lineHeight: 1.5, color: 'var(--ink)', marginBottom: 12,
      }}>{p.body}</div>
      <div style={{ display: 'flex', gap: 6 }}>
        <MiniPill emoji="🙏" count={reactions.praying} primary />
        <MiniPill emoji="❤️" count={reactions.with_you} />
        <MiniPill emoji="✝️" count={reactions.amen} />
      </div>
    </div>
  );
}
function MiniPill({ emoji, count, primary }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      height: 26, padding: '0 9px',
      borderRadius: 'var(--r-pill)',
      background: primary ? 'var(--orange)' : 'var(--white)',
      color: primary ? 'var(--white)' : 'var(--ink-soft)',
      border: primary ? '1.5px solid var(--orange)' : '1.5px solid var(--cream-edge)',
      fontSize: 12, fontWeight: 700,
    }}>
      <span>{emoji}</span>{count}
    </span>
  );
}

/* --- Variant C: VERSE IMAGERY --- */
function HeroVerse({ onNav }) {
  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      <HeroBackdrop strong />
      <div className="container fade-in" style={{
        padding: '60px 28px 72px',
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: 64, alignItems: 'center',
      }}>
        <div>
          <HeroHeadline />
          <HeroTagline />
          <HeroSubhead wide />
          <HeroCTAs onNav={onNav} />
        </div>
        <VerseColumn />
      </div>
    </section>
  );
}

function VerseColumn() {
  return (
    <div style={{
      position: 'relative',
      padding: '48px 36px',
      background: 'linear-gradient(180deg, #FBF1E2 0%, #F5E2C9 100%)',
      borderRadius: 'var(--r-xl)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden',
    }}>
      <DecorCircle />
      <div className="eyebrow" style={{ color: 'var(--orange-text)', marginBottom: 18 }}>A Word Today</div>
      <blockquote className="serif" style={{
        margin: 0, fontSize: 'clamp(26px, 2.6vw, 36px)', lineHeight: 1.25,
        fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.015em', fontStyle: 'italic',
        textWrap: 'balance',
      }}>
        “Plans fail for lack of counsel, but with many advisers they succeed.”
      </blockquote>
      <div style={{ marginTop: 22, fontFamily: 'var(--sans)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Proverbs 15:22</div>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>NIV</div>
      </div>
      <div style={{
        marginTop: 28, padding: '14px 16px',
        background: 'rgba(255, 255, 255, 0.55)',
        borderRadius: 'var(--r-md)',
        fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.55,
      }}>
        That's what this is. A Wall of advisers. Real people in real seasons of dating, walking with the same Spirit, sharing the wisdom they were given.
      </div>
    </div>
  );
}
function DecorCircle() {
  return (
    <svg width="220" height="220" viewBox="0 0 220 220" style={{
      position: 'absolute', right: -60, top: -60, opacity: 0.25, pointerEvents: 'none',
    }}>
      <circle cx="110" cy="110" r="100" fill="none" stroke="var(--orange)" strokeWidth="1.5" />
      <circle cx="110" cy="110" r="68" fill="none" stroke="var(--orange)" strokeWidth="1" />
      <circle cx="110" cy="110" r="36" fill="none" stroke="var(--orange)" strokeWidth="0.7" />
    </svg>
  );
}

/* --- Shared bits --- */
function HeroBackdrop({ strong = false }) {
  return (
    <div aria-hidden style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: strong
        ? 'radial-gradient(900px 500px at 80% -10%, rgba(200, 98, 42, 0.16), transparent 60%), radial-gradient(700px 400px at 0% 80%, rgba(200, 98, 42, 0.10), transparent 60%)'
        : 'radial-gradient(900px 500px at 80% -10%, rgba(200, 98, 42, 0.12), transparent 60%)',
    }} />
  );
}

/* ----------------------------------------------------------------
   PREVIEW SECTION — frosted/blurred community thread + "Join to read"
   ---------------------------------------------------------------- */
function PreviewSection({ demoPosts, onNav }) {
  return (
    <section style={{ padding: '72px 0', background: 'var(--cream-deep)' }} id="preview">
      <div className="container">
        <SectionHeading
          eyebrow="The Wall"
          title="Real people. First names. Honest faith."
          sub="This is what it sounds like when Christians are willing to share their dating struggles and start praying through it together."
        />

        <div style={{ position: 'relative', maxWidth: 720, margin: '40px auto 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {demoPosts.slice(0, 4).map((p, i) => (
              <div key={p.id} style={{ filter: i >= 1 ? `blur(${i * 1.6}px)` : 'none', opacity: i === 0 ? 1 : 0.96 - i * 0.08 }}>
                <PostCard post={p} dim={i >= 2} teaser />
              </div>
            ))}
          </div>

          {/* fade to cream below */}
          <div aria-hidden style={{
            position: 'absolute', left: -20, right: -20, bottom: -1, height: 240,
            background: 'linear-gradient(180deg, rgba(239, 227, 211, 0) 0%, var(--cream-deep) 70%)',
            pointerEvents: 'none',
          }} />

          {/* CTA overlay */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 8,
            display: 'flex', justifyContent: 'center',
          }}>
            <div style={{
              background: 'var(--white)', borderRadius: 'var(--r-pill)',
              padding: '12px 14px 12px 22px',
              boxShadow: 'var(--shadow-lift)',
              display: 'flex', alignItems: 'center', gap: 14,
              border: '1px solid var(--line)',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--orange)', animation: 'pulseDot 2s infinite',
              }} />
              <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>
                Join to read the full Wall
              </span>
              <button className="btn btn-primary btn-sm" onClick={() => onNav('signup')}>
                Join the community
                <ArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, sub, align = 'center' }) {
  return (
    <div style={{
      textAlign: align, maxWidth: 720, margin: align === 'center' ? '0 auto' : undefined,
      display: 'flex', flexDirection: 'column', gap: 12,
      alignItems: align === 'center' ? 'center' : 'flex-start',
    }}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h2 className="serif" style={{
        margin: 0, fontSize: 'clamp(30px, 3.6vw, 44px)', lineHeight: 1.1,
        fontWeight: 600, letterSpacing: '-0.018em', color: 'var(--ink)',
        textWrap: 'balance',
      }}>{title}</h2>
      {sub && <p style={{
        margin: 0, fontSize: 17, lineHeight: 1.55, color: 'var(--ink-soft)',
        maxWidth: 560, textWrap: 'pretty',
      }}>{sub}</p>}
    </div>
  );
}

/* ----------------------------------------------------------------
   FEATURES — 4 highlights
   ---------------------------------------------------------------- */
function FeaturesSection() {
  const features = [
    {
      icon: <IconDaily />,
      title: 'A Daily Word',
      body: 'A scripture, devotional, or piece of wisdom that speaks to where you\'re uniquely at, with the hope of encouraging you.',
    },
    {
      icon: <IconWall />,
      title: 'The Wall',
      body: 'An open community thread where believers pray, encourage, and amen one another. First name and city only. Anonymous on purpose.',
    },
    {
      icon: <IconStage />,
      title: 'Stage-aware',
      body: 'Seeking, dating, engaged, or starting over — filter to the believers walking the same road and hear from those who\'ve been there.',
    },
    {
      icon: <IconClarity />,
      title: 'Get Clarity',
      body: 'Ask faith-based relationship questions and receive scripture-grounded wisdom, honest reflection, and gentle encouragement — anytime. Included with every membership.',
    },
  ];
  return (
    <section id="how-it-works" style={{ padding: '88px 0' }}>
      <div className="container">
        <SectionHeading
          eyebrow="What's inside"
          title="Simple. Focused. Faith-forward."
          sub="No algorithm. No swiping. No performance. Just a daily anchor, a community that knows your season, and wisdom when you need it."
        />
        <div style={{
          marginTop: 56,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: 'var(--white)', borderRadius: 'var(--r-lg)',
              padding: 28, boxShadow: 'var(--shadow-soft)',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--r-md)',
                background: 'var(--orange-soft)', color: 'var(--orange-text)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{f.icon}</div>
              <h3 className="serif" style={{
                margin: 0, fontSize: 22, fontWeight: 600, color: 'var(--ink)',
                letterSpacing: '-0.012em',
              }}>{f.title}</h3>
              <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.55 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IconDaily() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M5 6.5C5 5.67 5.67 5 6.5 5h9c2.5 0 5 1.5 5 5v11H8.5C6.57 21 5 19.43 5 17.5V6.5z"
            stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 10h7M9 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconWall() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M5 9.5C5 7.57 6.57 6 8.5 6h9C19.43 6 21 7.57 21 9.5v5c0 1.93-1.57 3.5-3.5 3.5H13l-4 3v-3H8.5C6.57 18 5 16.43 5 14.5v-5z"
            stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="10.5" cy="12" r="1" fill="currentColor" />
      <circle cx="13" cy="12" r="1" fill="currentColor" />
      <circle cx="15.5" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}
function IconStage() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M4 13 L13 4 L22 13 L13 22 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="13" cy="13" r="2.5" fill="currentColor" />
    </svg>
  );
}
function IconClarity() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M6 8.5C6 7.12 7.12 6 8.5 6h9C18.88 6 20 7.12 20 8.5v9c0 1.38-1.12 2.5-2.5 2.5h-4.5l-3.5 3v-3H8.5C7.12 18 6 16.88 6 15.5v-7z"
            stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 11h6M10 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="19" cy="7" r="2.5" fill="var(--orange-soft)" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/* ----------------------------------------------------------------
   CLARITY CALLOUT — between Features and Pricing
   ---------------------------------------------------------------- */
function ClarityCalloutSection({ onNav }) {
  return (
    <section style={{ padding: '72px 0', background: 'var(--cream-deep)' }}>
      <div className="container">
        <div style={{
          maxWidth: 720, margin: '0 auto',
          display: 'flex', flexDirection: 'column', gap: 18,
          textAlign: 'center', alignItems: 'center',
        }}>
          <div className="eyebrow">Get Clarity</div>
          <h2 className="serif" style={{
            margin: 0, fontSize: 'clamp(30px, 3.6vw, 44px)', lineHeight: 1.1,
            fontWeight: 600, letterSpacing: '-0.018em', color: 'var(--ink)',
            textWrap: 'balance',
          }}>
            Faith-based insight when you need it most.
          </h2>
          <p style={{
            margin: 0, fontSize: 17, lineHeight: 1.6, color: 'var(--ink-soft)',
            maxWidth: 620, textWrap: 'pretty',
          }}>
            Dating is full of questions nobody warns you about. Should I bring up marriage? Is this a red flag or a me flag? How do I hold this boundary with grace?
          </p>
          <p style={{
            margin: 0, fontSize: 17, lineHeight: 1.6, color: 'var(--ink-soft)',
            maxWidth: 620, textWrap: 'pretty',
          }}>
            Get Clarity is a scripture-grounded conversation partner built into your membership. Ask anything about your faith, your relationship, or the season you're in — and receive honest, Word-anchored perspective in return.
          </p>
          <p style={{
            margin: 0, fontSize: 17, lineHeight: 1.6, color: 'var(--ink-soft)',
            maxWidth: 620, textWrap: 'pretty',
          }}>
            Not a chatbot. Not generic advice. Clarity knows your life stage, reflects today's Daily Word, and stays focused on what matters — helping you honor God in your relationships.
          </p>
          <p style={{
            margin: '4px 0 8px', fontSize: 15, fontWeight: 600, color: 'var(--ink)',
          }}>
            10 messages per month with Community. Unlimited with Community + Clarity.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => onNav('signup')}>
            Join the community
            <ArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   PRICING
   ---------------------------------------------------------------- */
function PricingSection({ onNav }) {
  return (
    <section style={{ padding: '72px 0', background: 'var(--white)' }} id="pricing">
      <div className="container">
        <SectionHeading
          eyebrow="Honest pricing."
          title="No pressure."
          sub="Seven days free. Cancel anytime. The Daily Word is always open — we will never put scripture behind a paywall."
        />
        <div style={{
          marginTop: 48,
          display: 'grid', gap: 20,
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          maxWidth: 820, marginInline: 'auto',
        }}>
          <PriceCard
            label="Community"
            price="$12.99"
            cadence="per month"
            line="Try it for a season."
            cta="Start free trial"
            features={[
              'Daily Word every morning',
              'Stage-aware community thread',
              'Weekly prompt for your season',
              'Pray and amen anonymously',
              'Get Clarity — 10 messages per month',
            ]}
            onClick={() => onNav('signup')}
          />
          <PriceCard
            label="Community + Clarity"
            price="$19.99"
            cadence="per month"
            badge="Best value"
            line="For the member who wants to go deeper."
            cta="Start free trial"
            featured
            features={[
              'Everything in Community',
              'Get Clarity — unlimited messages',
              'Priority access to new features',
            ]}
            onClick={() => onNav('signup')}
          />
        </div>
        <p style={{
          textAlign: 'center', margin: '28px auto 0',
          fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.55, maxWidth: 640,
        }}>
          Annual options: Community <strong style={{ color: 'var(--ink)' }}>$89/year · save 43%</strong>
          {' · '}
          Community + Clarity <strong style={{ color: 'var(--ink)' }}>$149/year · save 38%</strong>
        </p>
        <p style={{
          textAlign: 'center', margin: '12px auto 0',
          fontSize: 14, color: 'var(--ink-mute)',
        }}>
          Seven days free on all plans. Cancel anytime.
        </p>
        <ShareWithFriend />
      </div>
    </section>
  );
}

function ShareWithFriend() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = 'https://christiandatingdosanddonts.com';
    const title = "Christian Dating Do's and Don'ts";
    const text = 'Found this faith-based community for Christians navigating dating — thought you might appreciate it.';

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (e) {
        // user dismissed share sheet — no-op
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error('Share copy failed:', e);
      }
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 28 }}>
      <p className="serif" style={{
        margin: '0 0 10px', fontSize: 14, color: 'var(--ink-mute)', fontStyle: 'italic',
      }}>
        Don't want to join alone? Bring a friend.
      </p>
      <button
        type="button"
        onClick={handleShare}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          height: 38, padding: '0 18px',
          borderRadius: 'var(--r-pill)',
          border: `1.5px solid ${copied ? 'var(--orange)' : 'var(--line)'}`,
          background: 'transparent',
          color: copied ? 'var(--orange)' : 'var(--ink-soft)',
          fontFamily: 'var(--sans)', fontSize: 13.5, fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 140ms ease',
        }}
        onMouseEnter={e => {
          if (copied) return;
          e.currentTarget.style.borderColor = 'var(--orange)';
          e.currentTarget.style.color = 'var(--orange)';
        }}
        onMouseLeave={e => {
          if (copied) return;
          e.currentTarget.style.borderColor = 'var(--line)';
          e.currentTarget.style.color = 'var(--ink-soft)';
        }}
      >
        {copied ? '✓ Link copied' : '↗ Share with a friend'}
      </button>
    </div>
  );
}

function PriceCard({ label, price, cadence, line, cta, badge, featured, features = [], onClick }) {
  return (
    <div style={{
      position: 'relative',
      background: featured ? 'var(--ink)' : 'var(--white)',
      color: featured ? 'var(--white)' : 'var(--ink)',
      borderRadius: 'var(--r-lg)',
      padding: '32px 28px',
      boxShadow: featured ? 'var(--shadow-lift)' : 'var(--shadow-card)',
      border: featured ? '1.5px solid var(--orange)' : '1px solid var(--line)',
    }}>
      {badge && (
        <div style={{
          position: 'absolute', top: -12, left: 24,
          background: 'var(--orange)', color: 'var(--white)',
          fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em',
          textTransform: 'uppercase',
          padding: '5px 12px', borderRadius: 'var(--r-pill)',
        }}>{badge}</div>
      )}
      <div className="eyebrow" style={{
        color: featured ? 'rgba(255,255,255,0.75)' : 'var(--orange-text)',
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 14 }}>
        <span className="serif" style={{
          fontSize: 56, fontWeight: 700, letterSpacing: '-0.025em',
          lineHeight: 1,
        }}>{price}</span>
        <span style={{ fontSize: 14, color: featured ? 'rgba(255,255,255,0.7)' : 'var(--ink-mute)' }}>{cadence}</span>
      </div>
      <p style={{
        margin: '18px 0 24px', fontSize: 15, lineHeight: 1.55,
        color: featured ? 'rgba(255,255,255,0.78)' : 'var(--ink-soft)',
      }}>{line}</p>
      <button className={featured ? 'btn btn-primary btn-lg' : 'btn btn-outline btn-lg'}
        style={{ width: '100%' }} onClick={onClick}>
        {cta}
      </button>
      <ul style={{ listStyle: 'none', padding: 0, margin: '22px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {features.map((item, i) => (
          <FeatureLi key={i} featured={featured}>{item}</FeatureLi>
        ))}
      </ul>
    </div>
  );
}
function FeatureLi({ children, featured }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8.5 L6.5 12 L13 4.5" stroke={featured ? 'var(--orange)' : 'var(--orange)'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ color: featured ? 'rgba(255,255,255,0.88)' : 'var(--ink-soft)' }}>{children}</span>
    </li>
  );
}

/* ----------------------------------------------------------------
   CLOSING CTA
   ---------------------------------------------------------------- */
function ClosingCTA({ onNav }) {
  return (
    <section style={{ padding: '88px 0 32px' }}>
      <div className="container" style={{
        background: 'var(--ink)', color: 'var(--white)',
        borderRadius: 'var(--r-xl)',
        padding: '64px 56px',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <DecorCircleLg />
        <div className="eyebrow" style={{ color: 'rgba(255, 255, 255, 0.65)', position: 'relative' }}>
          The season you're in deserves more than advice from the internet.
        </div>
        <h2 className="serif" style={{
          margin: '16px auto 18px', fontSize: 'clamp(28px, 3.4vw, 44px)',
          fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15,
          maxWidth: 720, textWrap: 'balance', position: 'relative',
        }}>
          A daily word. A weekly question. A community of believers who are honest about how hard this can be apart from God and His people.
        </h2>
        <p style={{
          maxWidth: 520, margin: '0 auto 28px',
          color: 'rgba(255, 255, 255, 0.78)', fontSize: 17, lineHeight: 1.55,
          position: 'relative',
        }}>
          Seven days free. No credit card required to start.
        </p>
        <div style={{ position: 'relative' }}>
          <button className="btn btn-primary btn-lg" onClick={() => onNav('signup')}>
            Join the community
            <ArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
}
function DecorCircleLg() {
  return (
    <svg width="500" height="500" viewBox="0 0 500 500" style={{
      position: 'absolute', right: -160, top: -160, opacity: 0.12, pointerEvents: 'none',
    }}>
      <circle cx="250" cy="250" r="240" fill="none" stroke="var(--orange)" strokeWidth="1.5" />
      <circle cx="250" cy="250" r="170" fill="none" stroke="var(--orange)" strokeWidth="1" />
      <circle cx="250" cy="250" r="100" fill="none" stroke="var(--orange)" strokeWidth="0.7" />
    </svg>
  );
}

Object.assign(window, { LandingPage });
