/* data.jsx — seed content for the community thread + daily word */

const SEED_POSTS = [
  {
    id: 'p1',
    name: 'Marcus',
    location: 'Texas',
    time: '3 hours ago',
    stage: 'seeking',
    category: 'prayer',
    body: "Praying for discernment — 3 months in and I want to honor Him either way.",
    reactions: { praying: 24, with_you: 11, amen: 17 },
    userReaction: null,
    replies: [
      { id: 'p1r1', name: 'Hannah', location: 'Texas', stage: 'engaged', time: '2h ago',
        body: "Praying with you, Marcus. The fact that you're asking is the prayer. James 1:5 — He gives wisdom generously.",
        reactions: { praying: 8, with_you: 4, amen: 12 }, userReaction: null },
      { id: 'p1r2', name: 'Andre', location: 'Atlanta', stage: 'dating', time: '2h ago',
        body: "Brother, I went through the exact same season last year. What helped me: stop asking 'is this the one' and start asking 'is this who God is forming me alongside right now.' Different question, clearer answer.",
        reactions: { praying: 14, with_you: 22, amen: 31 }, userReaction: 'amen' },
      { id: 'p1r3', name: 'Joy', location: 'Houston', stage: 'starting', time: '1h ago',
        body: "Walk away looks like grief at first. Go forward looks like peace under the pressure. Pray for the difference between relief and peace — they feel similar but aren't.",
        reactions: { praying: 19, with_you: 7, amen: 26 }, userReaction: null },
      { id: 'p1r4', name: 'Sam', location: 'Dallas', stage: 'seeking', time: '38m ago',
        body: "Lifting you up tonight.", reactions: { praying: 3, with_you: 1, amen: 0 }, userReaction: null },
      { id: 'p1r5', name: 'Bethany', location: 'Austin', stage: 'engaged', time: '12m ago',
        body: "Talking to my fiancé about this thread. We're both praying for you.",
        reactions: { praying: 6, with_you: 4, amen: 2 }, userReaction: null },
    ],
  },
  {
    id: 'p2',
    name: 'Diane',
    location: 'Georgia',
    time: '4 hours ago',
    stage: 'starting',
    category: 'praise',
    body: "Finally had the boundary conversation. God gave me the words.",
    reactions: { praying: 8, with_you: 41, amen: 28 },
    userReaction: 'amen',
    replies: [
      { id: 'p2r1', name: 'Rachel', location: 'Ontario', stage: 'starting', time: '3h ago',
        body: "This is huge, Diane. The conversation IS the answered prayer. Amen.",
        reactions: { praying: 2, with_you: 11, amen: 18 }, userReaction: 'amen' },
      { id: 'p2r2', name: 'Mary', location: 'Florida', stage: 'engaged', time: '2h ago',
        body: "Saved this to remind myself for my own hard conversation tomorrow. Thank you for the courage.",
        reactions: { praying: 4, with_you: 9, amen: 3 }, userReaction: null },
      { id: 'p2r3', name: 'Kayla', location: 'Tennessee', stage: 'starting', time: '50m ago',
        body: "He gives us the words when we stop rehearsing them. So glad you spoke.",
        reactions: { praying: 1, with_you: 7, amen: 5 }, userReaction: null },
    ],
  },
  {
    id: 'p3',
    name: 'Daniel',
    location: 'NC',
    time: 'Yesterday',
    stage: 'engaged',
    category: 'praise',
    body: "She said yes. Glory to God.",
    reactions: { praying: 41, with_you: 67, amen: 124 },
    userReaction: null,
    replies: [
      { id: 'p3r1', name: 'James', location: 'Illinois', stage: 'engaged', time: '22h ago',
        body: "Glory to God, brother. Praying for the counseling season ahead.",
        reactions: { praying: 6, with_you: 18, amen: 42 }, userReaction: 'amen' },
      { id: 'p3r2', name: 'Esther', location: 'London', stage: 'dating', time: '14h ago',
        body: "So happy for you both. Amen.",
        reactions: { praying: 3, with_you: 9, amen: 28 }, userReaction: null },
    ],
  },
  {
    id: 'p4',
    name: 'Priya',
    location: 'New Jersey',
    time: 'Yesterday',
    stage: 'dating',
    category: 'prayer',
    body: "We've been dating 8 months and I love him. Pray for our purity and that we honor God with our boundaries — not because of fear, but because of love.",
    reactions: { praying: 56, with_you: 22, amen: 19 },
    userReaction: null,
    replies: [
      { id: 'p4r1', name: 'Naomi', location: 'Boston', stage: 'engaged', time: '20h ago',
        body: "'Not because of fear, but because of love' — that reframe carried us all the way to our wedding. Praying with you, Priya.",
        reactions: { praying: 8, with_you: 14, amen: 22 }, userReaction: 'amen' },
    ],
  },
  {
    id: 'p5',
    name: 'Tomás',
    location: 'California',
    time: '2 days ago',
    stage: 'seeking',
    category: 'wisdom',
    body: "Single brothers — stop praying for a wife while you're still avoiding the work of becoming a husband. The waiting is the workshop. I had to learn this the hard way.",
    reactions: { praying: 12, with_you: 47, amen: 91 },
    userReaction: 'amen',
    replies: [
      { id: 'p5r1', name: 'Caleb', location: 'Phoenix', stage: 'seeking', time: '1d ago',
        body: "Needed this today. Going to journal on what 'workshop' means for me this week.",
        reactions: { praying: 1, with_you: 12, amen: 8 }, userReaction: null },
      { id: 'p5r2', name: 'Anonymous', location: 'Ohio', stage: 'seeking', time: '1d ago',
        body: "Read this 3 times. Saving.", reactions: { praying: 0, with_you: 6, amen: 4 }, userReaction: null },
      { id: 'p5r3', name: 'Jordan', location: 'Denver', stage: 'dating', time: '22h ago',
        body: "My fiancée would tell you the same thing about sisters. Both sides of this. The work isn't gendered.",
        reactions: { praying: 2, with_you: 18, amen: 14 }, userReaction: null },
      { id: 'p5r4', name: 'Levi', location: 'Seattle', stage: 'seeking', time: '14h ago',
        body: "Saving this whole thread. Thank you, Tomás.",
        reactions: { praying: 1, with_you: 5, amen: 9 }, userReaction: null },
    ],
  },
  {
    id: 'p6',
    name: 'Rachel',
    location: 'Ontario',
    time: '2 days ago',
    stage: 'starting',
    category: 'prayer',
    body: "Two years since the divorce. Some days I think I'm ready to date again. Most days I think I'm just lonely. Pray for me to know the difference.",
    reactions: { praying: 84, with_you: 38, amen: 12 },
    userReaction: null,
    replies: [
      { id: 'p6r1', name: 'Diane', location: 'Georgia', stage: 'starting', time: '1d ago',
        body: "Sister. The difference shows up when you can sit with the loneliness for an hour without reaching for your phone. I'm praying you get more of those hours.",
        reactions: { praying: 16, with_you: 28, amen: 11 }, userReaction: 'with_you' },
      { id: 'p6r2', name: 'Kayla', location: 'Tennessee', stage: 'starting', time: '1d ago',
        body: "Loneliness is information, not instruction. You're allowed to be both. Praying.",
        reactions: { praying: 22, with_you: 19, amen: 8 }, userReaction: null },
    ],
  },
  {
    id: 'p7',
    name: 'Daniel',
    location: 'North Carolina',
    time: '3 days ago',
    stage: 'engaged',
    category: 'praise',
    body: "She said yes. We've prayed about this for over a year and waited to date the right way. Glory to God. Pre-marital counseling starts next week — any verses you'd send a future husband?",
    reactions: { praying: 41, with_you: 67, amen: 124 },
    userReaction: null,
    replies: [
      { id: 'p7r1', name: 'James', location: 'Illinois', stage: 'engaged', time: '2d ago',
        body: "Ephesians 5:25-33 — slowly. Not as duty, but as the picture of Christ. Congratulations brother.",
        reactions: { praying: 6, with_you: 18, amen: 42 }, userReaction: 'amen' },
      { id: 'p7r2', name: 'Marcus', location: 'Texas', stage: 'seeking', time: '2d ago',
        body: "Glory to God. Praying for the counseling season.",
        reactions: { praying: 4, with_you: 11, amen: 16 }, userReaction: null },
      { id: 'p7r3', name: 'Esther', location: 'London', stage: 'dating', time: '1d ago',
        body: "1 Corinthians 13 — but read it as a description of God's love, not a checklist of yours. That's the verse that changed us.",
        reactions: { praying: 3, with_you: 9, amen: 28 }, userReaction: null },
    ],
  },
  {
    id: 'p8',
    name: 'Esther',
    location: 'London',
    time: '3 days ago',
    stage: 'dating',
    category: 'prayer',
    body: "Walking through the 'meet the family' season. He's from a very different church background. Pray that grace would lead every conversation this weekend.",
    reactions: { praying: 31, with_you: 19, amen: 8 },
    userReaction: null,
    replies: [],
  },
  {
    id: 'p9',
    name: 'Anonymous',
    location: 'Texas',
    time: '4 days ago',
    stage: 'seeking',
    category: 'prayer',
    body: "I'm tired of being told I just need to 'work on myself' while I wait. I AM working on myself. I also want a partner. Both can be true. Pray that I keep both hands open.",
    reactions: { praying: 102, with_you: 78, amen: 33 },
    userReaction: null,
    replies: [
      { id: 'p9r1', name: 'Anonymous', location: 'Florida', stage: 'seeking', time: '3d ago',
        body: "Both hands open is the prayer. Saying that with you tonight.",
        reactions: { praying: 14, with_you: 9, amen: 6 }, userReaction: null },
    ],
  },
  {
    id: 'p10',
    name: 'Kayla',
    location: 'Tennessee',
    time: '5 days ago',
    stage: 'starting',
    category: 'wisdom',
    body: "To anyone newly widowed: there is no timeline. People will offer one. Politely return it. God is not in a rush, and neither are you.",
    reactions: { praying: 56, with_you: 142, amen: 67 },
    userReaction: 'with_you',
    replies: [
      { id: 'p10r1', name: 'Rachel', location: 'Ontario', stage: 'starting', time: '4d ago',
        body: "Politely return it. Yes. Yes.",
        reactions: { praying: 2, with_you: 31, amen: 12 }, userReaction: 'with_you' },
      { id: 'p10r2', name: 'Anonymous', location: 'UK', stage: 'starting', time: '3d ago',
        body: "Six months out. Needed this.",
        reactions: { praying: 18, with_you: 14, amen: 4 }, userReaction: null },
    ],
  },
];

