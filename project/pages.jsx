/* pages.jsx, footer-linked static pages */

const { useState, useEffect, useRef } = React;

/* ----------------------------------------------------------------
   SHARED HELPERS
   ---------------------------------------------------------------- */
function usePageTitle(title) {
  useEffect(() => {
    const base = "Christian Dating Do's and Don'ts";
    document.title = title ? `${title} | ${base}` : base;
    return () => { document.title = base; };
  }, [title]);
}

function PageShell({ children, user, onNav }) {
  return (
    <div>
      <TopNav user={user} onNav={onNav} />
      {children}
      <Footer onNav={onNav} user={user} />
    </div>
  );
}

function renderFaithText(text) {
  const parts = text.split(/(\([^)]*\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('(') && part.endsWith(')')) {
      return (
        <span key={i} style={{ fontSize: 13, color: 'var(--ink-mute)' }}>{part}</span>
      );
    }
    return part;
  });
}

function FaithParagraph({ children }) {
  return (
    <p style={{
      margin: '0 0 16px', fontFamily: 'var(--sans)', fontSize: 15.5,
      color: 'var(--ink-soft)', lineHeight: 1.75,
    }}>
      {typeof children === 'string' ? renderFaithText(children) : children}
    </p>
  );
}

function LegalSection({ title, children }) {
  return (
    <section>
      <h2 style={{
        margin: '32px 0 12px', fontFamily: 'var(--sans)', fontSize: 15,
        fontWeight: 700, color: 'var(--ink)',
      }}>{title}</h2>
      <p style={{
        margin: 0, fontFamily: 'var(--sans)', fontSize: 15,
        color: 'var(--ink-soft)', lineHeight: 1.7,
      }}>{children}</p>
    </section>
  );
}

function OrangeTextLink({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      background: 'none', border: 'none', padding: 0, cursor: 'pointer',
      color: 'var(--orange)', fontWeight: 600, fontSize: 'inherit',
      fontFamily: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3,
    }}>{children}</button>
  );
}

/* ----------------------------------------------------------------
   DAILY WORD, data helpers (Supabase; does not modify data.jsx)
   ---------------------------------------------------------------- */
const DEFAULT_REACTION_COUNTS = { praying: 12, with_you: 8, amen: 24 };

async function fetchPublicDailyWord() {
  const day = Math.floor(Date.now() / 86400000);
  const fallback = DAILY_WORDS[day % DAILY_WORDS.length];
  if (!isSupabaseConfigured() || !sb) return { ...fallback, id: null };

  const today = new Date().toISOString().slice(0, 10);
  let { data, error } = await sb
    .from('daily_words').select('*')
    .eq('date', today)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) { console.error('[pages] fetchPublicDailyWord', error); return { ...fallback, id: null }; }
  if (!data || !data.length) {
    const res = await sb
      .from('daily_words').select('*')
      .lte('date', today)
      .order('date', { ascending: false })
      .limit(1);
    data = res.data;
  }
  if (!data || !data.length) return { ...fallback, id: null };
  const w = data[0];
  return {
    id: w.id,
    type: w.type,
    body: w.body,
    reference: w.reference,
    translation: w.translation,
    reflection: w.reflection,
  };
}

async function fetchDailyWordReactionCounts() {
  if (!isSupabaseConfigured() || !sb) return DEFAULT_REACTION_COUNTS;

  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data: posts } = await sb
      .from('community_posts')
      .select('id')
      .eq('category', 'word')
      .gte('created_at', `${today}T00:00:00`);

    if (!posts?.length) return DEFAULT_REACTION_COUNTS;

    const postIds = posts.map(p => p.id);
    const { data: reactions, error } = await sb
      .from('post_reactions')
      .select('kind')
      .in('post_id', postIds);

    if (error) { console.error('[pages] fetchDailyWordReactionCounts', error); return DEFAULT_REACTION_COUNTS; }

    const counts = { praying: 0, with_you: 0, amen: 0 };
    for (const r of reactions || []) {
      if (counts[r.kind] != null) counts[r.kind] += 1;
    }
    if (counts.praying + counts.with_you + counts.amen === 0) return DEFAULT_REACTION_COUNTS;
    return counts;
  } catch (e) {
    console.error('[pages] fetchDailyWordReactionCounts', e);
    return DEFAULT_REACTION_COUNTS;
  }
}

