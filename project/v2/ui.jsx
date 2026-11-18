/* ui.jsx — shared v2 components */
const { useState, useEffect, useRef, useMemo } = React;

const STAGES = {
  seeking:  { id: 'seeking',  label: 'Seeking',       icon: 'compass',         note: 'Single, trusting God' },
  dating:   { id: 'dating',   label: 'Dating',        icon: 'messages-square', note: 'In a relationship' },
  engaged:  { id: 'engaged',  label: 'Engaged',       icon: 'calendar-check',  note: 'Preparing for marriage' },
  starting: { id: 'starting', label: 'Starting Over', icon: 'sunrise',         note: 'New season after loss' },
};
const STAGE_ORDER = ['seeking', 'dating', 'engaged', 'starting'];
const KINDS = {
  prayer: { label: 'Prayer Request', icon: 'hand-heart' },
  praise: { label: 'Praise Report', icon: 'sun' },
  word:   { label: 'A Word Today', icon: 'book-open' },
  wisdom: { label: 'Wisdom', icon: 'lightbulb' },
};
const REACTIONS = [
  { id: 'praying',  label: 'Praying',  icon: 'hand-heart' },
  { id: 'with_you', label: 'With You', icon: 'heart' },
  { id: 'amen',     label: 'Amen',     icon: 'check' },
];
const APP_STORE_URL = (typeof CONFIG !== 'undefined' && CONFIG.APP_STORE_URL)
  ? CONFIG.APP_STORE_URL
  : 'https://apps.apple.com/us/app/christian-dating-dos-and-donts/id911295588';

function Icon({ name, className = '', label }) {
  return <i className={`icon icon-${name} ${className}`} aria-hidden={label ? undefined : 'true'} aria-label={label}></i>;
}

function Mono({ size = 40 }) {
  return <span className="mono" style={{ width: size, height: size, fontSize: size * 0.34 }} aria-hidden="true">D<i>&amp;</i>D</span>;
}

function Brand({ onClick, size = 40, compact = false }) {
  return (
    <button className="brand" onClick={onClick} aria-label="Christian Dating Do's and Don'ts — home">
      <Mono size={size} />
      {!compact && <span className="wordmark"><small>Christian Dating</small><b>Do's <i>&amp;</i> Don'ts</b></span>}
    </button>
  );
}

function StageBadge({ stage, large }) {
  const s = STAGES[stage];
  if (!s) return null;
  return <span className={'stage' + (large ? ' stage-lg' : '')} data-s={stage}>{s.label}</span>;
}