/* Daily Word entries — rotate by day of year so it feels fresh */
const DAILY_WORDS = [
  {
    type: 'VERSE',
    body: "“Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.”",
    reference: 'Psalm 46:10',
    translation: 'NIV',
    reflection: "Stillness is not the absence of doing. It is the presence of trust — the choice to stop performing for an answer and let Him be God in the waiting.",
  },
  {
    type: 'VERSE',
    body: "“Above all else, guard your heart, for everything you do flows from it.”",
    reference: 'Proverbs 4:23',
    translation: 'NIV',
    reflection: "Guarding is active. It is not a wall — it is a watchful gate. What you let through becomes what flows out into the relationships you build.",
  },
  {
    type: 'DEVOTIONAL',
    body: "Love is patient because love is sure. It is not in a hurry to prove itself. If you find yourself rushing to certainty, ask: am I trusting God, or trying to manage Him?",
    reference: '1 Corinthians 13 — meditation',
    translation: 'Reflection',
    reflection: "Today, name one place you've been impatient with God's timing. Bring it to Him plainly. He can hold honesty better than you can hold pretending.",
  },
  {
    type: 'WISDOM',
    body: "The right person at the wrong time is the wrong person. God's gifts arrive with His timing already attached. Waiting is not delay — it is the gift before the gift.",
    reference: 'A pastoral note',
    translation: 'Devotional',
    reflection: "Where are you tempted to force a 'yes' you sense is a 'not yet'?",
  },
];