/* ----------------------------------------------------------------
   PAGE 1: /daily-word
   ---------------------------------------------------------------- */
function DailyWordPage({ user, onNav }) {
  usePageTitle("Today's Word");
  const [word, setWord] = useState(() => {
    const day = Math.floor(Date.now() / 86400000);
    return DAILY_WORDS[day % DAILY_WORDS.length];
  });
  const [reactions, setReactions] = useState(DEFAULT_REACTION_COUNTS);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const weekly = WEEKLY_PROMPTS.seeking;
  const dateStr = todayDateStr();

  useEffect(() => {
    let active = true;
    (async () => {
      const [w, r] = await Promise.all([
        fetchPublicDailyWord(),
        fetchDailyWordReactionCounts(),
      ]);
      if (!active) return;
      if (w) setWord(w);
      setReactions(r);
    })();
    return () => { active = false; };
  }, []);

  const handleReactionClick = () => {
    if (user) return;
    setShowSignupPrompt(true);
  };

  return (
    <PageShell user={user} onNav={onNav}>
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px' }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          Today's Word · {dateStr}
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--orange-soft)', color: 'var(--orange-text)',
          padding: '4px 10px', borderRadius: 'var(--r-pill)',
          fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          marginBottom: 20,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--orange)' }} />
          {word.type}
        </div>

        <blockquote className="serif" style={{
          margin: 0, fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: 1.45,
          fontStyle: 'italic', fontWeight: 500, color: 'var(--ink)',
          marginBottom: 20, textWrap: 'pretty',
        }}>
          {word.body}
        </blockquote>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{word.reference}</span>
          <span style={{ fontSize: 14, color: 'var(--ink-mute)' }}>· {word.translation}</span>
        </div>

        {word.reflection && (
          <>
            <div style={{ height: 1, background: 'var(--line)', margin: '28px 0' }} />
            <div className="eyebrow" style={{ marginBottom: 10 }}>REFLECT</div>
            <p className="serif" style={{
              margin: 0, fontSize: 18, color: 'var(--ink-soft)', lineHeight: 1.55,
            }}>
              {word.reflection}
            </p>
          </>
        )}

        <div style={{
          marginTop: 32, background: 'var(--cream-deep)',
          borderRadius: 'var(--r-lg)', padding: '20px 24px',
        }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>THIS WEEK'S PROMPT</div>
          <p className="serif" style={{
            margin: '0 0 10px', fontSize: 18, color: 'var(--ink)', lineHeight: 1.4,
          }}>
            {weekly.question}
          </p>
          <p style={{
            margin: 0, fontSize: 13, color: 'var(--ink-mute)', fontStyle: 'italic',
          }}>
            Sign in to answer this in your journal
          </p>
        </div>

        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <ReactionPill emoji="🙏" label="Praying" count={reactions.praying} primary onClick={handleReactionClick} />
            <ReactionPill emoji="❤️" label="With You" count={reactions.with_you} onClick={handleReactionClick} />
            <ReactionPill emoji="✝️" label="Amen" count={reactions.amen} onClick={handleReactionClick} />
          </div>
          {showSignupPrompt && !user && (
            <p style={{ margin: '12px 0 0', fontSize: 14, color: 'var(--ink-soft)' }}>
              <OrangeTextLink onClick={() => onNav('signup')}>
                Sign up to pray with the community →
              </OrangeTextLink>
            </p>
          )}
          <p style={{
            margin: '18px 0 0', fontSize: 13, color: 'var(--ink-mute)', fontStyle: 'italic',
          }}>
            Sign in to share your reflection with the community{' '}
            <OrangeTextLink onClick={() => onNav('signup')}>Join free for 7 days →</OrangeTextLink>
          </p>
        </div>

        <div style={{
          marginTop: 48, background: 'var(--white)', borderRadius: 'var(--r-xl)',
          padding: 32, boxShadow: 'var(--shadow-card)', textAlign: 'center',
        }}>
          <p className="serif" style={{
            margin: '0 0 8px', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-mute)',
          }}>
            A word for every season.
          </p>
          <h2 className="serif" style={{
            margin: '0 0 14px', fontSize: 26, fontWeight: 600, color: 'var(--ink)',
          }}>
            Get your daily word every morning.
          </h2>
          <p style={{
            margin: '0 0 22px', fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.6,
          }}>
            Join a community of believers navigating dating, engagement, and starting over, together. Seven days free.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => onNav('signup')}>
            Join the community
          </button>
          <p style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--ink-mute)' }}>
            $12.99/mo or $89/yr after your free trial.
          </p>
        </div>
      </main>
    </PageShell>
  );
}

