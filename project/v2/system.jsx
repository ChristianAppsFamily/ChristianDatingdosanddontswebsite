/* system.jsx — Brand system reference + decision record */
const RAMPS = [
  ['Coral', 'coral', ['50', '100', '300', '500', '600', '700', '900']],
  ['Ink', 'ink', ['200', '300', '500', '700', '800', '900']],
  ['Warm', 'warm', ['0', '50', '100', '200', '300']],
  ['Gold', 'gold', ['100', '300', '700']],
  ['Sage', 'sage', ['100', '300', '700']],
  ['Plum', 'plum', ['100', '300', '700']],
];
const DARK_STEPS = { coral: ['700', '900'], ink: ['500', '700', '800', '900'], gold: ['700'], sage: ['700'], plum: ['700'] };
const ROLES = [
  ['--bg', 'Page background', 'Warm White. 80% of every screen.'],
  ['--bg-muted', 'Muted surface', 'Section color-blocks, sunk inputs, locked states.'],
  ['--surface', 'Surface', 'The Table feed sheet, composer, inputs.'],
  ['--bg-inverse', 'Inverse', 'Deep Ink sections: The Table preview, annual plan, paywall.'],
  ['--text', 'Primary text', 'Headlines, post body, labels.'],
  ['--text-2', 'Secondary text', 'Supporting copy, reaction labels.'],
  ['--text-3', 'Tertiary text', 'Metadata: city, time, hints. AA at 5.7:1.'],
  ['--accent', 'Signature coral', 'Primary actions, monogram, one emphasis per view. Never as text on white.'],
  ['--text-accent', 'Accent text', 'Links and coral-coloured words on light grounds.'],
  ['--accent-soft', 'Selected', 'Active reaction fill, focus halo.'],
  ['--line', 'Hairline', 'Dividers between posts and sections.'],
  ['--focus', 'Focus ring', '2px Deep Ink, 3px offset. Gold on inverse.'],
];
const PAIRS = [
  ['Aa', 'Ink on Warm White', '15.5:1', 'var(--bg)', 'var(--text)'],
  ['Aa', 'Ink on Coral', '4.8:1 · buttons', 'var(--accent)', 'var(--ink-900)'],
  ['Aa', 'Coral 700 on Warm', '5.6:1 · links', 'var(--bg)', 'var(--coral-700)'],
  ['Aa', 'Ink 500 on Warm', '5.7:1 · meta', 'var(--bg)', 'var(--ink-500)'],
  ['Aa', 'Warm on Ink', '15.5:1', 'var(--ink-900)', 'var(--warm-50)'],
  ['Aa', 'Gold on Ink', '10.9:1 · focus', 'var(--ink-900)', 'var(--gold-300)'],
];
const DECISIONS = [
  ['Coral carries ink, not white', 'White on #EA624F fails AA (3.3:1). Every coral fill uses Deep Ink type, which also gives the brand a distinctive, warmer button than the white-on-orange SaaS default.'],
  ['One coral moment per view', 'Coral is the signature: monogram, primary CTA, feature numerals. Headlines stay entirely Deep Ink. Selected chips and filters use Deep Ink so coral never becomes wallpaper.'],
  ['The Table is a sheet, not a card stack', 'Posts sit in one continuous surface separated by hairlines, like seats along one table. No per-post shadows, no floating cards. It reads as a single conversation.'],
  ['Stages are colour + word, never colour alone', 'Each stage badge pairs a tint, a dot and its label so it works for colour-blind members. Starting Over moved from blue to sage to stay inside the brand palette.'],
  ['Line icons replace emoji in chrome', 'Praying, With You, Amen and stage icons use Lucide outlines. Emoji stay available inside member posts, where they belong to the person.'],
  ['Refined Contemporary type', 'A Noe Display-style editorial serif (Gloock) for headlines and scripture; a Graphik-style grotesk (Hanken Grotesk) for everything else. Post bodies are 17/1.68, max 62ch. Both are OFL-licensed stand-ins until Noe Display / Graphik are licensed.'],
  ['Upright only, controlled scale', 'No italic anywhere in headlines, including "Christian dating". Hero type tops out at 74px so the photo and product preview share the first screen.'],
  ['Inverse sections create rhythm', 'Deep Ink blocks (Table preview, annual plan, final CTA, sign-in aside) break up Warm White without gradients or blobs.'],
  ['Photography is labelled as illustrative', 'Every lifestyle photo slot carries an "Illustrative photo" tag and never sits beside member names, so models are never mistaken for members.'],
  ['Gated content is structurally gated', 'Blurred posts are aria-hidden and inert, not just visually obscured. The Daily Word is never gated.'],
  ['Separate accounts stay explicit', 'The app banner and Take it with you card keep the existing "separate by design" copy. Nothing implies shared sign-in.'],
  ['Mobile is a different layout, not a smaller one', 'Below 760px the member area switches to a bottom tab bar, horizontally scrolling filters and full-bleed feed rows, matching the iOS spec.'],
];

