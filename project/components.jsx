/* components.jsx — shared UI for Christian Dating Do's & Don'ts */

const { useState, useEffect, useRef, useMemo } = React;

/* ----------------------------------------------------------------
   LIFE STAGES — single source of truth
   ---------------------------------------------------------------- */
const STAGES = {
  seeking:  { id: 'seeking',  label: 'Seeking',       glyph: '🔍', color: 'var(--stage-seeking)',   bg: 'var(--stage-seeking-bg)',   note: 'Single, trusting God' },
  dating:   { id: 'dating',   label: 'Dating',        glyph: '💬', color: 'var(--stage-dating)',    bg: 'var(--stage-dating-bg)',    note: 'In a relationship' },
  engaged:  { id: 'engaged',  label: 'Engaged',       glyph: '💍', color: 'var(--stage-engaged)',   bg: 'var(--stage-engaged-bg)',   note: 'Preparing for marriage' },
  starting: { id: 'starting', label: 'Starting Over', glyph: '🔄', color: 'var(--stage-starting)',  bg: 'var(--stage-starting-bg)',  note: 'New season after loss' },
};
const STAGE_ORDER = ['seeking', 'dating', 'engaged', 'starting'];

/* ----------------------------------------------------------------
   LOGO
   ---------------------------------------------------------------- */
function Logo({ size = 'md', mono = false, onClick }) {
  const big = size === 'lg';
  const wordSize = big ? 28 : size === 'sm' ? 16 : 20;
  const eyeSize = big ? 11 : 10;
  return (
    <button
      onClick={onClick}
      className="serif"
      style={{
        background: 'none', border: 'none', cursor: onClick ? 'pointer' : 'default',
        padding: 0, textAlign: 'left', lineHeight: 1,
        display: 'inline-flex', alignItems: 'center', gap: 10,
      }}
    >
      <Monogram size={big ? 40 : 32} mono={mono} />
      <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 2 }}>
        <span style={{
          fontSize: eyeSize, fontFamily: 'var(--sans)', fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: mono ? 'currentColor' : 'var(--ink-mute)',
        }}>Christian Dating</span>
        <span style={{
          fontSize: wordSize, fontWeight: 700, letterSpacing: '-0.02em',
          color: mono ? 'currentColor' : 'var(--ink)',
          fontStyle: 'normal',
        }}>
          Do's <span style={{ fontStyle: 'italic', fontWeight: 500, color: mono ? 'currentColor' : 'var(--orange)' }}>&amp;</span> Don'ts
        </span>
      </span>
    </button>
  );
}

function Monogram({ size = 32, mono = false }) {
  return (
    <img
      src="logo-mark.png"
      alt="Christian Dating Do's &amp; Don'ts"
      width={size}
      height={size}
      style={{
        width: size, height: size,
        display: 'inline-block', flexShrink: 0, objectFit: 'contain',
      }}
    />
  );
}

/* ----------------------------------------------------------------
   LIFE STAGE TAG — small colored pill
   ---------------------------------------------------------------- */
function StageTag({ stage, small = false }) {
  const s = STAGES[stage];
  if (!s) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color,
      padding: small ? '2px 8px' : '3px 10px',
      borderRadius: 'var(--r-pill)',
      fontSize: small ? 10.5 : 11.5, fontWeight: 600, letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, opacity: 0.85 }} />
      {s.label}
    </span>
  );
}

/* ----------------------------------------------------------------
   CATEGORY TAG — Prayer Request / Praise Report / Reflection
   matches the soft cream-orange tag style from Altar Wall
   ---------------------------------------------------------------- */
function CategoryTag({ kind = 'prayer' }) {
  const map = {
    prayer:  { label: 'Prayer Request', bg: 'var(--orange-soft)', fg: 'var(--orange-text)' },
    praise:  { label: 'Praise Report',  bg: 'var(--orange-soft)', fg: 'var(--orange-text)' },
    word:    { label: 'A Word Today',   bg: 'var(--orange-soft)', fg: 'var(--orange-text)' },
    wisdom:  { label: 'Wisdom',         bg: 'var(--orange-soft)', fg: 'var(--orange-text)' },
  };
  const m = map[kind] || map.prayer;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: m.bg, color: m.fg,
      padding: '4px 11px',
      borderRadius: 'var(--r-pill)',
      fontSize: 12, fontWeight: 600, letterSpacing: '0.01em',
    }}>{m.label}</span>
  );
}