/* ----------------------------------------------------------------
   PAGE 2: /our-story
   ---------------------------------------------------------------- */
function OurStoryPage({ user, onNav }) {
  usePageTitle('Our Story');

  const paragraphs = [
    'We are Christian App Empire, a small, faith-rooted company founded by a married couple based in Los Angeles.',
    'We have been together for nearly twenty years. We have six kids. We have watched relationships begin in hope and grow into something lasting. We have also watched relationships we loved, whether friends, family, or church family, grow fragile and fall apart. We have been through seasons of our own that we did not expect and did not have a map for.',
    'What we know from all of it is this: encouragement from community is not optional. It is essential. The people around you, the ones who have been where you are, who are honest about what it cost them, who will pray with you and not just advise you, matter more than any article, podcast, or algorithm ever could.',
    'We also know we do not have all the answers. Nobody does. That is exactly why we built this.',
    'Christian Dating Do\'s and Don\'ts is not a platform built by experts telling you what to do. It is a space where believers at every stage of the journey, whether seeking, dating, engaged, or starting over, can find a daily word, an honest question, and the company of people who are in it too.',
  ];

  return (
    <PageShell user={user} onNav={onNav}>
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '72px 24px' }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>OUR STORY</div>
        <h1 className="serif" style={{
          margin: '0 0 32px', fontSize: 'clamp(36px, 4vw, 52px)',
          fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.08, color: 'var(--ink)',
        }}>
          Why we built this.
        </h1>
        {paragraphs.map((p, i) => (
          <p key={i} style={{
            margin: '0 0 20px', fontFamily: 'var(--sans)', fontSize: 17,
            color: 'var(--ink-soft)', lineHeight: 1.75,
          }}>{p}</p>
        ))}
        <p className="serif" style={{
          margin: '28px 0 0', fontSize: 19, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.55,
        }}>
          We built what we wished existed.<br />We hope it serves you well.
        </p>
        <div style={{ height: 1, background: 'var(--line)', margin: '40px 0' }} />
        <button className="btn btn-primary btn-sm" onClick={() => onNav('signup')}>
          Join the community
        </button>
      </main>
    </PageShell>
  );
}

/* ----------------------------------------------------------------
   PAGE 3: /what-we-believe
   ---------------------------------------------------------------- */