function Sec({ id, kicker, title, intro, children }) {
  return (
    <section className="sys-sec" id={id}>
      <div className="wrap">
        <header><h2><small>{kicker}</small>{title}</h2>{intro && <p>{intro}</p>}</header>
        {children}
      </div>
    </section>
  );
}

function LivePost({ id }) {
  const [post, setPost] = useState(() => { const p = SEED_POSTS.find(x => x.id === id); return { ...p, reactions: { ...p.reactions }, replies: p.replies.map(r => ({ ...r, reactions: { ...r.reactions } })) }; });
  const tog = (it, k) => { const n = { ...it, reactions: { ...it.reactions } }; if (it.userReaction) n.reactions[it.userReaction]--; if (it.userReaction === k) n.userReaction = null; else { n.reactions[k]++; n.userReaction = k; } return n; };
  return <div className="feed"><PostItem post={post} onReact={(_, k) => setPost(p => tog(p, k))} onReplyReact={(_, rid, k) => setPost(p => ({ ...p, replies: p.replies.map(r => r.id === rid ? tog(r, k) : r) }))} onReply={(_, body) => setPost(p => ({ ...p, replies: [...p.replies, { id: 'x' + Date.now(), name: 'Marcus', location: 'Houston, TX', stage: 'seeking', time: 'just now', body, reactions: { praying: 0, with_you: 0, amen: 0 }, userReaction: null }] }))} /></div>;
}

