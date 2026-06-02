/* dashboard.jsx — logged-in community + daily word
   Two variants:
     - premium (full access)
     - trial-expired (thread frosted, overlay)
*/

function DashboardPage({ user, mode, posts, onReact, onReply, onReplyReact, onSubmitPost, onNav, onSubscribe }) {
  const [filter, setFilter] = useState('all');
  const expired = mode === 'expired';

  const [dailyWord, setDailyWord] = useState(() => {
    const day = Math.floor(Date.now() / 86400000);
    return DAILY_WORDS[day % DAILY_WORDS.length];
  });
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let active = true;
    dbFetchDailyWord().then(w => { if (w && active) setDailyWord(w); });
    return () => { active = false; };
  }, []);
  const weekly = WEEKLY_PROMPTS[user.stage] || WEEKLY_PROMPTS.seeking;

  const filtered = useMemo(() => {
    if (filter === 'all') return posts;
    return posts.filter(p => p.stage === filter);
  }, [posts, filter]);

  return (
    <div data-screen-label={expired ? '05 Dashboard (trial expired)' : '04 Dashboard (premium)'}>
      <TopNav user={user} onNav={onNav} current="dashboard" />

      <main className="container" style={{ padding: '32px 28px 80px' }}>
        <Greeting user={user} expired={expired} onSubscribe={onSubscribe} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 360px',
          gap: 36,
          marginTop: 36,
          alignItems: 'flex-start',
        }} className="dashboard-grid">
          {/* MAIN — community thread */}
          <section style={{ minWidth: 0 }}>
            <ThreadHeader />
            <FilterBar value={filter} onChange={setFilter} />

            <div style={{ marginTop: 18, position: 'relative' }}>
              {!expired && (
                <div style={{ marginBottom: 16 }}>
                  <ShareBox stage={user.stage} onSubmit={onSubmitPost} />
                </div>
              )}

              <div style={{
                display: 'flex', flexDirection: 'column', gap: 16,
                position: 'relative',
              }}>
                {filtered.map((p, i) => (
                  <div key={p.id} className={i < 4 ? 'fade-in' : ''} style={{ animationDelay: `${i * 40}ms` }}>
                    <PostCard
                      post={p}
                      onReact={onReact}
                      onReply={onReply}
                      onReplyReact={onReplyReact}
                      dim={expired && i > 0}
                      locked={expired}
                    />
                  </div>
                ))}
                {filtered.length === 0 && (
                  <EmptyThread stage={filter} />
                )}
              </div>

              {/* TRIAL EXPIRED OVERLAY */}
              {expired && <TrialExpiredOverlay onSubscribe={onSubscribe} />}
            </div>
          </section>

          {/* RIGHT RAIL */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 96 }}>
            <DailyWordCard word={dailyWord} />
            <WeeklyPromptCard prompt={weekly} stage={STAGES[user.stage]} />
            <AppCard />
            {!expired && <QuietPromptCard />}
            <FaithLine />
          </aside>
        </div>
      </main>

      {/* responsive: collapse the rail under content */}
      <style>{`
        @media (max-width: 920px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
          .dashboard-grid > aside { position: static !important; order: -1; }
        }
      `}</style>
    </div>
  );
}

/* ----------------------------------------------------------------
   GREETING
   ---------------------------------------------------------------- */