/* Weekly prompts by stage */
const WEEKLY_PROMPTS = {
  seeking: {
    title: 'This week\'s prompt',
    question: 'What would your life look like if you trusted God\'s timing for one full month — with no swiping, no checking?',
  },
  dating: {
    title: 'This week\'s prompt',
    question: 'Name one boundary you and your partner have grown into this year. Where did the grace come from?',
  },
  engaged: {
    title: 'This week\'s prompt',
    question: 'What does it mean to lead a household together — not above, not behind, but beside?',
  },
  starting: {
    title: 'This week\'s prompt',
    question: 'What did God give back to you this week that grief had taken? Name it, however small.',
  },
};

/* ================================================================
   SUPABASE DATA LAYER
   These replace the in-memory SEED_POSTS / DAILY_WORDS when configured.
   When Supabase isn't configured (or a query fails) the callers fall back
   to the seed arrays above so the prototype keeps rendering.
   ================================================================ */

const _emptyCounts = () => ({ praying: 0, with_you: 0, amen: 0 });

/* Fetch the whole Wall and assemble it into the exact shape PostCard expects:
   { id, name, location, time, stage, category, body, reactions, userReaction, replies[] } */
async function dbFetchPosts(currentUserId) {
  if (!sb) return null;
  const { data: posts, error } = await sb
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('[data] dbFetchPosts', error); return null; }
  if (!posts) return [];

  const postIds = posts.map(p => p.id);
  let postReactions = [];
  let replies = [];
  if (postIds.length) {
    const [{ data: prx }, { data: reps }] = await Promise.all([
      sb.from('post_reactions').select('*').in('post_id', postIds),
      sb.from('post_replies').select('*').in('post_id', postIds).order('created_at', { ascending: true }),
    ]);
    postReactions = prx || [];
    replies = reps || [];
  }
  const replyIds = replies.map(r => r.id);
  let replyReactions = [];
  if (replyIds.length) {
    const { data: rrx } = await sb.from('reply_reactions').select('*').in('reply_id', replyIds);
    replyReactions = rrx || [];
  }

  const postAgg = {};
  for (const id of postIds) postAgg[id] = { reactions: _emptyCounts(), userReaction: null };
  for (const r of postReactions) {
    const a = postAgg[r.post_id]; if (!a) continue;
    if (a.reactions[r.kind] != null) a.reactions[r.kind] += 1;
    if (currentUserId && r.user_id === currentUserId) a.userReaction = r.kind;
  }
  const replyAgg = {};
  for (const id of replyIds) replyAgg[id] = { reactions: _emptyCounts(), userReaction: null };
  for (const r of replyReactions) {
    const a = replyAgg[r.reply_id]; if (!a) continue;
    if (a.reactions[r.kind] != null) a.reactions[r.kind] += 1;
    if (currentUserId && r.user_id === currentUserId) a.userReaction = r.kind;
  }

  const repliesByPost = {};
  for (const rep of replies) {
    (repliesByPost[rep.post_id] = repliesByPost[rep.post_id] || []).push({
      id: rep.id,
      name: rep.name,
      location: rep.location,
      stage: rep.stage,
      time: timeAgo(rep.created_at),
      body: rep.body,
      reactions: replyAgg[rep.id]?.reactions || _emptyCounts(),
      userReaction: replyAgg[rep.id]?.userReaction || null,
    });
  }

  return posts.map(p => ({
    id: p.id,
    name: p.name,
    location: p.location,
    time: timeAgo(p.created_at),
    stage: p.stage,
    category: p.category,
    body: p.body,
    reactions: postAgg[p.id]?.reactions || _emptyCounts(),
    userReaction: postAgg[p.id]?.userReaction || null,
    replies: repliesByPost[p.id] || [],
  }));
}