function WhatWeBelievePage({ user, onNav }) {
  usePageTitle('What We Believe');
  const [activeId, setActiveId] = useState('the-holy-scriptures');
  const mainRef = useRef(null);

  useEffect(() => {
    const sections = [...FAITH_SIDEBAR.filter(s => s.id !== 'the-gospel').map(s => s.id)];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5] },
    );
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    if (id === 'the-gospel') {
      onNav('the-gospel');
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <PageShell user={user} onNav={onNav}>
      <main className="container" style={{ padding: '72px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '220px minmax(0, 1fr)',
          gap: 48,
          maxWidth: 800,
          margin: '0 auto',
        }} className="faith-layout">
          <aside className="faith-sidebar" style={{
            position: 'sticky', top: 96, alignSelf: 'start',
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FAITH_SIDEBAR.map(link => (
                <button key={link.id} type="button" onClick={() => scrollTo(link.id)} style={{
                  background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer',
                  textAlign: 'left', fontSize: 13, fontFamily: 'var(--sans)',
                  color: activeId === link.id ? 'var(--orange)' : 'var(--ink-mute)',
                  fontWeight: activeId === link.id ? 600 : 400,
                  transition: 'color 140ms ease',
                }}
                  onMouseEnter={e => { if (activeId !== link.id) e.currentTarget.style.color = 'var(--orange)'; }}
                  onMouseLeave={e => { if (activeId !== link.id) e.currentTarget.style.color = 'var(--ink-mute)'; }}
                >{link.label}</button>
              ))}
            </nav>
          </aside>

          <div ref={mainRef}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>WHAT WE BELIEVE</div>
            <h1 className="serif" style={{
              margin: '0 0 12px', fontSize: 'clamp(32px, 4vw, 44px)',
              fontWeight: 600, letterSpacing: '-0.018em', color: 'var(--ink)',
            }}>
              Our Statement of Faith
            </h1>
            <p style={{
              margin: '0 0 40px', fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.55,
            }}>
              The theological convictions that ground this community.
            </p>

            {STATEMENT_OF_FAITH.map((section, idx) => (
              <div key={section.id}>
                {idx > 0 && <div style={{ height: 1, background: 'var(--line)', margin: '40px 0' }} />}
                <section id={section.id}>
                  <h2 className="serif" style={{
                    margin: `${idx === 0 ? 0 : 48}px 0 16px`, fontSize: 24, fontWeight: 600, color: 'var(--ink)',
                  }}>
                    {section.title}
                  </h2>
                  {(section.paragraphs || []).map((p, i) => (
                    <FaithParagraph key={i}>{p}</FaithParagraph>
                  ))}
                  {(section.subsections || []).map(sub => (
                    <div key={sub.id} id={sub.id}>
                      <h3 className="serif" style={{
                        margin: '28px 0 12px', fontSize: 18, fontWeight: 600,
                        color: 'var(--orange-text)',
                      }}>
                        {sub.title}
                      </h3>
                      {sub.paragraphs.map((p, i) => (
                        <FaithParagraph key={i}>{p}</FaithParagraph>
                      ))}
                    </div>
                  ))}
                </section>
              </div>
            ))}
          </div>
        </div>
      </main>
      <style>{`
        @media (max-width: 768px) {
          .faith-sidebar { display: none !important; }
          .faith-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PageShell>
  );
}

/* ----------------------------------------------------------------
   PAGE 4: /the-gospel
   ---------------------------------------------------------------- */
function TheGospelPage({ user, onNav }) {
  usePageTitle('The Gospel');

  return (
    <PageShell user={user} onNav={onNav}>
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '72px 24px' }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>THE GOSPEL</div>
        <h1 className="serif" style={{
          margin: '0 0 20px', fontSize: 'clamp(32px, 4vw, 44px)',
          fontWeight: 600, letterSpacing: '-0.018em', color: 'var(--ink)',
        }}>
          What It Means to Be a Christian
        </h1>
        <p className="serif" style={{
          margin: '0 0 28px', fontSize: 19, fontStyle: 'italic',
          color: 'var(--ink-soft)', lineHeight: 1.55,
        }}>
          Being a Christian is more than identifying yourself with a particular religion or affirming a certain value system. Being a Christian means you have embraced what the Bible says about God, mankind, and salvation.
        </p>

        {GOSPEL_SECTIONS.map(section => (
          <div key={section.title} style={{
            background: 'var(--white)', borderRadius: 'var(--r-lg)',
            padding: 28, marginBottom: 16, boxShadow: 'var(--shadow-soft)',
          }}>
            <div className="eyebrow" style={{ color: 'var(--orange-text)', marginBottom: 12 }}>
              {section.title}
            </div>
            <p style={{
              margin: 0, fontFamily: 'var(--sans)', fontSize: 16,
              color: 'var(--ink-soft)', lineHeight: 1.7,
            }}>{section.body}</p>
          </div>
        ))}

        <p style={{
          margin: '24px 0 0', fontSize: 13, color: 'var(--ink-mute)', fontStyle: 'italic',
        }}>
          Gospel presentation by Grace Community Church, Sun Valley, CA
        </p>

        <div style={{ height: 1, background: 'var(--line)', margin: '40px 0' }} />

        <h2 className="serif" style={{
          margin: '0 0 12px', fontSize: 24, fontWeight: 600, color: 'var(--ink)',
        }}>
          Has this stirred something in you?
        </h2>
        <p style={{
          margin: '0 0 22px', fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.6,
        }}>
          Talk to a pastor, a trusted believer, or reach out to us.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => onNav('signup')}>
            Join the community
          </button>
          <a
            href="mailto:ChristianAppEmpire@gmail.com"
            className="btn btn-outline"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            Contact us
          </a>
        </div>
      </main>
    </PageShell>
  );
}

/* ----------------------------------------------------------------
   PAGE 5: /privacy
   ---------------------------------------------------------------- */
function PrivacyPage({ user, onNav }) {
  usePageTitle('Privacy Policy');

  return (
    <PageShell user={user} onNav={onNav}>
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '72px 24px' }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>LEGAL</div>
        <h1 className="serif" style={{
          margin: '0 0 8px', fontSize: 'clamp(32px, 4vw, 40px)',
          fontWeight: 600, color: 'var(--ink)',
        }}>
          Privacy Policy
        </h1>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--ink-mute)' }}>
          Last updated: June 2026
        </p>

        <LegalSection title="What we collect">
          When you create an account we collect your first name, city, and email address. We also collect your chosen life stage and any posts or replies you submit to the community.
        </LegalSection>
        <LegalSection title="What we do not collect">
          We do not collect your last name, phone number, or any identifying information beyond what you provide. We do not sell your data to anyone, ever.
        </LegalSection>
        <LegalSection title="How we use it">
          Your first name and city are displayed publicly within the community. Your email address is never displayed publicly. We use your email only to manage your account and send you product updates if you opt in.
        </LegalSection>
        <LegalSection title="Payments">
          Subscription payments are processed by Stripe. We do not store your payment information.
        </LegalSection>
        <LegalSection title="Cookies">
          We use cookies to keep you signed in and to understand how the site is used. We do not use cookies for advertising.
        </LegalSection>
        <LegalSection title="Your data">
          You can request deletion of your account and all associated data at any time by emailing us. We will process requests within 30 days.
        </LegalSection>
        <LegalSection title="Contact">
          <a href="mailto:privacy@christiandatingdosanddonts.com" style={{
            color: 'var(--orange)', textDecoration: 'underline', textUnderlineOffset: 3,
          }}>privacy@christiandatingdosanddonts.com</a>
        </LegalSection>
      </main>
    </PageShell>
  );
}

/* ----------------------------------------------------------------
   PAGE 6: /terms
   ---------------------------------------------------------------- */
function TermsPage({ user, onNav }) {
  usePageTitle('Terms of Service');

  return (
    <PageShell user={user} onNav={onNav}>
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '72px 24px' }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>LEGAL</div>
        <h1 className="serif" style={{
          margin: '0 0 8px', fontSize: 'clamp(32px, 4vw, 40px)',
          fontWeight: 600, color: 'var(--ink)',
        }}>
          Terms of Service
        </h1>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--ink-mute)' }}>
          Last updated: June 2026
        </p>

        <LegalSection title="The service">
          We provide a faith-based community platform including a daily word, community thread, and weekly prompts. Features are subject to change.
        </LegalSection>
        <LegalSection title="Your account">
          You are responsible for keeping your account credentials secure. You must be 18 or older to create an account.
        </LegalSection>
        <LegalSection title="Subscriptions">
          Subscriptions are billed monthly or annually. You may cancel at any time. Cancellations take effect at the end of the current billing period. We do not offer refunds for partial periods.
        </LegalSection>
        <LegalSection title="Your content">
          You own what you post. By posting you grant us a non-exclusive license to display your content within the platform. We reserve the right to remove any content that violates our community rules.
        </LegalSection>
        <LegalSection title="Our content">
          The Daily Word, devotionals, prompts, and all platform content are owned by Christian App Empire LLC. Do not reproduce or distribute them without permission.
        </LegalSection>
        <LegalSection title="Limitation of liability">
          This platform is provided as-is. We are not responsible for the content posted by community members. We are not a counseling service, a church, or a substitute for pastoral care.
        </LegalSection>
        <LegalSection title="Governing law">
          These terms are governed by the laws of the State of California.
        </LegalSection>
        <LegalSection title="Contact">
          <a href="mailto:legal@christiandatingdosanddonts.com" style={{
            color: 'var(--orange)', textDecoration: 'underline', textUnderlineOffset: 3,
          }}>legal@christiandatingdosanddonts.com</a>
        </LegalSection>
      </main>
    </PageShell>
  );
}

/* ----------------------------------------------------------------
   PAGE 7: /community-rules
   ---------------------------------------------------------------- */
function CommunityRulesPage({ user, onNav }) {
  usePageTitle('Community Rules');

  const rules = [
    {
      title: 'Be honest, not performative.',
      body: 'Share where you actually are, not where you think you should be. This community is most valuable when it is real.',
    },
    {
      title: 'Encourage, don\'t advise.',
      body: 'You are not anyone\'s counselor or pastor here. Offer prayer, share your experience, speak life, but resist the urge to tell someone what they should do.',
    },
    {
      title: 'No soliciting, no promoting.',
      body: 'Do not use this space to promote a business, ministry, podcast, social media account, or anything else. Posts that do this will be removed without warning.',
    },
    {
      title: 'Keep it anonymous by design.',
      body: 'First name and city only. Do not share last names, phone numbers, social media handles, or any information that identifies you or someone else beyond what the platform provides.',
    },
    {
      title: 'No direct outreach.',
      body: 'This is not a dating platform. Do not attempt to connect with other members outside of this community. Any behavior that feels like solicitation will result in immediate removal.',
    },
    {
      title: 'Speak about your own experience.',
      body: 'Do not name, identify, or describe a specific person you are in a relationship with in a way that could identify them. Protect the people in your story.',
    },
    {
      title: 'Grace first.',
      body: 'Everyone here is in process. Extend the same grace you would want extended to you.',
    },
  ];

  return (
    <PageShell user={user} onNav={onNav}>
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '72px 24px' }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>COMMUNITY</div>
        <h1 className="serif" style={{
          margin: '0 0 12px', fontSize: 'clamp(32px, 4vw, 40px)',
          fontWeight: 600, color: 'var(--ink)',
        }}>
          Community Rules
        </h1>
        <p className="serif" style={{
          margin: '0 0 32px', fontSize: 17, fontStyle: 'italic', color: 'var(--ink-soft)',
        }}>
          This is a safe space. Keep it that way.
        </p>

        {rules.map(rule => (
          <section key={rule.title}>
            <h2 className="serif" style={{
              margin: '32px 0 10px', fontSize: 18, fontWeight: 600, color: 'var(--ink)',
            }}>
              {rule.title}
            </h2>
            <p style={{
              margin: 0, fontFamily: 'var(--sans)', fontSize: 15.5,
              color: 'var(--ink-soft)', lineHeight: 1.7,
            }}>{rule.body}</p>
          </section>
        ))}

        <div style={{
          marginTop: 40, background: 'var(--cream-deep)',
          borderRadius: 'var(--r-lg)', padding: 24,
        }}>
          <p style={{
            margin: 0, fontFamily: 'var(--sans)', fontSize: 14,
            color: 'var(--ink-soft)', lineHeight: 1.7,
          }}>
            Posts that violate these rules will be removed. Repeated violations result in removal from the community. Moderation decisions are final.
            <br /><br />
            We reserve the right to remove any content that contradicts the spirit of this space, even if it does not violate a specific rule.
          </p>
        </div>
      </main>
    </PageShell>
  );
}

Object.assign(window, {
  DailyWordPage,
  OurStoryPage,
  WhatWeBelievePage,
  TheGospelPage,
  PrivacyPage,
  TermsPage,
  CommunityRulesPage,
});
