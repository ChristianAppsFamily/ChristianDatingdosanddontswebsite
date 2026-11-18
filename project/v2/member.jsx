/* member.jsx — authenticated experience */
function AppShell({ user, route, onNav, children }) {
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    if (!menu) return;
    const h = () => setMenu(false);
    const k = e => e.key === 'Escape' && setMenu(false);
    window.addEventListener('click', h); window.addEventListener('keydown', k);
    return () => { window.removeEventListener('click', h); window.removeEventListener('keydown', k); };
  }, [menu]);
  const tabs = [['table', 'The Table', 'users'], ['word', 'Daily Word', 'book-open'], ['library', 'Library', 'library']];
  const cur = route === 'journal' ? 'word' : route;
  return (
    <div className="app-body">
      <header className="app-top">
        <div className="wrap">
          <Brand onClick={() => onNav('table')} size={38} />
          <nav className="app-tabs" aria-label="Primary">
            {tabs.map(([id, l, ic]) => <button key={id} className="app-tab" aria-current={cur === id ? 'page' : undefined} onClick={() => onNav(id)}><Icon name={ic} />{l}</button>)}
          </nav>
          <div className="app-right" onClick={e => e.stopPropagation()}>
            <button className="avatar" aria-haspopup="menu" aria-expanded={menu} aria-label="Account menu" onClick={() => setMenu(!menu)}>{(user.name || 'Y')[0]}</button>
            {menu && (
              <div className="menu" role="menu">
                <div className="menu-head"><b>{user.name}</b><span>{(STAGES[user.stage] || STAGES.seeking).label} · {user.plan === 'expired' ? 'Trial ended' : user.plan === 'monthly' ? 'Monthly member' : 'Annual member'}</span></div>
                <button role="menuitem" onClick={() => onNav('word')}><Icon name="book-open" />Daily Word</button>
                <button role="menuitem" onClick={() => window.dispatchEvent(new CustomEvent('cddd:subscribe'))}><Icon name="credit-card" />Manage subscription</button>
                <button role="menuitem" onClick={() => onNav('landing')}><Icon name="log-out" />Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>
      {children}
      <nav className="tabbar" aria-label="Primary">
        {tabs.map(([id, l, ic]) => <button key={id} aria-current={cur === id ? 'page' : undefined} onClick={() => onNav(id)}><Icon name={ic} />{l}</button>)}
      </nav>
    </div>
  );
}

function useDailyWord() {
  return useMemo(() => DAILY_WORDS[Math.floor(Date.now() / 86400000) % DAILY_WORDS.length], []);
}

function WordCard({ word, saved, onSave, onOpen }) {
  return (
    <section className="word-card" aria-label="Daily Word">
      <div className="top"><span className="type">{word.type}</span><button className="open" onClick={onOpen}>Daily Word <Icon name="arrow-up-right" /></button></div>
      <blockquote>{word.body}</blockquote>
      <p className="word-ref"><b>{word.reference}</b>· {word.translation}</p>
      {word.reflection && <p className="refl">{word.reflection}</p>}
      <div className="acts">
        <button className="ghost" aria-pressed={saved} onClick={onSave}><Icon name="bookmark" />{saved ? 'Saved' : 'Save'}</button>
        <button className="ghost"><Icon name="share" />Share</button>
      </div>
    </section>
  );
}

function PromptCard({ stage, onJournal }) {
  const s = STAGES[stage];
  return (
    <section className="prompt-card" data-s={stage}>
      <span className="lbl"><Icon name={s.icon} />Weekly prompt · {s.label}</span>
      <h3>{WEEKLY_PROMPTS[stage].question}</h3>
      <button className="btn btn-ink btn-sm" onClick={onJournal}><Icon name="pen-line" />Answer in your journal</button>
    </section>
  );
}

function AppCard() {
  return (
    <section className="app-card">
      <span className="ico"><Icon name="smartphone" /></span>
      <h3>Take it with you</h3>
      <p>The Christian Dating Do's &amp; Don'ts app delivers your daily verse and prayer wall on iOS.</p>
      <div className="note"><b>App and community accounts are separate.</b> Use the same email on both to keep things organized.</div>
      <a className="btn btn-line btn-sm btn-block" href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">Download free app <Icon name="arrow-up-right" /></a>
    </section>
  );
}

function TablePage({ user, expired, posts, saved, onSave, h, onNav }) {
  const [filter, setFilter] = useState('all');
  const word = useDailyWord();
  const list = filter === 'all' ? posts : posts.filter(p => p.stage === filter);
  return (
    <main className="tbl" data-screen-label={expired ? '05 The Table (trial ended)' : '04 The Table'}>
      <div className="wrap">
        <div className="tbl-hello">
          <div>
            <p className="tbl-date">{todayStr()}</p>
            <h1 className="display">{greeting()}, Beloved</h1>
            <p className="tbl-stage">You're in <StageBadge stage={user.stage} />. {STAGES[user.stage].note + '.'}</p>
          </div>
          {expired && <div className="trial-chip">Your trial has ended.<button className="btn btn-primary btn-sm" onClick={h.subscribe}>Subscribe</button></div>}
        </div>
        <div className="tbl-grid">
          <div className="tbl-word"><WordCard word={word} saved={saved.includes(word.reference)} onSave={() => onSave(word)} onOpen={() => onNav('word')} /></div>
          <section className="tbl-feed" aria-labelledby="tbl-h">
            <div className="feed-head">
              <div><h2 id="tbl-h">The Table</h2><p>Lift each other up. Anonymously.</p></div>
              <span className="lift"><Icon name="flame" />Lift · 100</span>
            </div>
            <Filters value={filter} onChange={setFilter} />
            {!expired && <Composer user={user} onSubmit={h.post} />}
            <div className="feed-wrap">
              <div className="feed">
                {list.map((p, i) => {
                  const blur = expired && i > 0;
                  return (
                    <div key={p.id} className={blur ? 'gated' : ''} aria-hidden={blur ? 'true' : undefined} inert={blur ? '' : undefined}>
                      <PostItem post={p} locked={expired} onReact={h.react} onReply={h.reply} onReplyReact={h.replyReact} />
                    </div>
                  );
                })}
                {list.length === 0 && <div className="empty"><Icon name="message-circle" /><h3>No posts here yet.</h3><p>Be the first to say something this week.</p></div>}
              </div>
              {expired && list.length > 1 && (
                <div className="paywall">
                  <div className="paywall-card inverse" role="dialog" aria-labelledby="pw-h">
                    <span className="lock"><Icon name="lock" /></span>
                    <h3 id="pw-h">Your trial has ended.</h3>
                    <p>Subscribe to keep reading the Table, posting prayers, and praying with people in your stage.</p>
                    <div className="row"><button className="btn btn-primary" onClick={h.subscribe}>Subscribe · $49/year</button><button className="btn btn-line" onClick={h.subscribe}>$6.99/month</button></div>
                    <small>Your Daily Word stays open. We never gate the scripture.</small>
                  </div>
                </div>
              )}
            </div>
          </section>
          <aside className="tbl-extras" aria-label="This week">
            <PromptCard stage={user.stage} onJournal={() => onNav('journal')} />
            <AppCard />
            {!expired && <div className="quiet"><b>Before you open the Table</b><p>Name one person to pray for, then pause.</p></div>}
            <p className="faith">“Not by might, nor by power, but by my Spirit.”<span>(Zechariah 4:6)</span></p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function WordPage({ user, saved, onSave, onNav }) {
  const word = useDailyWord();
  const isSaved = saved.includes(word.reference);
  return (
    <main className="reader" data-screen-label="06 Daily Word">
      <div className="wrap">
        <article className="reader-col rise">
          <div className="reader-meta"><span>{todayStr()}</span><span>Daily Word</span></div>
          <div className="reader-plate">
            <span className="type">{word.type}</span>
            <blockquote>{word.body}</blockquote>
            <p className="word-ref"><b>{word.reference}</b>· {word.translation}</p>
          </div>
          {word.reflection && <p className="reader-refl">{word.reflection}</p>}
          <div className="reader-acts">
            <button className="ghost" aria-pressed={isSaved} onClick={() => onSave(word)}><Icon name="bookmark" />{isSaved ? 'Saved' : 'Save'}</button>
            <button className="ghost"><Icon name="share" />Share</button>
          </div>
        </article>
        <div className="reader-next"><PromptCard stage={user.stage} onJournal={() => onNav('journal')} /></div>
      </div>
    </main>
  );
}

function JournalPage({ user, entries, onSaveEntry, onNav }) {
  const [text, setText] = useState('');
  const s = STAGES[user.stage];
  const q = WEEKLY_PROMPTS[user.stage].question;
  return (
    <main className="journal" data-screen-label="07 Journal">
      <div className="wrap"><div className="journal-col rise">
        <button className="back" onClick={() => onNav('table')}><Icon name="arrow-left" />The Table</button>
        <div className="prompt-card" data-s={user.stage} style={{ background: 'none', padding: 0 }}><span className="lbl"><Icon name={s.icon} />Weekly prompt · {s.label}</span></div>
        <h1 className="display">{q}</h1>
        <div className="sheet">
          <label htmlFor="j-text" className="sr-only">Your reflection</label>
          <textarea id="j-text" value={text} onChange={e => setText(e.target.value)} placeholder="Start writing…" />
          <div className="sheet-foot">
            <span>{text.trim() ? text.trim().split(/\s+/).length + ' words' : todayStr()}</span>
            <button className="btn btn-primary btn-sm" disabled={!text.trim()} onClick={() => { onSaveEntry({ q, text: text.trim(), date: todayStr() }); setText(''); }}>Save reflection</button>
          </div>
        </div>
        {entries.length > 0 && (
          <section className="entries" aria-label="Your reflections">
            <h2>Your reflections</h2>
            {entries.map((e, i) => <div className="entry" key={i}><time>{e.date}</time><p>{e.text}</p><q>{e.q}</q></div>)}
          </section>
        )}
      </div></div>
    </main>
  );
}

function LibraryPage({ saved, entries, onNav }) {
  const [tab, setTab] = useState('saved');
  const words = DAILY_WORDS.filter(w => saved.includes(w.reference));
  return (
    <main className="lib" data-screen-label="08 Library">
      <div className="wrap">
        <h1 className="display">Library</h1>
        <div className="lib-tabs filters" role="tablist">
          <button className="chip" role="tab" aria-selected={tab === 'saved'} aria-pressed={tab === 'saved'} onClick={() => setTab('saved')}><Icon name="bookmark" />Saved words · {words.length}</button>
          <button className="chip" role="tab" aria-selected={tab === 'refl'} aria-pressed={tab === 'refl'} onClick={() => setTab('refl')}><Icon name="pen-line" />Reflections · {entries.length}</button>
        </div>
        {tab === 'saved' && (words.length ? (
          <div className="lib-list">{words.map(w => <article className="lib-item" key={w.reference}><span className="type">{w.type}</span><blockquote>{w.body}</blockquote><div className="row"><p className="word-ref"><b>{w.reference}</b>{w.translation}</p></div></article>)}</div>
        ) : <div className="empty lib-empty"><Icon name="bookmark" /><h3>Nothing saved yet.</h3><p>Tap Save on a Daily Word and it lands here.</p><button className="btn btn-line btn-sm" style={{ marginTop: 18 }} onClick={() => onNav('word')}>Today's reading</button></div>)}
        {tab === 'refl' && (entries.length ? (
          <div className="lib-list">{entries.map((e, i) => <article className="lib-item" key={i}><span className="type" style={{ color: 'var(--text-3)' }}>{e.date}</span><p style={{ fontSize: 16, lineHeight: 1.6 }}>{e.text}</p><p className="word-ref">{e.q}</p></article>)}</div>
        ) : <div className="empty lib-empty"><Icon name="pen-line" /><h3>No reflections yet.</h3><p>When you write one, it lands here.</p><button className="btn btn-line btn-sm" style={{ marginTop: 18 }} onClick={() => onNav('journal')}>Answer this week's prompt</button></div>)}
      </div>
    </main>
  );
}

Object.assign(window, { AppShell, TablePage, WordPage, JournalPage, LibraryPage, WordCard, PromptCard, AppCard });