/* ----------------------------------------------------------------
   REACTION PILL — Altar Wall style
   Primary = filled burnt orange; secondaries = outlined white
   ---------------------------------------------------------------- */
function ReactionPill({ emoji, label, count, active = false, primary = false, onClick }) {
  const filled = active || primary;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 32, padding: '0 12px',
        borderRadius: 'var(--r-pill)',
        background: filled ? 'var(--orange)' : 'var(--white)',
        color: filled ? 'var(--white)' : 'var(--ink-soft)',
        border: filled ? '1.5px solid var(--orange)' : '1.5px solid var(--cream-edge)',
        fontSize: 13, fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 160ms cubic-bezier(.2,.7,.2,1)',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseEnter={e => { if (!filled) e.currentTarget.style.borderColor = 'var(--orange)'; }}
      onMouseLeave={e => { if (!filled) e.currentTarget.style.borderColor = 'var(--cream-edge)'; }}
      onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <span style={{ fontSize: 14, lineHeight: 1 }}>{emoji}</span>
      <span style={{ fontWeight: 700, fontSize: 13 }}>{count}</span>
      <span style={{ opacity: filled ? 0.95 : 0.78 }}>{label}</span>
    </button>
  );
}

/* ----------------------------------------------------------------
   POST CARD — community thread item, Altar Wall style
   ---------------------------------------------------------------- */
function PostCard({ post, onReact, onReply, onReplyReact, locked = false, dim = false, teaser = false }) {
  const [expanded, setExpanded] = useState(false);
  const replies = post.replies || [];
  const replyCount = replies.length;
  const interactive = !dim && !teaser;

  const handleCardClick = (e) => {
    if (!interactive) return;
    if (!expanded) setExpanded(true);
  };

  const handleHeaderClick = (e) => {
    e.stopPropagation();
    if (!interactive) return;
    setExpanded(v => !v);
  };

  // Inner click guards — anything interactive stops propagation so the card click doesn't fire.
  const stop = (e) => e.stopPropagation();

  return (
    <article
      onClick={handleCardClick}
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--r-lg)',
        padding: '20px 22px 18px',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        filter: dim ? 'blur(6px) saturate(0.85)' : 'none',
        opacity: dim ? 0.9 : 1,
        userSelect: dim ? 'none' : 'auto',
        cursor: !interactive ? 'default' : (expanded ? 'default' : 'pointer'),
        transition: 'filter 220ms ease, opacity 220ms ease, box-shadow 200ms ease',
      }}
      onMouseEnter={e => { if (interactive && !expanded) e.currentTarget.style.boxShadow = '0 1px 3px rgba(74,47,22,0.08), 0 12px 28px rgba(74,47,22,0.10)'; }}
      onMouseLeave={e => { if (interactive) e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
    >
      {/* author row — clickable header for collapse */}
      <header
        onClick={handleHeaderClick}
        style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: 10, gap: 12,
          cursor: interactive ? 'pointer' : 'default',
        }}
      >
        <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{post.name}</span>
          <span style={{ color: 'var(--ink-mute)' }}> — {post.location}</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--ink-mute)', whiteSpace: 'nowrap' }}>{post.time}</span>
          {interactive && <Chevron up={expanded} />}
        </div>
      </header>

      {/* tags row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {post.category && <CategoryTag kind={post.category} />}
        <StageTag stage={post.stage} small />
      </div>

      {/* body */}
      <div
        className="serif"
        style={{
          fontSize: 17, lineHeight: 1.55, color: 'var(--ink)',
          fontWeight: 400, letterSpacing: '-0.005em',
          marginBottom: 16,
          fontStyle: post.italic ? 'italic' : 'normal',
        }}
      >
        {post.body}
      </div>

      {/* reactions row */}
      <div onClick={stop} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <ReactionPill
          emoji="🙏" label="Praying" count={post.reactions.praying}
          primary
          active={post.userReaction === 'praying'}
          onClick={() => !locked && onReact && onReact(post.id, 'praying')}
        />
        <ReactionPill
          emoji="❤️" label="With You" count={post.reactions.with_you}
          active={post.userReaction === 'with_you'}
          onClick={() => !locked && onReact && onReact(post.id, 'with_you')}
        />
        <ReactionPill
          emoji="✝️" label="Amen" count={post.reactions.amen}
          active={post.userReaction === 'amen'}
          onClick={() => !locked && onReact && onReact(post.id, 'amen')}
        />
        <RepliesPill
          count={replyCount}
          active={expanded}
          interactive={interactive}
          onClick={(e) => { e.stopPropagation(); if (interactive) setExpanded(v => !v); }}
        />
      </div>

      {/* expanded: replies */}
      {expanded && (
        <RepliesSection
          post={post}
          replies={replies}
          locked={locked}
          onReply={onReply}
          onReplyReact={onReplyReact}
        />
      )}
    </article>
  );
}