function Greeting({ user, expired, onSubscribe }) {
  const g = greeting();
  const date = todayDateStr();
  return (
    <header style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      gap: 24, flexWrap: 'wrap',
    }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 10, color: 'var(--ink-mute)' }}>{date}</div>
        <h1 className="serif" style={{
          margin: 0, fontSize: 'clamp(34px, 4.2vw, 54px)', lineHeight: 1.05,
          fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)',
        }}>
          {g}, <span style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--orange)' }}>Beloved</span>
          <span style={{ marginLeft: 12, fontSize: '0.7em', verticalAlign: 'middle' }}>🙏</span>
        </h1>
        <p style={{
          margin: '10px 0 0', fontSize: 16, color: 'var(--ink-soft)',
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        }}>
          You're walking through{' '}
          <StageTag stage={user.stage} />
          {' '}— {STAGES[user.stage].note.toLowerCase()}.
        </p>
      </div>
      {expired && (
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--r-md)',
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: 'var(--shadow-soft)', border: '1px solid var(--orange-soft)',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: 'var(--orange)',
            animation: 'pulseDot 2s infinite',
          }} />
          <span style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>
            Your trial has ended.
          </span>
          <button className="btn btn-primary btn-sm" onClick={onSubscribe}>Subscribe</button>
        </div>
      )}
    </header>
  );
}

/* ----------------------------------------------------------------
   THREAD HEADER
   ---------------------------------------------------------------- */
function ThreadHeader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      gap: 14, marginBottom: 12, flexWrap: 'wrap',
    }}>
      <div>
        <h2 className="serif" style={{
          margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.012em',
          color: 'var(--orange)', fontStyle: 'italic',
        }}>The Wall</h2>
        <div style={{ fontSize: 13.5, color: 'var(--ink-mute)', marginTop: 2 }}>
          Lift each other up. Anonymously.
        </div>
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px',
        background: 'var(--orange)',
        color: 'var(--white)',
        borderRadius: 'var(--r-pill)',
        fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M8 2 L10 6 L14 6.5 L11 9.5 L12 14 L8 11.5 L4 14 L5 9.5 L2 6.5 L6 6 Z"
                stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.25" />
        </svg>
        Lift · 100
      </div>
    </div>
  );
}

function EmptyThread({ stage }) {
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 'var(--r-lg)',
      padding: 48, textAlign: 'center', boxShadow: 'var(--shadow-soft)',
    }}>
      <div style={{ fontSize: 38, marginBottom: 12 }}>{STAGES[stage]?.glyph || '🤍'}</div>
      <div className="serif" style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
        No posts here yet.
      </div>
      <div style={{ fontSize: 14.5, color: 'var(--ink-mute)' }}>
        Be the first to say something this week.
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   DAILY WORD CARD — never gated
   ---------------------------------------------------------------- */
function DailyWordCard({ word }) {
  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--r-lg)',
      padding: '24px 24px 22px',
      boxShadow: 'var(--shadow-card)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <DecorBookmark />
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'var(--orange-soft)', color: 'var(--orange-text)',
        padding: '4px 10px', borderRadius: 'var(--r-pill)',
        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        marginBottom: 14,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--orange)' }} />
        {word.type}
      </div>
      <blockquote className="serif" style={{
        margin: 0, fontSize: 21, lineHeight: 1.4,
        fontStyle: 'italic', fontWeight: 500, color: 'var(--ink)',
        letterSpacing: '-0.005em', textWrap: 'pretty',
      }}>
        {word.body}
      </blockquote>
      <div style={{
        marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 8,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{word.reference}</span>
        <span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>· {word.translation}</span>
      </div>
      {word.reflection && (
        <div style={{
          marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--line)',
          fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.55,
        }}>
          {word.reflection}
        </div>
      )}
      <div style={{
        marginTop: 16, display: 'flex', gap: 6,
      }}>
        <SmallChip>🤍 Save</SmallChip>
        <SmallChip>↗ Share</SmallChip>
      </div>
    </div>
  );
}
function DecorBookmark() {
  return (
    <svg width="38" height="48" viewBox="0 0 38 48" style={{
      position: 'absolute', top: -2, right: 16, opacity: 0.12,
    }}>
      <path d="M4 2 L34 2 L34 46 L19 36 L4 46 Z" fill="var(--orange)" />
    </svg>
  );
}
function SmallChip({ children }) {
  return (
    <button style={{
      height: 30, padding: '0 12px', borderRadius: 'var(--r-pill)',
      border: '1px solid var(--line)', background: 'var(--paper)',
      fontSize: 12.5, fontWeight: 500, color: 'var(--ink-soft)',
      cursor: 'pointer', transition: 'all 140ms ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--ink-soft)'; }}
    >{children}</button>
  );
}

