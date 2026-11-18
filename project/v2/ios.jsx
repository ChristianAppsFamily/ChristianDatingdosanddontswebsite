/* ios.jsx — companion iOS spec */
function XPost({ p, open }) {
  const k = KINDS[p.category];
  return (
    <div className="x-post">
      <div className="post-head"><div className="post-who"><b>{p.name}</b> · {p.location}</div><span className="post-time">{p.time}</span></div>
      <div className="post-tags"><StageBadge stage={p.stage} />{k && <span className="post-kind"><Icon name={k.icon} />{k.label}</span>}</div>
      <p className="post-body">{p.body}</p>
      <div className="x-acts">
        {REACTIONS.map(r => <button key={r.id} className="react" aria-pressed={p.userReaction === r.id} aria-label={r.label}><Icon name={r.icon} /><b>{p.reactions[r.id]}</b><span className="lbl">{r.label}</span></button>)}
        {!open && <span className="rep"><Icon name="message-circle" />{p.replies.length}</span>}
      </div>
    </div>
  );
}
function Tabs({ on }) {
  return <div className="x-tabs">{[['table', 'The Table', 'users'], ['word', 'Daily Word', 'book-open'], ['library', 'Library', 'library']].map(([id, l, i]) => <div key={id} className={on === id ? 'on' : ''}><Icon name={i} />{l}</div>)}</div>;
}
function Bar({ left, right }) {
  return <div className="x-bar">{left || <span></span>}{right}</div>;
}
const Av = () => <span className="avatar" style={{ width: 36, height: 36, fontSize: 15 }}>M</span>;

function ScreenTable() {
  return (
    <div className="x">
      <Bar left={<Mono size={32} />} right={<Av />} />
      <h1 className="x-title">The Table</h1>
      <p className="x-sub">Lift each other up. Anonymously.</p>
      <div className="x-filters"><Filters value="all" onChange={() => {}} /></div>
      <div className="x-compose"><span className="avatar">M</span><span>Share an encouragement, a prayer, a praise…</span><b><Icon name="arrow-up" /></b></div>
      <div style={{ marginTop: 8 }}>{SEED_POSTS.slice(0, 3).map(p => <XPost key={p.id} p={p} />)}</div>
      <Tabs on="table" />
    </div>
  );
}
function ScreenThread() {
  const p = SEED_POSTS[0];
  return (
    <div className="x" style={{ background: 'var(--surface)' }}>
      <Bar left={<button className="ib" aria-label="Back"><Icon name="chevron-left" /></button>} right={<button className="ib" aria-label="More"><Icon name="ellipsis" /></button>} />
      <div style={{ borderBottom: '1px solid var(--line)' }}><XPost p={{ ...p }} open /></div>
      <div style={{ padding: '4px 20px 140px' }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-3)', padding: '14px 0 2px' }}>{p.replies.length} Replies</p>
        {p.replies.slice(0, 3).map(r => (
          <div className="reply" key={r.id} style={{ paddingRight: 0 }}>
            <div className="post-head"><div className="post-who" style={{ flex: '0 1 auto', fontSize: 13.5 }}><b>{r.name}</b> · {r.location}</div><StageBadge stage={r.stage} /><span className="post-time" style={{ marginLeft: 'auto' }}>{r.time}</span></div>
            <p className="post-body" style={{ fontSize: 15 }}>{r.body}</p>
          </div>
        ))}
      </div>
      <div className="x-replybar"><div className="reply-box"><input placeholder="Share encouragement..." readOnly aria-label="Reply" /><button className="btn btn-primary btn-sm" disabled>Post</button></div></div>
    </div>
  );
}
function ScreenWord() {
  const w = DAILY_WORDS[0];
  return (
    <div className="x">
      <Bar left={<span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-3)' }}>{todayStr()}</span>} right={<Av />} />
      <h1 className="x-title">{greeting()}, Beloved</h1>
      <p className="x-sub">You're in <StageBadge stage="seeking" /></p>
      <div className="x-plate"><span className="type">{w.type}</span><blockquote>{w.body}</blockquote><p className="word-ref"><b>{w.reference}</b> · {w.translation}</p></div>
      <p className="x-refl">{w.reflection}</p>
      <div className="x-btns"><button className="btn btn-line btn-sm"><Icon name="bookmark" />Save</button><button className="btn btn-text btn-sm"><Icon name="share" />Share</button></div>
      <Tabs on="word" />
    </div>
  );
}
function ScreenJournal() {
  const q = WEEKLY_PROMPTS.starting.question;
  return (
    <div className="x">
      <Bar left={<button className="ib" aria-label="Close"><Icon name="x" /></button>} right={<button className="btn btn-primary btn-sm">Save reflection</button>} />
      <p style={{ padding: '14px 20px 0' }}><StageBadge stage="starting" /></p>
      <h1 className="x-title" style={{ fontSize: 30, lineHeight: 1.15, paddingTop: 12 }}>{q}</h1>
      <p className="x-sub">This week's prompt · Private to you</p>
      <div className="x-journal">My sister called just to hear my voice. I laughed for the first time in a long while<span className="x-caret"></span></div>
    </div>
  );
}
function ScreenOnboard() {
  return (
    <div className="x">
      <Bar left={<Mono size={32} />} right={<span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-3)' }}>Step 1 of 1</span>} />
      <h1 className="x-title" style={{ fontSize: 44, paddingTop: 20 }}>Where are you right now?</h1>
      <p className="x-sub" style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.5 }}>We'll match your Daily Word, weekly prompt, and Table to your stage. You can change this anytime.</p>
      <div className="x-stage">{STAGE_ORDER.map(id => (
        <button key={id} className="stage-opt" data-s={id} role="radio" aria-checked={id === 'dating'}>
          <span className="stage-ico"><Icon name={STAGES[id].icon} /></span>
          <span><h3>{STAGES[id].label}</h3><p>{STAGES[id].note}</p></span>
          <span className="radio">{id === 'dating' && <Icon name="check" />}</span>
        </button>))}
      </div>
      <div className="x-foot"><button className="btn btn-primary btn-block">Continue <Icon name="arrow-right" /></button></div>
    </div>
  );
}
function ScreenPaywall() {
  return (
    <div className="x">
      <Bar left={<Mono size={32} />} right={<Av />} />
      <h1 className="x-title">The Table</h1>
      <div style={{ filter: 'blur(5px)', opacity: .7 }} aria-hidden="true">{SEED_POSTS.slice(1, 3).map(p => <XPost key={p.id} p={p} />)}</div>
      <div className="x-scrim"></div>
      <div className="x-sheet inverse">
        <div className="x-grab"></div>
        <span className="lock" style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--ink-800)', color: 'var(--gold-300)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}><Icon name="lock" /></span>
        <h2 className="display" style={{ fontSize: 34, margin: '16px 0 10px' }}>Your trial has ended.</h2>
        <p style={{ color: 'var(--text-on-inverse-2)', fontSize: 15 }}>Join the community to keep reading the Table, posting prayers, and praying with believers walking your stage.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}><button className="btn btn-primary btn-block">Subscribe · $49/year</button><button className="btn btn-line btn-block">$6.99/month</button></div>
        <p style={{ fontSize: 12.5, color: 'var(--text-on-inverse-2)', marginTop: 16, textAlign: 'center' }}>Your Daily Word stays open. We never gate the scripture.</p>
      </div>
    </div>
  );
}