/* ----------------------------------------------------------------
   CHEVRON — small expand/collapse indicator
   ---------------------------------------------------------------- */
function Chevron({ up }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 22, height: 22, borderRadius: '50%',
      color: 'var(--ink-mute)',
      transition: 'transform 220ms cubic-bezier(.2,.7,.2,1), color 160ms ease',
      transform: up ? 'rotate(180deg)' : 'rotate(0deg)',
    }}>
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/* ----------------------------------------------------------------
   REPLIES PILL — outlined count, matches reaction pill metrics
   ---------------------------------------------------------------- */
function RepliesPill({ count, active, interactive = true, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 32, padding: '0 12px',
        borderRadius: 'var(--r-pill)',
        background: active ? 'var(--cream-deep)' : 'var(--white)',
        color: 'var(--ink-soft)',
        border: '1.5px solid var(--cream-edge)',
        fontSize: 13, fontWeight: 600,
        cursor: interactive ? 'pointer' : 'default',
        transition: 'all 160ms cubic-bezier(.2,.7,.2,1)',
        WebkitTapHighlightColor: 'transparent',
        marginLeft: 'auto',
      }}
      onMouseEnter={e => { if (interactive) { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)'; } }}
      onMouseLeave={e => { if (interactive) { e.currentTarget.style.borderColor = 'var(--cream-edge)'; e.currentTarget.style.color = 'var(--ink-soft)'; } }}
      onMouseDown={e => { if (interactive) e.currentTarget.style.transform = 'scale(0.96)'; }}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <span style={{ fontSize: 14, lineHeight: 1 }}>💬</span>
      <span style={{ fontWeight: 700, fontSize: 13 }}>{count}</span>
      <span style={{ opacity: 0.78 }}>{count === 1 ? 'Reply' : 'Replies'}</span>
    </button>
  );
}

/* ----------------------------------------------------------------
   REPLIES SECTION — list + composer
   ---------------------------------------------------------------- */
