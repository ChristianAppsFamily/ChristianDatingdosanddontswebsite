/* marketing.jsx — landing page */
function LifestylePhoto({ src, alt }) {
  return <img src={src} alt={alt} loading="lazy" decoding="async" />;
}

function Landing({ onNav, posts }) {
  return (
    <div data-screen-label="01 Landing">
      <AppBanner />
      <header className="mk-nav">
        <div className="wrap">
          <Brand onClick={() => onNav('landing')} />
          <nav className="mk-nav-actions" aria-label="Account">
            <button className="btn btn-text btn-sm" onClick={() => onNav('login')}>Sign in</button>
            <button className="btn btn-primary btn-sm" onClick={() => onNav('signup')}>Start free trial</button>
          </nav>
        </div>
      </header>
      <main>
        <Hero onNav={onNav} post={posts.find(p => p.id === 'p2')} />
        <TablePreview onNav={onNav} posts={posts} />
        <Features posts={posts} />
        <Pricing onNav={onNav} />
        <FinalCTA onNav={onNav} />
      </main>
      <SiteFooter onNav={onNav} />
    </div>
  );
}

function Hero({ onNav, post }) {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div className="rise">
          <p className="mk-mark">A small, faith-forward community</p>
          <h1 className="display">You don't have to navigate Christian dating alone.</h1>
          <p className="hero-sub">A daily word, a weekly question, and a quiet table of believers walking through seeking, dating, engagement, and starting over — together.</p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={() => onNav('signup')}>Start free trial <Icon name="arrow-right" /></button>
            <a className="btn btn-text" href="#what-you-get">Learn more</a>
          </div>
          <p className="hero-fine">7 days free. $6.99/mo or $49/yr after.</p>
          <div className="hero-proof">
            <span className="stage-dots" aria-hidden="true">{STAGE_ORDER.map(s => <span key={s} style={{ background: `var(--${s}-dot)` }}></span>)}</span>
            <span><b>2,400+ believers</b> walking through it together this week.</span>
          </div>
        </div>
        <div className="hero-media">
          <div className="photo hero-photo">
            <span className="photo-tag">Illustrative photo</span>
            <LifestylePhoto src="uploads/hero-friends.jpg" alt="Friends laughing together outdoors on a blanket" />
          </div>
          {post && (
            <div className="hero-post">
              <div className="hero-post-label">From the Table</div>
              <PostItem post={post} teaser />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TablePreview({ onNav, posts }) {
  const shown = posts.slice(0, 3);
  return (
    <section className="mk-table inverse" id="the-table">
      <div className="wrap mk-table-grid">
        <div>
          <p className="sec-label">The Table</p>
          <h2 className="display">The conversation is already happening.</h2>
          <p className="mk-table-sub">Real people, first names, sometimes a city. Anonymous when it needs to be. Always faith-forward.</p>
          <div className="mk-legend">
            {STAGE_ORDER.map(s => <div key={s}><StageBadge stage={s} /><p>{STAGES[s].note}</p></div>)}
          </div>
        </div>
        <div className="table-sheet">
          <div className="table-sheet-head"><h3>The Table</h3><span>Lift each other up. Anonymously.</span></div>
          {shown.map((p, i) => (
            <div key={p.id} className={i > 0 ? 'gated' : ''} aria-hidden={i > 0 ? 'true' : undefined}>
              <PostItem post={p} teaser />
            </div>
          ))}
          <div className="gate">
            <div className="gate-inner">
              <p>Join to read the full Table</p>
              <button className="btn btn-primary" onClick={() => onNav('signup')}>Start free trial <Icon name="arrow-right" /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features({ posts }) {
  const word = DAILY_WORDS[0];
  const p = posts.find(x => x.id === 'p6') || posts[0];
  return (
    <section className="mk-section" id="what-you-get">
      <div className="wrap">
        <div className="mk-head">
          <div><p className="sec-label">What you get</p><h2 className="display">Three small things, done well.</h2></div>
          <p>No swiping. No feeds. No algorithm. Just a daily anchor and a community that knows your stage.</p>
        </div>
        <div className="feat feat-a">
          <div>
            <span className="feat-num">01</span>
            <h3>A Daily Word</h3>
            <p>A short scripture, devotional, or piece of wisdom — chosen for the season you're actually in.</p>
          </div>
          <div className="feat-visual">
            <div className="photo feat-photo">
              <span className="photo-tag">Illustrative photo</span>
              <LifestylePhoto src="uploads/feature-friends.jpg" alt="Two friends embracing in a sunlit field" />
            </div>
            <div className="stage-panel panel-gold">
              <div className="word-preview">
                <span className="type">{word.type}</span>
                <blockquote>{word.body}</blockquote>
                <p className="word-ref"><b>{word.reference}</b>{word.translation}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="feat-pair">
          <div className="feat-card panel-sage">
            <span className="feat-num">02</span>
            <h3>The Table</h3>
            <p>A quiet, anonymous community thread. Pray, encourage, and amen one another by first name only.</p>
            <div className="preview mini-feed"><PostItem post={p} teaser /></div>
          </div>
          <div className="feat-card panel-plum">
            <span className="feat-num">03</span>
            <h3>Stage-aware</h3>
            <p>Seeking, dating, engaged, or starting over — filter to the believers walking the same road you are.</p>
            <div className="preview stage-stack">{STAGE_ORDER.map(s => <StageBadge key={s} stage={s} large />)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing({ onNav }) {
  const includes = ['Daily Word, every morning', 'Stage-aware community thread', 'Weekly prompt for your season', 'Pray and amen anonymously'];
  return (
    <section className="mk-section" id="pricing" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="mk-head">
          <div><p className="sec-label">Pricing</p><h2 className="display">Less than a coffee. Honest pricing.</h2></div>
          <p>A 7-day free trial. Cancel anytime. The Daily Word is always visible — we never gate scripture.</p>
        </div>
        <div className="pricing">
          <div className="plan">
            <div className="plan-top"><span className="plan-name">Monthly</span></div>
            <div className="plan-price"><b>$6.99</b><span>per month</span></div>
            <p className="plan-line">Try for a season, see if it sticks.</p>
            <button className="btn btn-line btn-block" onClick={() => onNav('signup')}>Start with monthly</button>
          </div>
          <div className="plan plan-featured inverse">
            <div className="plan-top"><span className="plan-name">Annual</span><span className="plan-badge">Best value · save 42%</span></div>
            <div className="plan-price"><b>$49</b><span>per year</span></div>
            <p className="plan-line">The way most members stay. Two months free.</p>
            <button className="btn btn-primary btn-block" onClick={() => onNav('signup')}>Start annual trial</button>
          </div>
          <ul className="plan-includes">{includes.map(t => <li key={t}><Icon name="check" />{t}</li>)}</ul>
        </div>
        <p className="price-note">Need help affording it? <a href="mailto:ChristianAppEmpire@gmail.com">Email us</a> — we have a sponsored seats program.</p>
      </div>
    </section>
  );
}

function FinalCTA({ onNav }) {
  return (
    <section className="mk-cta">
      <div className="wrap mk-cta-grid">
        <div>
          <p className="mk-mark">The hard road, walked together</p>
          <h2 className="display">You weren't meant to figure this out alone.</h2>
          <p>Seven days free. No swiping, no algorithm. Just the Word, a question, and the company of the saints.</p>
          <button className="btn btn-ink" onClick={() => onNav('signup')}>Start free trial <Icon name="arrow-right" /></button>
        </div>
        <div className="photo cta-photo">
          <span className="photo-tag">Illustrative photo</span>
          <LifestylePhoto src="uploads/cta-gathering.jpg" alt="Friends sharing tea and laughing together" />
        </div>
      </div>
    </section>
  );
}

const FOOTER_LINKS = {
  'Daily Word': 'daily-word',
  'The Table': 'dashboard',
  'Weekly Prompt': 'journal',
  'Library': 'library',
  'Our story': 'our-story',
  'Statement of faith': 'what-we-believe',
  'Pricing': 'landing#pricing',
  'Contact': 'mailto:ChristianAppEmpire@gmail.com',
  'Privacy': 'privacy',
  'Terms': 'terms',
  'Community rules': 'community-rules',
};

function SiteFooter({ onNav }) {
  const cols = [
    ['Community', ['Daily Word', 'The Table', 'Weekly Prompt', 'Library']],
    ['About', ['Our story', 'Statement of faith', 'Pricing', 'Contact']],
    ['Quiet', ['Privacy', 'Terms', 'Community rules']],
  ];
  const go = (label) => (e) => {
    e.preventDefault();
    const target = FOOTER_LINKS[label];
    if (!target) return;
    if (target.startsWith('mailto:')) {
      window.location.href = target;
      return;
    }
    if (target === 'landing#pricing') {
      if (onNav) onNav('landing', { hash: '#pricing' });
      else window.location.href = '/#pricing';
      return;
    }
    if (onNav) onNav(target);
    else window.location.href = '/' + (target === 'landing' ? '' : target);
  };
  return (
    <footer className="mk-foot">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Brand size={44} onClick={() => onNav && onNav('landing')} />
            <p className="foot-blurb">A small, warm community for Christians navigating dating, engagement, and starting over. Anonymous when you need it. Always faith-forward.</p>
          </div>
          {cols.map(([h, links]) => (
            <nav className="foot-col" key={h} aria-label={h}>
              <h4>{h}</h4>
              <ul>{links.map(l => <li key={l}><a href="#" onClick={go(l)}>{l}</a></li>)}</ul>
            </nav>
          ))}
        </div>
        <div className="foot-base">
          <span>© {new Date().getFullYear()} Christian Dating Do's &amp; Don'ts</span>
          <span><q>Plans fail for lack of counsel, but with many advisers they succeed.</q> — Proverbs 15:22</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Landing, SiteFooter, LifestylePhoto });