function System() {
  const [f, setF] = useState('all');
  const [saved, setSaved] = useState(false);
  const word = DAILY_WORDS[0];
  const nav = [['brand', 'Brand marks'], ['color', 'Color'], ['type', 'Type'], ['space', 'Space & shape'], ['controls', 'Buttons & inputs'], ['stages', 'Stages'], ['table', 'The Table'], ['word', 'Devotional'], ['states', 'States'], ['dark', 'Dark mode'], ['decisions', 'Decisions']];
  return (
    <div className="sys" data-screen-label="Brand system">
      <div className="sys-hero inverse">
        <div className="wrap">
          <Brand size={48} />
          <h1 className="display" style={{ marginTop: 48 }}>Modern Romance. Rooted in Faith.</h1>
          <p>The shared visual system for the Christian Dating Do's &amp; Don'ts website and the redesigned iOS app. Source of truth: <code style={{ background: 'var(--ink-800)', color: 'var(--warm-50)' }}>v2/tokens.json</code> and <code style={{ background: 'var(--ink-800)', color: 'var(--warm-50)' }}>v2/tokens.css</code>.</p>
          <div className="meta"><div><b>Gloock</b>Noe Display-style · headlines</div><div><b>Hanken Grotesk</b>Graphik-style · interface</div><div><b>#EA624F</b>Signature coral</div><div><b>v2.0</b>Web + iOS</div></div>
        </div>
      </div>
      <nav className="sys-nav" aria-label="Sections"><div className="wrap">{nav.map(([id, l]) => <a key={id} href={'#' + id}>{l}</a>)}</div></nav>

      <Sec id="brand" kicker="01" title="Brand marks" intro="The full name always appears in marketing contexts. The D&D monogram stands alone where space is tight: app icon, favicon, avatar fallback, compact navigation.">
        <div className="sys-grid g2">
          <div className="tile"><div className="marks"><Mono size={96} /><Mono size={64} /><Mono size={40} /><Mono size={24} /><Mono size={16} /></div><p className="cap">Monogram at 96 → 16px. Rounded square at 28% radius. Coral field, ink letters, warm-white ampersand. Upright.</p></div>
          <div className="tile"><div className="marks"><div className="app-tile coral">D<i>&amp;</i>D</div><div className="app-tile ink">D<i>&amp;</i>D</div><div className="app-tile warm">D<i>&amp;</i>D</div></div><p className="cap">iOS app icon candidates. Coral is primary; Ink for dark home screens; Warm for alternate icon.</p></div>
          <div className="tile"><Brand size={44} /><p className="cap">Lockup: monogram + two-line wordmark. Minimum width 180px.</p></div>
          <div className="tile inv"><Brand size={44} /><p className="cap">On inverse the wordmark flips to warm white. The monogram never changes colour.</p></div>
        </div>
        <p className="cap" style={{ marginTop: 16 }}>Avoid: adding crosses, hearts, rings or hands to the mark; outlining it; placing it on photography without a solid field.</p>
      </Sec>

      <Sec id="color" kicker="02" title="Color" intro="Warm White leads. Deep Ink gives contrast and drama. Coral is a signature, used once or twice per view. Gold, sage and plum appear only as stage tints and panels.">
        {RAMPS.map(([n, k, steps]) => (
          <div className="ramp-row" key={k}><b>{n}</b>
            <div className="ramp">{steps.map(s => <div key={s} style={{ background: `var(--${k}-${s})`, color: (DARK_STEPS[k] || []).includes(s) ? 'var(--warm-50)' : 'var(--ink-900)' }}>{s}</div>)}</div>
          </div>
        ))}
        <h3 className="sys-h3">Semantic roles</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="roles"><thead><tr><th></th><th>Token</th><th>Role</th><th>Use</th></tr></thead>
            <tbody>{ROLES.map(([t, r, u]) => <tr key={t}><td><div className="sw" style={{ background: `var(${t})` }}></div></td><td><code>{t}</code></td><td><b>{r}</b></td><td style={{ color: 'var(--text-2)' }}>{u}</td></tr>)}</tbody>
          </table>
        </div>
        <h3 className="sys-h3">Contrast pairs (WCAG AA)</h3>
        <div className="pairs">{PAIRS.map(([a, l, r, bg, fg]) => <div key={l} className="pair" style={{ background: bg, color: fg, border: bg === 'var(--bg)' ? '1px solid var(--line)' : 0 }}><b>{a}</b><div><span style={{ display: 'block' }}>{l}</span><span style={{ opacity: .8 }}>{r}</span></div></div>)}</div>
      </Sec>

      <Sec id="type" kicker="03" title="Type" intro="Refined Contemporary. Upright only, Deep Ink headlines, confident but controlled scale. Hanken Grotesk 17/1.68 is the reading size for posts and reflections.">
        {[
          ['Display XL', 'Serif 40–74 / 1.06', <span className="display" style={{ fontSize: 'var(--fs-display-xl)' }}>You don't have to navigate Christian dating alone.</span>],
          ['H1', 'Serif 32–48 / 1.06', <span className="display" style={{ fontSize: 'var(--fs-h1)' }}>Three small things, done well.</span>],
          ['H3', 'Serif 24 / 1.15', <span className="display" style={{ fontSize: 24 }}>Take it with you</span>],
          ['Scripture plate', 'Serif 26–34 / 1.3', <span style={{ fontFamily: 'var(--font-display)', fontSize: 30, lineHeight: 1.3 }}>{word.body}</span>],
          ['Lead', 'Sans 500 19 / 1.55', <span style={{ fontSize: 19, fontWeight: 500, color: 'var(--text-2)' }}>A daily word, a weekly question, and a quiet table of believers.</span>],
          ['Read', 'Sans 400 17 / 1.68', <span style={{ fontSize: 17, lineHeight: 1.68 }}>{SEED_POSTS[0].body}</span>],
          ['Label', 'Sans 700 13.5', <span style={{ fontSize: 13.5, fontWeight: 700 }}>Choose a plan</span>],
          ['Meta', 'Sans 600 13 · Ink 500', <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Marcus — Texas · 3 hours ago</span>],
        ].map(([n, s, ex]) => <div className="spec-row" key={n}><span><b>{n}</b>{s}</span><div>{ex}</div></div>)}
      </Sec>

      <Sec id="space" kicker="04" title="Space & shape" intro="4pt base. Hairlines over shadows. Radii grow with the size of the object: chips are pills, sheets are 22, hero media is 30.">
        <div className="sys-grid g2">
          <div className="tile"><div className="space-bars">{[4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96].map(v => <div key={v}><span style={{ width: 28 }}>{v}</span><i style={{ width: v * 2.4 }}></i></div>)}</div><p className="cap">Screen edge 20 (mobile) → 56 (desktop). Section rhythm 80–128. Reading column 640.</p></div>
          <div className="tile"><div className="radii">{[['xs', 6], ['sm', 10], ['md', 14], ['lg', 22], ['xl', 30], ['full', 46]].map(([n, r]) => <div key={n} style={{ borderRadius: r }}>{n} · {n === 'full' ? '∞' : r}</div>)}</div><p className="cap">Touch targets ≥ 44. Chips 40, reactions 38, primary buttons 52.</p></div>
        </div>
      </Sec>

      <Sec id="controls" kicker="05" title="Buttons & inputs" intro="Pill buttons with heavy labels. Primary is coral with ink type; Ink is the secondary hero; Line for tertiary; Text for low-emphasis navigation.">
        <div className="sys-grid g2">
          {[['Default', ''], ['Hover', 'is-hover'], ['Focus', 'is-focus'], ['Disabled', 'dis']].map(([l, c]) => (
            <div className="tile" key={l}><span className="state-lbl">{l}</span><div className="row-demo">
              <button className={'btn btn-primary ' + c} disabled={c === 'dis'}>Start free trial</button>
              <button className={'btn btn-ink ' + c} disabled={c === 'dis'}>Answer in your journal</button>
              <button className={'btn btn-line ' + c} disabled={c === 'dis'}>Start with monthly</button>
              <button className="btn btn-text" disabled={c === 'dis'}>Learn more</button>
            </div></div>
          ))}
        </div>
        <div className="sys-grid g3" style={{ marginTop: 20 }}>
          <div className="tile"><div className="field"><label>Email</label><input className="input" placeholder="you@example.com" /></div><p className="cap">Default · 54px, radius 14</p></div>
          <div className="tile"><div className="field"><label>City</label><input className="input is-focus" defaultValue="Houston, TX" /><span className="hint">Only your first name + city are ever shown publicly.</span></div><p className="cap">Focus · ink border + coral halo</p></div>
          <div className="tile"><div className="field"><label>Email</label><input className="input" aria-invalid="true" defaultValue="marcus@" /><span className="hint" style={{ color: 'var(--error)' }}>Enter an email address like you@example.com.</span></div><p className="cap">Error · message says what to do next</p></div>
        </div>
      </Sec>

      <Sec id="stages" kicker="06" title="Life stages" intro="Four seasons, each with a tint, a dot, an icon and its name. Filters use Deep Ink when selected so stage colour stays meaningful.">
        <div className="sys-grid g4">{STAGE_ORDER.map(s => <div className="tile" key={s}><Icon name={STAGES[s].icon} className="" /><div style={{ margin: '14px 0 10px' }}><StageBadge stage={s} large /></div><p className="cap" style={{ marginTop: 0 }}>{STAGES[s].note}</p></div>)}</div>
        <h3 className="sys-h3">Filter bar — horizontally scrollable on mobile</h3>
        <Filters value={f} onChange={setF} />
      </Sec>

      <Sec id="table" kicker="07" title="The Table" intro="One continuous sheet of seats, divided by hairlines. Author and city first, then stage, then the words. Reactions are quiet outlines until chosen. Try it — this post is live.">
        <div style={{ maxWidth: 760 }}><LivePost id="p1" /></div>
        <div className="sys-grid g3" style={{ marginTop: 24 }}>
          <div className="tile"><span className="state-lbl">Reaction · resting</span><div className="actions"><button className="react"><Icon name="hand-heart" /><b>24</b><span className="lbl">Praying</span></button></div></div>
          <div className="tile"><span className="state-lbl">Reaction · chosen</span><div className="actions"><button className="react" aria-pressed="true"><Icon name="hand-heart" /><b>25</b><span className="lbl">Praying</span></button></div></div>
          <div className="tile"><span className="state-lbl">Reply · locked</span><div className="reply-locked" style={{ marginTop: 0 }}><span>Subscribe to join the conversation.</span><a href="#">Subscribe →</a></div></div>
        </div>
      </Sec>

      <Sec id="word" kicker="08" title="Devotional layouts" intro="Scripture gets a quiet gold plate, upright serif and mandatory translation attribution. Reflection follows in the reading face.">
        <div className="sys-grid g2">
          <WordCard word={word} saved={saved} onSave={() => setSaved(!saved)} onOpen={() => {}} />
          <PromptCard stage="starting" onJournal={() => {}} />
        </div>
      </Sec>

      <Sec id="states" kicker="09" title="Loading, empty, error, success" intro="Plainspoken. Explain what happened and what to do next. No exclamation points.">
        <div className="sys-grid g4">
          <div className="state-box tile"><div className="skel" style={{ height: 14, width: '50%' }}></div><div className="skel" style={{ height: 12, width: '30%' }}></div><div className="skel" style={{ height: 14, width: '100%', marginTop: 10 }}></div><div className="skel" style={{ height: 14, width: '85%' }}></div><div className="skel" style={{ height: 32, width: '60%', marginTop: 10, borderRadius: 20 }}></div><p className="cap">Loading · skeleton seat</p></div>
          <div className="state-box tile" style={{ textAlign: 'center', alignItems: 'center' }}><Icon name="message-circle" /><h4>No posts here yet.</h4><p>Be the first to say something this week.</p></div>
          <div className="state-box err"><Icon name="wifi-off" /><h4>We couldn't share that.</h4><p>Check your connection and try again. Your words are still in the box.</p></div>
          <div className="state-box ok"><Icon name="check" /><h4>Shared with the Table</h4><p>Toast, 2.2s, bottom centre. Ink pill with gold check.</p></div>
        </div>
      </Sec>

      <Sec id="dark" kicker="10" title="Dark mode strategy" intro="Not shipped on web yet. On iOS, dark mode swaps roles, not primitives: aubergine-black grounds, warm-white text, coral reserved for the primary action. Shadows disappear; elevation comes from lighter surfaces.">
        <div className="sys-grid g2">
          <div className="dark-demo"><LivePost id="p6" /></div>
          <div className="tile">
            {[['bg', '#18131B'], ['surface', '#221C26'], ['muted', '#2B2430'], ['line', '#352D3A'], ['text', '#F6EFE8'], ['text-3', '#A69BA9'], ['accent', '#EA624F (unchanged)'], ['accent text', '#F4A193']].map(([k, v]) => <div key={k} className="spec-row" style={{ gridTemplateColumns: '110px 1fr', padding: '10px 0' }}><span><b>{k}</b></span><code>{v}</code></div>)}
            <p className="cap">Stage tints become low-luminance fills with light foregrounds. Every pair re-verified at AA.</p>
          </div>
        </div>
      </Sec>

      <Sec id="decisions" kicker="11" title="Design decisions" intro="The reasoning behind the redesign, so future screens can follow it.">
        <div className="decisions">{DECISIONS.map(([h, p]) => <div className="decision" key={h}><h4>{h}</h4><p>{p}</p></div>)}</div>
        <div className="flag"><b>Open items.</b> Google sign-in is referenced in the brief but no Google flow existed in the current site, so none was added. Photography slots are placeholders awaiting licensed imagery. The "Lift · 100" streak indicator is kept as-is from the existing Table header.</div>
      </Sec>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<System />);