function RepliesSection({ post, replies, locked, onReply, onReplyReact }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? replies : replies.slice(0, 3);
  const hiddenCount = Math.max(0, replies.length - 3);

  return (
    <div
      className="fade-in"
      onClick={e => e.stopPropagation()}
      style={{
        marginTop: 18, paddingTop: 18,
        borderTop: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}
    >
      {replies.length === 0 && (
        <div style={{
          fontSize: 13.5, color: 'var(--ink-mute)', fontStyle: 'italic',
          fontFamily: 'var(--serif)',
        }}>
          No replies yet. Be the first to encourage {post.name.split(' ')[0]}.
        </div>
      )}

      {visible.map(r => (
        <ReplyItem
          key={r.id}
          postId={post.id}
          reply={r}
          locked={locked}
          onReact={onReplyReact}
        />
      ))}

      {!showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          style={{
            alignSelf: 'flex-start',
            background: 'none', border: 'none', padding: '2px 0',
            color: 'var(--orange)', fontWeight: 600, fontSize: 14,
            cursor: 'pointer', letterSpacing: '-0.005em',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          See {hiddenCount} more {hiddenCount === 1 ? 'reply' : 'replies'}
          <span style={{ fontSize: 12 }}>↓</span>
        </button>
      )}

      <ReplyComposer
        locked={locked}
        onSubmit={(text) => onReply && onReply(post.id, text)}
      />
    </div>
  );
}

/* ----------------------------------------------------------------
   REPLY ITEM — single reply, smaller reaction pills
   ---------------------------------------------------------------- */
function ReplyItem({ postId, reply, locked, onReact }) {
  return (
    <div style={{
      background: 'var(--paper)',
      borderRadius: 'var(--r-md)',
      padding: '14px 16px 12px',
      border: '1px solid var(--line)',
    }}>
      <header style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 12, marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{reply.name}</span>
            <span style={{ color: 'var(--ink-mute)' }}> — {reply.location}</span>
          </span>
          <StageTag stage={reply.stage} small />
        </div>
        <span style={{ fontSize: 11.5, color: 'var(--ink-mute)', whiteSpace: 'nowrap' }}>{reply.time}</span>
      </header>

      <div
        className="serif"
        style={{
          fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink)',
          marginBottom: 12, letterSpacing: '-0.003em',
        }}
      >
        {reply.body}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <SmallReactionPill
          emoji="🙏" label="Praying" count={reply.reactions.praying}
          primary
          active={reply.userReaction === 'praying'}
          onClick={() => !locked && onReact && onReact(postId, reply.id, 'praying')}
        />
        <SmallReactionPill
          emoji="❤️" label="With You" count={reply.reactions.with_you}
          active={reply.userReaction === 'with_you'}
          onClick={() => !locked && onReact && onReact(postId, reply.id, 'with_you')}
        />
        <SmallReactionPill
          emoji="✝️" label="Amen" count={reply.reactions.amen}
          active={reply.userReaction === 'amen'}
          onClick={() => !locked && onReact && onReact(postId, reply.id, 'amen')}
        />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   SMALL REACTION PILL — same shape, reduced metrics
   ---------------------------------------------------------------- */
function SmallReactionPill({ emoji, label, count, active = false, primary = false, onClick }) {
  const filled = active || primary;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        height: 26, padding: '0 10px',
        borderRadius: 'var(--r-pill)',
        background: filled ? 'var(--orange)' : 'var(--white)',
        color: filled ? 'var(--white)' : 'var(--ink-soft)',
        border: filled ? '1.5px solid var(--orange)' : '1.5px solid var(--cream-edge)',
        fontSize: 12, fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 160ms cubic-bezier(.2,.7,.2,1)',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseEnter={e => { if (!filled) e.currentTarget.style.borderColor = 'var(--orange)'; }}
      onMouseLeave={e => { if (!filled) e.currentTarget.style.borderColor = 'var(--cream-edge)'; }}
      onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
      onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <span style={{ fontSize: 12.5, lineHeight: 1 }}>{emoji}</span>
      <span style={{ fontWeight: 700 }}>{count}</span>
      <span style={{ opacity: filled ? 0.95 : 0.78 }}>{label}</span>
    </button>
  );
}

/* ----------------------------------------------------------------
   REPLY COMPOSER — single-line input + inline Post button
   ---------------------------------------------------------------- */
function ReplyComposer({ locked, onSubmit }) {
  const [text, setText] = useState('');
  const MAX = 280;

  if (locked) {
    return (
      <div style={{
        background: 'var(--white)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-pill)',
        padding: '12px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, flexWrap: 'wrap',
      }}>
        <span className="serif" style={{
          fontSize: 14.5, fontStyle: 'italic', color: 'var(--ink-mute)',
        }}>
          Subscribe to join the conversation.
        </span>
        <a href="#" onClick={e => { e.preventDefault(); window.dispatchEvent(new CustomEvent('cddd:subscribe')); }}
          style={{
            color: 'var(--orange)', fontWeight: 700, fontSize: 14,
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}>Subscribe →</a>
      </div>
    );
  }

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSubmit && onSubmit(t.slice(0, MAX));
    setText('');
  };

  const remaining = MAX - text.length;
  const nearLimit = remaining <= 40;

  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-pill)',
      padding: '6px 6px 6px 18px',
      display: 'flex', alignItems: 'center',
      gap: 10,
      transition: 'border-color 150ms ease, box-shadow 150ms ease',
    }}
      onFocus={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(200, 98, 42, 0.10)'; }}
      onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <input
        type="text"
        value={text}
        maxLength={MAX}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
        placeholder="Share encouragement..."
        style={{
          flex: 1, minWidth: 0,
          border: 'none', outline: 'none', background: 'transparent',
          fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.5,
          color: 'var(--ink)',
          padding: '6px 0',
          fontStyle: text ? 'normal' : 'italic',
        }}
      />
      {text.length > 0 && (
        <span style={{
          fontSize: 11, fontVariantNumeric: 'tabular-nums',
          color: nearLimit ? 'var(--orange)' : 'var(--ink-mute)',
          whiteSpace: 'nowrap',
        }}>{remaining}</span>
      )}
      <button
        onClick={submit}
        disabled={!text.trim()}
        style={{
          height: 36, padding: '0 18px',
          borderRadius: 'var(--r-pill)',
          background: text.trim() ? 'var(--orange)' : 'var(--cream-edge)',
          color: text.trim() ? 'var(--white)' : 'var(--ink-mute)',
          border: 'none',
          fontFamily: 'var(--sans)',
          fontSize: 13.5, fontWeight: 700,
          cursor: text.trim() ? 'pointer' : 'not-allowed',
          transition: 'background 160ms ease, transform 120ms ease',
          flexShrink: 0,
        }}
        onMouseDown={e => { if (text.trim()) e.currentTarget.style.transform = 'scale(0.97)'; }}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        Post
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------
   FILTER BAR — All / Seeking / Dating / Engaged / Starting Over
   ---------------------------------------------------------------- */
function FilterBar({ value, onChange }) {
  const opts = [
    { id: 'all', label: 'All' },
    ...STAGE_ORDER.map(id => ({ id, label: STAGES[id].label })),
  ];
  return (
    <div style={{
      display: 'flex', gap: 8, flexWrap: 'wrap',
      padding: '4px 0',
    }}>
      {opts.map(o => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            style={{
              height: 36, padding: '0 16px',
              borderRadius: 'var(--r-pill)',
              border: active ? '1.5px solid var(--orange)' : '1.5px solid var(--cream-edge)',
              background: active ? 'var(--orange)' : 'transparent',
              color: active ? 'var(--white)' : 'var(--ink-soft)',
              fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 160ms ease',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)'; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--cream-edge)'; e.currentTarget.style.color = 'var(--ink-soft)'; } }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------
   SHARE BOX — top of thread
   ---------------------------------------------------------------- */
function ShareBox({ onSubmit, stage }) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('prayer');
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSubmit({ body: t, category, stage });
    setText('');
    setExpanded(false);
  };

  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--r-lg)',
      padding: expanded ? '18px 20px' : '14px 18px',
      boxShadow: 'var(--shadow-card)',
      transition: 'padding 200ms ease',
    }}>
      <textarea
        ref={ref}
        value={text}
        onChange={e => setText(e.target.value)}
        onFocus={() => setExpanded(true)}
        placeholder="Share an encouragement, a prayer, a praise…"
        rows={expanded ? 3 : 1}
        style={{
          width: '100%', resize: 'none', border: 'none', outline: 'none',
          fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.5,
          color: 'var(--ink)', background: 'transparent',
          padding: 0,
          fontStyle: text ? 'normal' : 'italic',
        }}
      />
      {expanded && (
        <div className="fade-in" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 12, gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['prayer', 'praise', 'wisdom'].map(k => {
              const labels = { prayer: 'Prayer Request', praise: 'Praise Report', wisdom: 'Wisdom' };
              const active = category === k;
              return (
                <button key={k} onClick={() => setCategory(k)} style={{
                  height: 30, padding: '0 12px',
                  borderRadius: 'var(--r-pill)',
                  border: '1.5px solid ' + (active ? 'var(--orange)' : 'var(--cream-edge)'),
                  background: active ? 'var(--orange-soft)' : 'transparent',
                  color: active ? 'var(--orange-text)' : 'var(--ink-mute)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 140ms ease',
                }}>{labels[k]}</button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setText(''); setExpanded(false); }}>Cancel</button>
            <button className="btn btn-primary btn-sm" disabled={!text.trim()} onClick={submit}
              style={{ opacity: text.trim() ? 1 : 0.4 }}>
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------
   APP BANNER — slim, dismissible, sits above the landing TopNav
   ---------------------------------------------------------------- */
const APP_STORE_URL = (typeof CONFIG !== 'undefined' && CONFIG.APP_STORE_URL) ? CONFIG.APP_STORE_URL : 'https://apps.apple.com/';
const APP_BANNER_KEY = 'cddd:appBannerDismissed';

function AppBanner() {
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem(APP_BANNER_KEY) === '1'; }
    catch (e) { return false; }
  });
  if (hidden) return null;
  const dismiss = () => {
    try { localStorage.setItem(APP_BANNER_KEY, '1'); } catch (e) {}
    setHidden(true);
  };
  return (
    <div role="region" aria-label="App download" style={{
      width: '100%',
      background: 'var(--orange)',
      color: 'var(--white)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
    }}>
      <div className="container" style={{
        height: 40,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 28px',
      }}>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'rgba(255,255,255,0.16)', color: 'var(--white)',
            border: 'none', cursor: 'pointer', flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 140ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M3 3 L9 9 M9 3 L3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <div style={{
          flex: 1, minWidth: 0,
          fontSize: 13.5, fontWeight: 500,
          letterSpacing: '-0.005em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          <span aria-hidden style={{ marginRight: 8 }}>📱</span>
          Also available on iOS — Get the free app.
          <span style={{ opacity: 0.78, marginLeft: 8 }}>
            Your app and community accounts are separate — that's by design.
          </span>
        </div>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--white)', fontSize: 13.5, fontWeight: 700,
            textDecoration: 'underline', textUnderlineOffset: 3,
            whiteSpace: 'nowrap', flexShrink: 0,
            letterSpacing: '0.005em',
          }}
        >
          Download
        </a>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   APP CARD — permanent right-rail card on the dashboard
   ---------------------------------------------------------------- */
function AppCard() {
  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--r-lg)',
      padding: '22px 22px 20px',
      boxShadow: 'var(--shadow-card)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--r-md)',
        background: 'var(--orange-soft)', color: 'var(--orange-text)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="7" y="3" width="10" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10.5 18 L13.5 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="serif" style={{
        margin: 0, fontSize: 20, fontWeight: 600,
        letterSpacing: '-0.012em', color: 'var(--ink)', lineHeight: 1.2,
      }}>
        Take it with you
      </h3>
      <p style={{
        margin: '8px 0 0', fontSize: 13.5, lineHeight: 1.55,
        color: 'var(--ink-mute)',
      }}>
        The Christian Dating Do's &amp; Don'ts app delivers your daily verse and prayer wall on iOS.
      </p>
      <div style={{
        marginTop: 12, padding: '10px 12px',
        background: 'var(--paper)', borderRadius: 'var(--r-md)',
        border: '1px solid var(--line)',
        fontSize: 12.5, lineHeight: 1.5, color: 'var(--ink-soft)',
      }}>
        <span className="serif" style={{ fontStyle: 'italic' }}>Two ways to stay in the Word. One mission.</span>
        <span style={{ display: 'block', color: 'var(--ink-mute)', marginTop: 4 }}>
          Your app and community accounts are separate — use the same email on both to keep things organized.
        </span>
      </div>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
        style={{
          marginTop: 14, width: '100%',
          height: 42, fontSize: 14,
          textDecoration: 'none',
        }}
      >
        Download free app
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 4 }}>
          <path d="M5 11 L11 5 M11 5 H6 M11 5 V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  );
}

