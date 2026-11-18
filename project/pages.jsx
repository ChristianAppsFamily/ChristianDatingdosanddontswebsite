/* pages.jsx — faith / legal / public Daily Word (Sunlight shell) */

function usePageTitle(title) {
  useEffect(() => {
    const base = "Christian Dating Do's and Don'ts";
    document.title = title ? `${title} | ${base}` : base;
    return () => { document.title = base; };
  }, [title]);
}

function PageShell({ children, user, onNav }) {
  return (
    <div className="page-shell">
      <header className="mk-nav">
        <div className="wrap">
          <Brand onClick={() => onNav(user ? 'dashboard' : 'landing')} />
          <nav className="mk-nav-actions" aria-label="Account">
            {user ? (
              <button className="btn btn-primary btn-sm" onClick={() => onNav('dashboard')}>The Table</button>
            ) : (
              <>
                <button className="btn btn-text btn-sm" onClick={() => onNav('login')}>Sign in</button>
                <button className="btn btn-primary btn-sm" onClick={() => onNav('signup')}>Start free trial</button>
              </>
            )}
          </nav>
        </div>
      </header>
      {children}
      <SiteFooter onNav={onNav} />
    </div>
  );
}

function renderFaithText(text) {
  const parts = text.split(/(\([^)]*\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('(') && part.endsWith(')')) {
      return <span key={i} className="cite-soft">{part}</span>;
    }
    return part;
  });
}

function FaithParagraph({ children }) {
  return (
    <p className="faith-p">
      {typeof children === 'string' ? renderFaithText(children) : children}
    </p>
  );
}

function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="legal-h">{title}</h2>
      <p className="legal-p">{children}</p>
    </section>
  );
}

function PageLink({ children, onClick }) {
  return <button type="button" className="page-link" onClick={onClick}>{children}</button>;
}

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

