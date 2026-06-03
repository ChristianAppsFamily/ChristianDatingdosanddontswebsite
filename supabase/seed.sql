-- Seed data for Christian Dating Do's & Don'ts
-- Run AFTER 0001_init.sql. Runs as the service role, so RLS is bypassed.

-- ============================================================
-- DAILY WORDS, ensure there is always one for "today"
-- ============================================================
insert into public.daily_words (date, type, body, reference, translation, reflection) values
  (current_date,
   'VERSE',
   '“Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.”',
   'Psalm 46:10', 'NIV',
   'Stillness is not the absence of doing. It is the presence of trust, the choice to stop performing for an answer and let Him be God in the waiting.'),
  (current_date - 1,
   'VERSE',
   '“Above all else, guard your heart, for everything you do flows from it.”',
   'Proverbs 4:23', 'NIV',
   'Guarding is active. It is not a wall. It is a watchful gate. What you let through becomes what flows out into the relationships you build.'),
  (current_date - 2,
   'DEVOTIONAL',
   'Love is patient because love is sure. It is not in a hurry to prove itself. If you find yourself rushing to certainty, ask: am I trusting God, or trying to manage Him?',
   '1 Corinthians 13, meditation', 'Reflection',
   'Today, name one place you''ve been impatient with God''s timing. Bring it to Him plainly. He can hold honesty better than you can hold pretending.'),
  (current_date - 3,
   'WISDOM',
   'The right person at the wrong time is the wrong person. God''s gifts arrive with His timing already attached. Waiting is not delay. It is the gift before the gift.',
   'A pastoral note', 'Devotional',
   'Where are you tempted to force a ''yes'' you sense is a ''not yet''?')
on conflict do nothing;

-- ============================================================
-- COMMUNITY POSTS + REPLIES (sample Wall content)
-- ============================================================
do $$
declare
  pid uuid;