/* ----------------------------------------------------------------
   TOP NAV — full width
   ---------------------------------------------------------------- */
function TopNav({ user, onNav, current }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(245, 237, 228, 0.84)',
      backdropFilter: 'blur(16px) saturate(160%)',
      WebkitBackdropFilter: 'blur(16px) saturate(160%)',
      borderBottom: '1px solid var(--line)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 72,
      }}>
        <Logo onClick={() => onNav && onNav('landing')} />
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <NavLink active={current === 'dashboard'} onClick={() => onNav('dashboard')}>Community</NavLink>
            <NavLink>Daily Word</NavLink>
            <NavLink>Library</NavLink>
            <AvatarMenu user={user} onSignOut={() => onNav('landing')} />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <NavLink onClick={() => onNav('login')}>Sign in</NavLink>
            <button className="btn btn-primary btn-sm" onClick={() => onNav('signup')}>Join the community</button>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ children, onClick, active }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      padding: '6px 2px',
      fontFamily: 'var(--sans)',
      fontSize: 14.5, fontWeight: 500,
      color: active ? 'var(--orange)' : 'var(--ink-soft)',
      borderBottom: active ? '2px solid var(--orange)' : '2px solid transparent',
      transition: 'color 140ms ease, border-color 140ms ease',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--orange)'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--ink-soft)'; }}
    >{children}</button>
  );
}

function AvatarMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const h = () => setOpen(false);
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, [open]);
  const initials = (user.name || 'You').split(' ').map(w => w[0]).slice(0, 2).join('');
  return (
    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button onClick={() => setOpen(!open)} style={{
        width: 40, height: 40, borderRadius: '50%',
        background: 'var(--ink)', color: 'var(--white)',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 600,
        letterSpacing: '-0.01em',
      }}>{initials}</button>
      {open && (
        <div className="fade-in" style={{
          position: 'absolute', right: 0, top: 52,
          background: 'var(--white)', borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow-lift)', minWidth: 220,
          padding: 8, border: '1px solid var(--line)',
        }}>
          <div style={{ padding: '10px 12px 14px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{user.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>
              {STAGES[user.stage]?.label} · {user.plan === 'premium' ? 'Annual member' : 'Free trial'}
            </div>
          </div>
          <MenuItem>Profile &amp; settings</MenuItem>
          <MenuItem>Manage subscription</MenuItem>
          <MenuItem onClick={onSignOut}>Sign out</MenuItem>
        </div>
      )}
    </div>
  );
}
function MenuItem({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'block', width: '100%', textAlign: 'left',
      padding: '10px 12px', background: 'none', border: 'none',
      borderRadius: 6, cursor: 'pointer', fontSize: 14, color: 'var(--ink-soft)',
      transition: 'background 120ms ease',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{children}</button>
  );
}

