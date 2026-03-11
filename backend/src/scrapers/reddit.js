import axios from 'axios';

// Spanish subreddits with political/social debate
const SUBREDDITS = [
  { name: 'spain', label: 'r/spain' },
  { name: 'es', label: 'r/es' },
  { name: 'SpainPolitics', label: 'r/SpainPolitics' },
  { name: 'Asi_va_Espana', label: 'r/Asi_va_Espana' },
];

const UA = 'HODIO/1.0 (Hate Speech Research Tool)';

export async function scrapeReddit(maxPerSub = 10) {
  const allPosts = [];
  const seen = new Set();

  for (const sub of SUBREDDITS) {
    try {
      const res = await axios.get(`https://www.reddit.com/r/${sub.name}/hot.json`, {
        params: { limit: maxPerSub + 5 },
        headers: { 'User-Agent': UA },
        timeout: 10000
      });

      const posts = (res.data.data?.children || [])
        .filter(p => p.data.stickied === false || p.data.stickied === undefined)
        .slice(0, maxPerSub);

      for (const p of posts) {
        const d = p.data;
        const text = d.title + (d.selftext ? '. ' + d.selftext.slice(0, 200) : '');

        if (text.length < 15 || seen.has(d.id)) continue;
        seen.add(d.id);

        allPosts.push({
          source: 'reddit',
          sourceLabel: 'Reddit',
          sourceDetail: sub.label,
          text: text.replace(/\n/g, ' ').trim(),
          author: d.author || 'anonymous',
          url: `https://reddit.com${d.permalink}`,
          timestamp: new Date(d.created_utc * 1000).toISOString(),
          metrics: {
            score: d.score,
            comments: d.num_comments,
            upvoteRatio: d.upvote_ratio
          }
        });
      }

      console.log(`[Reddit] ${sub.label}: ${posts.length} posts`);
    } catch (err) {
      console.error(`[Reddit] Error ${sub.label}:`, err.response?.status || err.message);
    }
  }

  console.log(`[Reddit] Total: ${allPosts.length} posts`);
  return allPosts;
}

export default { scrapeReddit };
