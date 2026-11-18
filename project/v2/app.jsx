/* app.jsx — v2 root: routing, state, tweaks */
const V2_DEFAULTS = /*EDITMODE-BEGIN*/{
  "screen": "landing",
  "trialMode": "premium",
  "stage": "seeking"
}/*EDITMODE-END*/;
const MEMBER_ROUTES = ['table', 'word', 'journal', 'library'];
const DEMO_USER = { name: 'Marcus', city: 'Houston, TX', plan: 'annual' };

function App() {
  const [t, setTweak] = useTweaks(V2_DEFAULTS);
  const [screen, setScreen] = useState(t.screen);
  const [user, setUser] = useState({ ...DEMO_USER, stage: t.stage });
  const [pending, setPending] = useState(null);
  const [posts, setPosts] = useState(() => SEED_POSTS.map(p => ({ ...p, reactions: { ...p.reactions }, replies: (p.replies || []).map(r => ({ ...r, reactions: { ...r.reactions } })) })));
  const [saved, setSaved] = useState([]);
  const [entries, setEntries] = useState([]);
  const [toast, setToast] = useState(null);
  const expired = t.trialMode === 'expired';

  useEffect(() => { setScreen(t.screen); }, [t.screen]);
  useEffect(() => { setUser(u => ({ ...u, stage: t.stage })); }, [t.stage]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 2200); return () => clearTimeout(id); }, [toast]);

  const nav = to => { setScreen(to); setTweak('screen', to); window.scrollTo({ top: 0 }); };
  const toggle = (item, kind) => {
    const n = { ...item, reactions: { ...item.reactions } };
    if (item.userReaction) n.reactions[item.userReaction] = Math.max(0, n.reactions[item.userReaction] - 1);
    if (item.userReaction === kind) n.userReaction = null; else { n.reactions[kind]++; n.userReaction = kind; }
    return n;
  };
  const subscribe = () => { setTweak('trialMode', 'premium'); setToast('Welcome to the Table'); };
  useEffect(() => { window.addEventListener('cddd:subscribe', subscribe); return () => window.removeEventListener('cddd:subscribe', subscribe); }, []);
  const me = () => ({ name: user.name, location: user.city, stage: user.stage, time: 'just now', reactions: { praying: 0, with_you: 0, amen: 0 }, userReaction: null });
  const h = {
    subscribe,
    react: (id, k) => setPosts(ps => ps.map(p => p.id === id ? toggle(p, k) : p)),
    replyReact: (pid, rid, k) => setPosts(ps => ps.map(p => p.id === pid ? { ...p, replies: p.replies.map(r => r.id === rid ? toggle(r, k) : r) } : p)),
    reply: (pid, body) => setPosts(ps => ps.map(p => p.id === pid ? { ...p, replies: [...p.replies, { ...me(), id: 'r' + Date.now(), body }] } : p)),
    post: ({ body, category }) => { setPosts(ps => [{ ...me(), id: 'm' + Date.now(), category, body, replies: [] }, ...ps]); setToast('Shared with the Table'); },
  };
  const onSave = w => setSaved(s => {
    const has = s.includes(w.reference);
    setToast(has ? 'Removed from your library' : 'Saved to your library');
    return has ? s.filter(x => x !== w.reference) : [...s, w.reference];
  });

  let view;
  if (screen === 'landing') view = <Landing onNav={nav} posts={posts} />;
  else if (screen === 'signup' || screen === 'login') view = (
    <AuthPage key={screen} mode={screen} onNav={nav} onComplete={info => {
      if (screen === 'login') { setUser(u => ({ ...u, ...DEMO_USER })); nav('table'); return; }
      setPending(info); nav('onboarding');
    }} />
  );
  else if (screen === 'onboarding') view = <Onboarding onNav={nav} onComplete={stage => {
    setUser({ name: pending?.name || 'You', city: pending?.city || 'somewhere', plan: pending?.plan || 'annual', stage });
    setTweak('stage', stage); setTweak('trialMode', 'premium'); nav('table');
  }} />;
  else {
    const shellUser = { ...user, plan: expired ? 'expired' : user.plan };
    const r = MEMBER_ROUTES.includes(screen) ? screen : 'table';
    view = (
      <AppShell user={shellUser} route={r} onNav={nav}>
        {r === 'table' && <TablePage user={user} expired={expired} posts={posts} saved={saved} onSave={onSave} h={h} onNav={nav} />}
        {r === 'word' && <WordPage user={user} saved={saved} onSave={onSave} onNav={nav} />}
        {r === 'journal' && <JournalPage user={user} entries={entries} onNav={nav} onSaveEntry={e => { setEntries(x => [e, ...x]); setToast('Saved to your reflections'); }} />}
        {r === 'library' && <LibraryPage saved={saved} entries={entries} onNav={nav} />}
      </AppShell>
    );
  }

  return (
    <>
      {view}
      <Toast msg={toast} />
      <TweaksPanel title="Tweaks">
        <TweakSection label="Screen" />
        <TweakSelect value={screen} onChange={nav} options={[
          { value: 'landing', label: 'Landing' }, { value: 'signup', label: 'Sign up' }, { value: 'login', label: 'Sign in' },
          { value: 'onboarding', label: 'Onboarding' }, { value: 'table', label: 'The Table' }, { value: 'word', label: 'Daily Word' },
          { value: 'journal', label: 'Journal' }, { value: 'library', label: 'Library' }]} />
        <TweakSection label="Account state" />
        <TweakRadio value={t.trialMode} onChange={v => setTweak('trialMode', v)} options={[{ value: 'premium', label: 'Premium' }, { value: 'expired', label: 'Trial ended' }]} />
        <TweakSection label="Life stage" />
        <TweakSelect value={user.stage} onChange={v => setTweak('stage', v)} options={STAGE_ORDER.map(id => ({ value: id, label: STAGES[id].label }))} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