/* Today's Daily Word (falls back to most recent on/before today). */
async function dbFetchDailyWord() {
  if (!sb) return null;
  const today = new Date().toISOString().slice(0, 10);
  let { data, error } = await sb
    .from('daily_words').select('*')
    .eq('date', today)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) { console.error('[data] dbFetchDailyWord', error); return null; }
  if (!data || !data.length) {
    const res = await sb
      .from('daily_words').select('*')
      .lte('date', today)
      .order('date', { ascending: false })
      .limit(1);
    data = res.data;
  }
  if (!data || !data.length) return null;
  const w = data[0];
  return { type: w.type, body: w.body, reference: w.reference, translation: w.translation, reflection: w.reflection };
}

/* Insert a new post and return it in card shape. */
async function dbCreatePost({ userId, name, location, stage, category, body }) {
  if (!sb) return null;
  const { data, error } = await sb
    .from('community_posts')
    .insert({ user_id: userId, name, location, stage, category, body })
    .select().single();
  if (error) { console.error('[data] dbCreatePost', error); return null; }
  return {
    id: data.id, name: data.name, location: data.location,
    time: timeAgo(data.created_at), stage: data.stage, category: data.category,
    body: data.body, reactions: _emptyCounts(), userReaction: null, replies: [],
  };
}

/* Insert a reply and return it in reply shape. */
async function dbCreateReply({ postId, userId, name, location, stage, body }) {
  if (!sb) return null;
  const { data, error } = await sb
    .from('post_replies')
    .insert({ post_id: postId, user_id: userId, name, location, stage, body })
    .select().single();
  if (error) { console.error('[data] dbCreateReply', error); return null; }
  return {
    id: data.id, name: data.name, location: data.location, stage: data.stage,
    time: timeAgo(data.created_at), body: data.body,
    reactions: _emptyCounts(), userReaction: null,
  };
}

/* Toggle a post reaction. `current` = the user's existing reaction kind (or null). */
async function dbToggleReaction({ postId, userId, kind, current }) {
  if (!sb || !userId) return;
  if (current === kind) {
    const { error } = await sb.from('post_reactions').delete().match({ post_id: postId, user_id: userId });
    if (error) console.error('[data] dbToggleReaction delete', error);
  } else {
    const { error } = await sb.from('post_reactions')
      .upsert({ post_id: postId, user_id: userId, kind }, { onConflict: 'post_id,user_id' });
    if (error) console.error('[data] dbToggleReaction upsert', error);
  }
}

/* Toggle a reply reaction. */
async function dbToggleReplyReaction({ replyId, userId, kind, current }) {
  if (!sb || !userId) return;
  if (current === kind) {
    const { error } = await sb.from('reply_reactions').delete().match({ reply_id: replyId, user_id: userId });
    if (error) console.error('[data] dbToggleReplyReaction delete', error);
  } else {
    const { error } = await sb.from('reply_reactions')
      .upsert({ reply_id: replyId, user_id: userId, kind }, { onConflict: 'reply_id,user_id' });
    if (error) console.error('[data] dbToggleReplyReaction upsert', error);
  }
}

Object.assign(window, {
  SEED_POSTS, DAILY_WORDS, WEEKLY_PROMPTS,
  dbFetchPosts, dbFetchDailyWord, dbCreatePost, dbCreateReply,
  dbToggleReaction, dbToggleReplyReaction,
});