const SCREENS = [
  ['The Table', 'Large serif title collapses to inline on scroll. Full-bleed rows divided by hairlines. No cards.', ['Filters scroll horizontally, never bounce', 'Composer is a single pill; tap opens a sheet', 'Reaction labels hide; VoiceOver keeps them'], ScreenTable],
  ['Post & replies', 'Pushes as a native detail view. Reply bar pins above the home indicator and rides the keyboard.', ['One level of replies only', '280 characters, no @mentions', 'Swipe from edge to go back'], ScreenThread],
  ['Daily Word', 'Home of the Daily Word tab. Greeting, gold scripture plate, reflection in the reading face.', ['Never gated', 'Dynamic Type scales plate and reflection', 'Save adds to Library with a light haptic'], ScreenWord],
  ['Weekly prompt journal', 'Presented as a full-screen modal. Feels like a private page, not a form.', ['Save in the top-right, Close top-left', 'Autosaves drafts locally', 'Entries are private, never posted'], ScreenJournal],
  ['Onboarding', 'One question. Four large radio rows. Primary action in the thumb zone.', ['Continue disabled until a stage is chosen', 'Stage editable later in Profile', 'Selection haptic on tap'], ScreenOnboard],
  ['Trial ended', 'Bottom sheet over a blurred, non-interactive feed. Tab bar and Daily Word stay reachable.', ['Sheet uses inverse surface', 'Same copy as web paywall', 'Purchases via StoreKit, separate from web billing'], ScreenPaywall],
];
const RULES = [
  ['Navigation', 'Three tabs: The Table, Daily Word, Library. Profile lives behind the avatar, top-right. Journal is a modal launched from the weekly prompt.'],
  ['Touch & thumb', '44pt minimum targets. Primary actions sit in the bottom quarter. Reactions are 36pt pills with 6pt gaps.'],
  ['Safe areas', 'Content respects the Dynamic Island and home indicator. Tab bar 49pt + inset; reply bar floats above inset.'],
  ['Type', 'Gloock (Noe Display-style) for titles and scripture, upright only; Hanken Grotesk for everything else, mapped to Dynamic Type styles (Body = 16, Read = 17).'],
  ['Motion & haptics', 'Native push and sheet transitions only. Light impact on react and save; success notification on post. Respect Reduce Motion.'],
  ['Accounts', 'The app keeps its own sign-in. Copy never implies sync with the web community. Use the same email to stay organised.'],
];

function IOSSpec() {
  return (
    <div className="ios-page" data-screen-label="iOS companion spec">
      <div className="wrap">
        <header className="ios-head">
          <Brand size={44} />
          <h1 className="display" style={{ marginTop: 40 }}>The same table, in your pocket.</h1>
          <p>Companion visual direction for the iOS redesign. Built from existing product functionality only. No new features. Uses the shared tokens in <code>v2/tokens.json</code>; layouts are native, not the website shrunk down.</p>
        </header>
        <div className="ios-row">
          {SCREENS.map(([t, d, b, C]) => (
            <figure className="ios-fig" key={t} style={{ margin: 0 }} data-screen-label={'iOS · ' + t}>
              <div className="ios-scale"><IOSDevice><C /></IOSDevice></div>
              <figcaption><h3>{t}</h3><p>{d}</p><ul>{b.map(x => <li key={x}>{x}</li>)}</ul></figcaption>
            </figure>
          ))}
        </div>
        <div className="rules">{RULES.map(([h, p]) => <div className="rule" key={h}><h4>{h}</h4><p>{p}</p></div>)}</div>
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<IOSSpec />);