function DailyWordPage({ user, onNav }) {
  usePageTitle("Today's Word");
  const [word, setWord] = useState(() => {
    const day = Math.floor(Date.now() / 86400000);
    return DAILY_WORDS[day % DAILY_WORDS.length];
  });
  const [reactions, setReactions] = useState(DEFAULT_REACTION_COUNTS);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const weekly = WEEKLY_PROMPTS.seeking;

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
      <main className="page-main word-public">
        <p className="page-kicker">Today's Word · {todayStr()}</p>
        <span className="type-pill"><i></i>{word.type}</span>
        <blockquote>{word.body}</blockquote>
        <div className="word-meta">
          <b>{word.reference}</b>
          <span>· {word.translation}</span>
        </div>
        {word.reflection && (
          <>
            <div className="divider" />
            <p className="page-kicker">Reflect</p>
            <p className="page-lead" style={{ marginBottom: 0 }}>{word.reflection}</p>
          </>
        )}
        <div className="prompt-box">
          <p className="page-kicker">This week's prompt</p>
          <p style={{ margin: '0 0 10px', fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1.35 }}>{weekly.question}</p>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-3)' }}>Sign in to answer this in your journal</p>
        </div>
        <div className="react-row">
          {[
            ['praying', 'Praying', reactions.praying],
            ['with_you', 'With You', reactions.with_you],
            ['amen', 'Amen', reactions.amen],
          ].map(([id, label, count]) => (
            <button key={id} type="button" className="react-chip" onClick={handleReactionClick}>
              <Icon name={id === 'praying' ? 'hand-heart' : id === 'with_you' ? 'heart' : 'check'} />
              {label} · {count}
            </button>
          ))}
        </div>
        {showSignupPrompt && !user && (
          <p style={{ margin: '12px 0 0', fontSize: 14, color: 'var(--text-2)' }}>
            <PageLink onClick={() => onNav('signup')}>Sign up to pray with the community →</PageLink>
          </p>
        )}
        <div className="faith-card" style={{ marginTop: 48, textAlign: 'center' }}>
          <p className="page-kicker">A word for every season.</p>
          <h2 className="page-title" style={{ fontSize: 28, marginBottom: 14 }}>Get your daily word every morning.</h2>
          <p className="page-lead" style={{ margin: '0 auto 22px' }}>
            Join a community of believers navigating dating, engagement, and starting over, together. Seven days free.
          </p>
          <button className="btn btn-primary" onClick={() => onNav('signup')}>Join the community</button>
          <p style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--text-3)' }}>$6.99/mo or $49/yr after your free trial.</p>
        </div>
      </main>
    </PageShell>
  );
}

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
      <main className="page-main page-body">
        <p className="page-kicker">Our story</p>
        <h1 className="page-title">Why we built this.</h1>
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        <p className="story-pull">We built what we wished existed.<br />We hope it serves you well.</p>
        <div className="divider" style={{ height: 1, background: 'var(--line)', margin: '40px 0' }} />
        <button className="btn btn-primary btn-sm" onClick={() => onNav('signup')}>Join the community</button>
      </main>
    </PageShell>
  );
}

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
      <main className="page-main wide page-body">
        <div className="faith-layout" style={{ display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr)', gap: 48 }}>
          <aside className="faith-sidebar" style={{ position: 'sticky', top: 96, alignSelf: 'start' }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FAITH_SIDEBAR.map(link => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollTo(link.id)}
                  className="page-link"
                  style={{
                    textAlign: 'left',
                    textDecoration: 'none',
                    color: activeId === link.id ? 'var(--text-accent)' : 'var(--text-3)',
                    fontWeight: activeId === link.id ? 700 : 500,
                    fontSize: 13,
                  }}
                >{link.label}</button>
              ))}
            </nav>
          </aside>
          <div ref={mainRef}>
            <p className="page-kicker">What we believe</p>
            <h1 className="page-title" style={{ fontSize: 'clamp(32px, 4vw, 44px)' }}>Our Statement of Faith</h1>
            <p className="page-lead">The theological convictions that ground this community.</p>
            {STATEMENT_OF_FAITH.map((section, idx) => (
              <div key={section.id}>
                {idx > 0 && <div style={{ height: 1, background: 'var(--line)', margin: '40px 0' }} />}
                <section id={section.id}>
                  <h2 style={{ margin: `${idx === 0 ? 0 : 48}px 0 16px`, fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400 }}>{section.title}</h2>
                  {(section.paragraphs || []).map((p, i) => <FaithParagraph key={i}>{p}</FaithParagraph>)}
                  {(section.subsections || []).map(sub => (
                    <div key={sub.id} id={sub.id}>
                      <h3 style={{ margin: '28px 0 12px', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400, color: 'var(--text-accent)' }}>{sub.title}</h3>
                      {sub.paragraphs.map((p, i) => <FaithParagraph key={i}>{p}</FaithParagraph>)}
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

function TheGospelPage({ user, onNav }) {
  usePageTitle('The Gospel');
  return (
    <PageShell user={user} onNav={onNav}>
      <main className="page-main page-body">
        <p className="page-kicker">The Gospel</p>
        <h1 className="page-title" style={{ fontSize: 'clamp(32px, 4vw, 44px)' }}>What It Means to Be a Christian</h1>
        <p className="page-lead" style={{ fontFamily: 'var(--font-display)', fontSize: 19 }}>
          Being a Christian is more than identifying yourself with a particular religion or affirming a certain value system. Being a Christian means you have embraced what the Bible says about God, mankind, and salvation.
        </p>
        {GOSPEL_SECTIONS.map(section => (
          <div key={section.title} className="faith-card">
            <p className="page-kicker" style={{ color: 'var(--text-accent)' }}>{section.title}</p>
            <p style={{ margin: 0 }}>{section.body}</p>
          </div>
        ))}
        <p style={{ margin: '24px 0 0', fontSize: 13, color: 'var(--text-3)' }}>Gospel presentation by Grace Community Church, Sun Valley, CA</p>
        <div style={{ height: 1, background: 'var(--line)', margin: '40px 0' }} />
        <h2 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400 }}>Has this stirred something in you?</h2>
        <p style={{ margin: '0 0 22px', fontSize: 15, color: 'var(--text-2)', lineHeight: 1.6 }}>Talk to a pastor, a trusted believer, or reach out to us.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => onNav('signup')}>Join the community</button>
          <a href="mailto:ChristianAppEmpire@gmail.com" className="btn btn-line">Contact us</a>
        </div>
      </main>
    </PageShell>
  );
}

function PrivacyPage({ user, onNav }) {
  usePageTitle('Privacy Policy');
  return (
    <PageShell user={user} onNav={onNav}>
      <main className="page-main">
        <p className="page-kicker">Legal</p>
        <h1 className="page-title" style={{ fontSize: 'clamp(32px, 4vw, 40px)', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--text-3)' }}>Last updated: June 2026</p>
        <LegalSection title="What we collect">When you create an account we collect your first name, city, and email address. We also collect your chosen life stage and any posts or replies you submit to the community.</LegalSection>
        <LegalSection title="What we do not collect">We do not collect your last name, phone number, or any identifying information beyond what you provide. We do not sell your data to anyone, ever.</LegalSection>
        <LegalSection title="How we use it">Your first name and city are displayed publicly within the community. Your email address is never displayed publicly. We use your email only to manage your account and send you product updates if you opt in.</LegalSection>
        <LegalSection title="Payments">Subscription payments are processed by Stripe. We do not store your payment information.</LegalSection>
        <LegalSection title="Cookies">We use cookies to keep you signed in and to understand how the site is used. We do not use cookies for advertising.</LegalSection>
        <LegalSection title="Your data">You can request deletion of your account and all associated data at any time by emailing us. We will process requests within 30 days.</LegalSection>
        <LegalSection title="Contact"><a href="mailto:privacy@christiandatingdosanddonts.com">privacy@christiandatingdosanddonts.com</a></LegalSection>
      </main>
    </PageShell>
  );
}

function TermsPage({ user, onNav }) {
  usePageTitle('Terms of Service');
  return (
    <PageShell user={user} onNav={onNav}>
      <main className="page-main">
        <p className="page-kicker">Legal</p>
        <h1 className="page-title" style={{ fontSize: 'clamp(32px, 4vw, 40px)', marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--text-3)' }}>Last updated: June 2026</p>
        <LegalSection title="The service">We provide a faith-based community platform including a daily word, community thread, and weekly prompts. Features are subject to change.</LegalSection>
        <LegalSection title="Your account">You are responsible for keeping your account credentials secure. You must be 18 or older to create an account.</LegalSection>
        <LegalSection title="Subscriptions">Subscriptions are billed monthly or annually. You may cancel at any time. Cancellations take effect at the end of the current billing period. We do not offer refunds for partial periods.</LegalSection>
        <LegalSection title="Your content">You own what you post. By posting you grant us a non-exclusive license to display your content within the platform. We reserve the right to remove any content that violates our community rules.</LegalSection>
        <LegalSection title="Our content">The Daily Word, devotionals, prompts, and all platform content are owned by Christian App Empire LLC. Do not reproduce or distribute them without permission.</LegalSection>
        <LegalSection title="Limitation of liability">This platform is provided as-is. We are not responsible for the content posted by community members. We are not a counseling service, a church, or a substitute for pastoral care.</LegalSection>
        <LegalSection title="Governing law">These terms are governed by the laws of the State of California.</LegalSection>
        <LegalSection title="Contact"><a href="mailto:legal@christiandatingdosanddonts.com">legal@christiandatingdosanddonts.com</a></LegalSection>
      </main>
    </PageShell>
  );
}

function CommunityRulesPage({ user, onNav }) {
  usePageTitle('Community Rules');
  const rules = [
    { title: 'Be honest, not performative.', body: 'Share where you actually are, not where you think you should be. This community is most valuable when it is real.' },
    { title: 'Encourage, don\'t advise.', body: 'You are not anyone\'s counselor or pastor here. Offer prayer, share your experience, speak life, but resist the urge to tell someone what they should do.' },
    { title: 'No soliciting, no promoting.', body: 'Do not use this space to promote a business, ministry, podcast, social media account, or anything else. Posts that do this will be removed without warning.' },
    { title: 'Keep it anonymous by design.', body: 'First name and city only. Do not share last names, phone numbers, social media handles, or any information that identifies you or someone else beyond what the platform provides.' },
    { title: 'No direct outreach.', body: 'This is not a dating platform. Do not attempt to connect with other members outside of this community. Any behavior that feels like solicitation will result in immediate removal.' },
    { title: 'Speak about your own experience.', body: 'Do not name, identify, or describe a specific person you are in a relationship with in a way that could identify them. Protect the people in your story.' },
    { title: 'Grace first.', body: 'Everyone here is in process. Extend the same grace you would want extended to you.' },
  ];
  return (
    <PageShell user={user} onNav={onNav}>
      <main className="page-main page-body">
        <p className="page-kicker">Community</p>
        <h1 className="page-title" style={{ fontSize: 'clamp(32px, 4vw, 40px)', marginBottom: 12 }}>Community Rules</h1>
        <p className="page-lead" style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>This is a safe space. Keep it that way.</p>
        {rules.map(rule => (
          <section key={rule.title}>
            <h2 style={{ margin: '32px 0 10px', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400 }}>{rule.title}</h2>
            <p style={{ margin: 0, fontSize: 15.5, color: 'var(--text-2)', lineHeight: 1.7 }}>{rule.body}</p>
          </section>
        ))}
        <div className="faith-card" style={{ marginTop: 40, background: 'var(--bg-muted)' }}>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
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