begin
  -- Post 1
  insert into public.community_posts (name, location, stage, category, body, created_at)
  values ('Marcus','Texas','seeking','prayer',
    'Please pray for discernment. I''ve been talking to someone for 3 months and I genuinely don''t know if God is saying go forward or walk away. I want to honor Him either way.',
    now() - interval '3 hours') returning id into pid;
  insert into public.post_replies (post_id, name, location, stage, body, created_at) values
    (pid,'Hannah','Texas','engaged','Praying with you, Marcus. The fact that you''re asking is the prayer. James 1:5. He gives wisdom generously.', now() - interval '2 hours'),
    (pid,'Andre','Atlanta','dating','Brother, I went through the exact same season last year. What helped me: stop asking ''is this the one'' and start asking ''is this who God is forming me alongside right now.'' Different question, clearer answer.', now() - interval '2 hours'),
    (pid,'Joy','Houston','starting','Walk away looks like grief at first. Go forward looks like peace under the pressure. Pray for the difference between relief and peace. They feel similar but aren''t.', now() - interval '1 hour');

  -- Post 2
  insert into public.community_posts (name, location, stage, category, body, created_at)
  values ('Diane','Georgia','starting','praise',
    'PRAISE REPORT: I finally had the boundary conversation I''d been avoiding for weeks. God gave me the words. He is so faithful.',
    now() - interval '4 hours') returning id into pid;
  insert into public.post_replies (post_id, name, location, stage, body, created_at) values
    (pid,'Rachel','Ontario','starting','This is huge, Diane. The conversation IS the answered prayer. Amen.', now() - interval '3 hours'),
    (pid,'Mary','Florida','engaged','Saved this to remind myself for my own hard conversation tomorrow. Thank you for the courage.', now() - interval '2 hours');

  -- Post 3
  insert into public.community_posts (name, location, stage, category, body, created_at)
  values ('James','Illinois','engaged','word',
    'This verse stopped me today: "Do not be yoked together with unbelievers." We are 6 months out from the wedding and re-reading 2 Corinthians 6 has been steadying. Praying for every couple wrestling with this.',
    now() - interval '1 day') returning id into pid;
  insert into public.post_replies (post_id, name, location, stage, body, created_at) values
    (pid,'Daniel','NC','engaged','Reading this with my fiancée tonight. Steadying is the right word.', now() - interval '22 hours');

  -- Post 4
  insert into public.community_posts (name, location, stage, category, body, created_at)
  values ('Priya','New Jersey','dating','prayer',
    'We''ve been dating 8 months and I love him. Pray for our purity and that we honor God with our boundaries, not because of fear, but because of love.',
    now() - interval '1 day') returning id into pid;
  insert into public.post_replies (post_id, name, location, stage, body, created_at) values
    (pid,'Naomi','Boston','engaged','''Not because of fear, but because of love'', that reframe carried us all the way to our wedding. Praying with you, Priya.', now() - interval '20 hours');

  -- Post 5
  insert into public.community_posts (name, location, stage, category, body, created_at)
  values ('Tomás','California','seeking','wisdom',
    'Single brothers, stop praying for a wife while you''re still avoiding the work of becoming a husband. The waiting is the workshop. I had to learn this the hard way.',
    now() - interval '2 days') returning id into pid;
  insert into public.post_replies (post_id, name, location, stage, body, created_at) values
    (pid,'Caleb','Phoenix','seeking','Needed this today. Going to journal on what ''workshop'' means for me this week.', now() - interval '1 day');

  -- Post 6
  insert into public.community_posts (name, location, stage, category, body, created_at)
  values ('Rachel','Ontario','starting','prayer',
    'Two years since the divorce. Some days I think I''m ready to date again. Most days I think I''m just lonely. Pray for me to know the difference.',
    now() - interval '2 days') returning id into pid;
  insert into public.post_replies (post_id, name, location, stage, body, created_at) values
    (pid,'Kayla','Tennessee','starting','Loneliness is information, not instruction. You''re allowed to be both. Praying.', now() - interval '1 day');

  -- Post 7
  insert into public.community_posts (name, location, stage, category, body, created_at)
  values ('Daniel','North Carolina','engaged','praise',
    'She said yes. We''ve prayed about this for over a year and waited to date the right way. Glory to God. Pre-marital counseling starts next week. Any verses you''d send a future husband?',
    now() - interval '3 days') returning id into pid;
  insert into public.post_replies (post_id, name, location, stage, body, created_at) values
    (pid,'James','Illinois','engaged','Ephesians 5:25-33. Slowly. Not as duty, but as the picture of Christ. Congratulations brother.', now() - interval '2 days');

  -- Post 8
  insert into public.community_posts (name, location, stage, category, body, created_at)
  values ('Esther','London','dating','prayer',
    'Walking through the ''meet the family'' season. He''s from a very different church background. Pray that grace would lead every conversation this weekend.',
    now() - interval '3 days');

  -- Post 9
  insert into public.community_posts (name, location, stage, category, body, created_at)
  values ('Anonymous','Texas','seeking','prayer',
    'I''m tired of being told I just need to ''work on myself'' while I wait. I AM working on myself. I also want a partner. Both can be true. Pray that I keep both hands open.',
    now() - interval '4 days') returning id into pid;
  insert into public.post_replies (post_id, name, location, stage, body, created_at) values
    (pid,'Anonymous','Florida','seeking','Both hands open is the prayer. Saying that with you tonight.', now() - interval '3 days');

  -- Post 10
  insert into public.community_posts (name, location, stage, category, body, created_at)
  values ('Kayla','Tennessee','starting','wisdom',
    'To anyone newly widowed: there is no timeline. People will offer one. Politely return it. God is not in a rush, and neither are you.',
    now() - interval '5 days') returning id into pid;
  insert into public.post_replies (post_id, name, location, stage, body, created_at) values
    (pid,'Rachel','Ontario','starting','Politely return it. Yes. Yes.', now() - interval '4 days');
end $$;