/* ----------------------------------------------------------------
   FOOTER
   ---------------------------------------------------------------- */
function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--line)',
      padding: '40px 0 56px',
      marginTop: 80,
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 32, flexWrap: 'wrap',
      }}>
        <div style={{ maxWidth: 360 }}>
          <Logo />
          <p style={{ marginTop: 14, color: 'var(--ink-mute)', fontSize: 14, lineHeight: 1.6 }}>
            A small, faith-forward community for Christians navigating dating, engagement, and starting over. Honest. Anonymous when it needs to be. Always grounded in the Word.
          </p>
        </div>
        <FooterColumn title="Community">
          <FooterLink>Daily Word</FooterLink>
          <FooterLink>The Wall</FooterLink>
          <FooterLink>Weekly Prompt</FooterLink>
          <FooterLink>Library</FooterLink>
        </FooterColumn>
        <FooterColumn title="About">
          <FooterLink>Our story</FooterLink>
          <FooterLink>Statement of faith</FooterLink>
          <FooterLink>Pricing</FooterLink>
          <FooterLink>Contact</FooterLink>
        </FooterColumn>
        <FooterColumn title="Quiet">
          <FooterLink>Privacy</FooterLink>
          <FooterLink>Terms</FooterLink>
          <FooterLink>Community rules</FooterLink>
        </FooterColumn>
      </div>
      <div className="container" style={{
        marginTop: 36, paddingTop: 22, borderTop: '1px solid var(--line)',
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        fontSize: 12, color: 'var(--ink-mute)',
      }}>
        <div>© {new Date().getFullYear()} Christian Dating Do's &amp; Don'ts</div>
        <div style={{ fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
          “Plans fail for lack of counsel, but with many advisers they succeed.” &nbsp;— Proverbs 15:22
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="eyebrow" style={{ color: 'var(--ink)', letterSpacing: '0.16em' }}>{title}</div>
      {children}
    </div>
  );
}
function FooterLink({ children }) {
  return (
    <a href="#" style={{
      color: 'var(--ink-soft)', fontSize: 14, textDecoration: 'none',
      transition: 'color 120ms ease',
    }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--orange)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-soft)'}
    >{children}</a>
  );
}

/* ----------------------------------------------------------------
   GREETING — based on hour
   ---------------------------------------------------------------- */
function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return 'Peace tonight';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 21) return 'Good Evening';
  return 'Peace tonight';
}
function todayDateStr(date = new Date()) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

Object.assign(window, {
  STAGES, STAGE_ORDER,
  Logo, Monogram, StageTag, CategoryTag, ReactionPill, PostCard,
  Chevron, RepliesPill, RepliesSection, ReplyItem, SmallReactionPill, ReplyComposer,
  FilterBar, ShareBox, TopNav, NavLink, AvatarMenu, MenuItem,
  AppBanner, AppCard,
  Footer, FooterColumn, FooterLink,
  greeting, todayDateStr,
});