function Filters({ value, onChange }) {
  const opts = [{ id: 'all', label: 'All' }, ...STAGE_ORDER.map(id => ({ id, label: STAGES[id].label }))];
  return (
    <div className="filters" role="toolbar" aria-label="Filter by life stage">
      {opts.map(o => (
        <button key={o.id} className="chip" aria-pressed={value === o.id} onClick={() => onChange(o.id)} data-s={o.id}>
          {o.id !== 'all' && <span className="dot" style={{ background: 'var(--stage-dot)' }}></span>}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ReactionRow({ item, small, locked, onReact }) {
  return REACTIONS.map(r => (
    <button key={r.id} className={'react' + (small ? ' react-sm' : '')} aria-pressed={item.userReaction === r.id}
      disabled={locked} aria-label={`${r.label}, ${item.reactions[r.id]}`}
      onClick={e => { e.stopPropagation(); !locked && onReact && onReact(r.id); }}>
      <Icon name={r.icon} /><b>{item.reactions[r.id]}</b><span className="lbl">{r.label}</span>
    </button>
  ));
}

function PostItem({ post, onReact, onReply, onReplyReact, locked = false, teaser = false, hideActions = false }) {
  const [open, setOpen] = useState(false);
  const replies = post.replies || [];
  const interactive = !teaser;
  const kind = KINDS[post.category];
  const toggle = () => interactive && setOpen(v => !v);
  return (
    <article className={'post' + (interactive && !open ? ' clickable' : '')} data-open={open}
      onClick={() => interactive && !open && setOpen(true)}>
      <header className="post-head" onClick={e => { if (open) { e.stopPropagation(); setOpen(false); } }} style={{ cursor: open ? 'pointer' : undefined }}>
        <div className="post-who"><b>{post.name}</b> — {post.location}</div>
        <span className="post-time">{post.time}</span>
        {interactive && (
          <button className="post-toggle" aria-expanded={open} aria-label={open ? 'Collapse replies' : 'Expand replies'}
            onClick={e => { e.stopPropagation(); toggle(); }}><Icon name="chevron-down" /></button>
        )}
      </header>
      <div className="post-tags">
        <StageBadge stage={post.stage} />
        {kind && <span className="post-kind"><Icon name={kind.icon} />{kind.label}</span>}
      </div>
      <p className="post-body">{post.body}</p>
      {!hideActions && (
        <div className="actions">
          <ReactionRow item={post} locked={locked || teaser} onReact={k => onReact && onReact(post.id, k)} />
          <button className="replies-btn" aria-expanded={open} disabled={teaser} onClick={e => { e.stopPropagation(); toggle(); }}>
            <Icon name="message-circle" />{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </button>
        </div>
      )}
      {open && <Replies post={post} locked={locked} onReply={onReply} onReplyReact={onReplyReact} />}
    </article>
  );
}

function Replies({ post, locked, onReply, onReplyReact }) {
  const [all, setAll] = useState(false);
  const list = post.replies || [];
  const shown = all ? list : list.slice(0, 3);
  const hidden = list.length - 3;
  return (
    <div className="replies" onClick={e => e.stopPropagation()}>
      {list.length === 0 && <p className="reply-empty">No replies yet. Be the first to encourage {post.name.split(' ')[0]}.</p>}
      {shown.map(r => (
        <div className="reply" key={r.id}>
          <div className="post-head">
            <div className="post-who" style={{ flex: '0 1 auto' }}><b>{r.name}</b> — {r.location}</div>
            <StageBadge stage={r.stage} />
            <span className="post-time" style={{ marginLeft: 'auto' }}>{r.time}</span>
          </div>
          <p className="post-body">{r.body}</p>
          <div className="actions"><ReactionRow item={r} small locked={locked} onReact={k => onReplyReact && onReplyReact(post.id, r.id, k)} /></div>
        </div>
      ))}
      {!all && hidden > 0 && <button className="more-link" onClick={() => setAll(true)}>See {hidden} more {hidden === 1 ? 'reply' : 'replies'}</button>}
      <ReplyBox locked={locked} onSubmit={t => onReply && onReply(post.id, t)} />
    </div>
  );
}

function ReplyBox({ locked, onSubmit }) {
  const [text, setText] = useState('');
  const MAX = 280;
  if (locked) return (
    <div className="reply-locked">
      <span>Subscribe to join the conversation.</span>
      <a href="#" onClick={e => { e.preventDefault(); window.dispatchEvent(new CustomEvent('cddd:subscribe')); }}>Subscribe →</a>
    </div>
  );
  const submit = () => { const t = text.trim(); if (!t) return; onSubmit(t.slice(0, MAX)); setText(''); };
  const left = MAX - text.length;
  return (
    <div className="reply-box">
      <input value={text} maxLength={MAX} placeholder="Share encouragement..." aria-label="Write a reply"
        onChange={e => setText(e.target.value.replace(/@/g, ''))}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }} />
      {text && <span className={'reply-count' + (left <= 40 ? ' warn' : '')} aria-live="polite">{left}</span>}
      <button className="btn btn-primary btn-sm" disabled={!text.trim()} onClick={submit}>Post</button>
    </div>
  );
}

function Composer({ user, onSubmit }) {
  const [text, setText] = useState('');
  const [kind, setKind] = useState('prayer');
  const [open, setOpen] = useState(false);
  const initials = (user.name || 'Y')[0];
  const submit = () => { const t = text.trim(); if (!t) return; onSubmit({ body: t, category: kind, stage: user.stage }); setText(''); setOpen(false); };
  return (
    <div className="composer">
      <span className="avatar" aria-hidden="true">{initials}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <textarea rows={open ? 3 : 1} value={text} onChange={e => setText(e.target.value)} onFocus={() => setOpen(true)}
          placeholder="Share an encouragement, a prayer, a praise…" aria-label="Share with the Table" />
        {open && (
          <div className="composer-row rise">
            <div className="seg" role="group" aria-label="Post type">
              {['prayer', 'praise', 'wisdom'].map(k => <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)}>{KINDS[k].label}</button>)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-text btn-sm" onClick={() => { setText(''); setOpen(false); }}>Cancel</button>
              <button className="btn btn-primary btn-sm" disabled={!text.trim()} onClick={submit}>Share</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const BANNER_KEY = 'cddd:appBannerDismissed';
function AppBanner() {
  const [hidden, setHidden] = useState(() => { try { return localStorage.getItem(BANNER_KEY) === '1'; } catch (e) { return false; } });
  if (hidden) return null;
  return (
    <div className="app-banner" role="region" aria-label="App download">
      <div className="wrap">
        <button className="icon-btn" aria-label="Dismiss" onClick={() => { try { localStorage.setItem(BANNER_KEY, '1'); } catch (e) {} setHidden(true); }}><Icon name="x" /></button>
        <p><Icon name="smartphone" />Also available on iOS — Get the free app.<span>Your app and community accounts are separate — that's by design.</span></p>
        <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">Download</a>
      </div>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast" role="status"><Icon name="check" />{msg}</div>;
}

function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return 'Peace tonight';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 21) return 'Good Evening';
  return 'Peace tonight';
}
const todayStr = (d = new Date()) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

Object.assign(window, { STAGES, STAGE_ORDER, KINDS, REACTIONS, APP_STORE_URL, Icon, Mono, Brand, StageBadge, Filters, ReactionRow, PostItem, Replies, ReplyBox, Composer, AppBanner, Toast, greeting, todayStr });