/* ----------------------------------------------------------------
   WEEKLY PROMPT CARD
   ---------------------------------------------------------------- */
function WeeklyPromptCard({ prompt, stage }) {
  return (
    <div style={{
      background: stage.bg,
      borderRadius: 'var(--r-lg)',
      padding: '20px 22px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div className="eyebrow" style={{
        color: stage.color, marginBottom: 10,
        display: 'inline-flex', alignItems: 'center', gap: 8,
      }}>
        <span>{stage.glyph}</span>
        Weekly prompt · {stage.label}
      </div>
      <h3 className="serif" style={{
        margin: 0, fontSize: 18.5, lineHeight: 1.35,
        fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.005em',
        textWrap: 'pretty',
      }}>
        {prompt.question}
      </h3>
      <button className="btn btn-sm" style={{
        marginTop: 14,
        background: 'var(--white)', color: stage.color,
        border: `1.5px solid ${stage.color}`,
      }}>
        Answer in your journal
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------
   QUIET PROMPT — a smaller "right now" widget
   ---------------------------------------------------------------- */
function QuietPromptCard() {
  return (
    <div style={{
      background: 'var(--paper)', borderRadius: 'var(--r-lg)',
      padding: '18px 20px', border: '1px solid var(--line)',
    }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>One quiet minute</div>
      <div className="serif" style={{
        fontSize: 16, fontStyle: 'italic', color: 'var(--ink-soft)', lineHeight: 1.5,
      }}>
        Before you scroll the Wall — name one person to pray for by name, and pause.
      </div>
    </div>
  );
}

function FaithLine() {
  return (
    <div className="serif" style={{
      fontSize: 13, fontStyle: 'italic', color: 'var(--ink-mute)',
      textAlign: 'center', padding: '6px 8px', lineHeight: 1.5,
    }}>
      “Not by might, nor by power, but by my Spirit.”<br />— Zechariah 4:6
    </div>
  );
}

/* ----------------------------------------------------------------
   TRIAL-EXPIRED OVERLAY
   ---------------------------------------------------------------- */
function TrialExpiredOverlay({ onSubscribe }) {
  return (
    <div style={{
      position: 'absolute', left: -8, right: -8, top: 0, bottom: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(245, 237, 228, 0) 0%, rgba(245, 237, 228, 0.86) 32%, rgba(245, 237, 228, 0.94) 100%)',
        backdropFilter: 'blur(1.5px)',
        WebkitBackdropFilter: 'blur(1.5px)',
      }} />
      <div className="pop-in" style={{
        position: 'relative', pointerEvents: 'auto',
        background: 'var(--white)', borderRadius: 'var(--r-xl)',
        padding: '32px 32px 28px', maxWidth: 460, width: 'calc(100% - 40px)',
        textAlign: 'center', boxShadow: 'var(--shadow-lift)',
        border: '1px solid var(--orange-soft)',
        margin: '120px 0',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--orange-soft)', color: 'var(--orange)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M7 10V7a5 5 0 1 1 10 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </div>
        <h3 className="serif" style={{
          margin: 0, fontSize: 28, fontWeight: 600, color: 'var(--ink)',
          letterSpacing: '-0.012em', lineHeight: 1.15,
        }}>
          Your trial has ended.
        </h3>
        <p style={{
          margin: '12px 0 22px',
          fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.55,
        }}>
          Join the community to keep reading the Wall, posting prayers, and praying with believers walking your stage.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={onSubscribe}>Subscribe — $89/year</button>
          <button className="btn btn-ghost">$12.99/month</button>
        </div>
        <div style={{
          marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--line)',
          fontSize: 12.5, color: 'var(--ink-mute)', lineHeight: 1.5,
        }}>
          Your Daily Word stays open. We never gate the scripture.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardPage });
