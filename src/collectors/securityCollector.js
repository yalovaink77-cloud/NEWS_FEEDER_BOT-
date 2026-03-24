const fetch = require('node-fetch');
const securityFeeds = [
  { source: 'Reuters Security', url: 'https://feeds.reuters.com/reuters/worldNews' },
  { source: 'BBC Breaking', url: 'http://feeds.bbci.co.uk/news/rss.xml' },
  { source: 'AP Breaking', url: 'https://apnews.com/ap_feeds/TopNews' },
  { source: 'CNN Breaking', url: 'http://rss.cnn.com/rss/cnn_topstories.rss' },
  { source: 'Guardian World', url: 'https://www.theguardian.com/world/rss' }
];

async function fetchRSS(feed) {
  try {
    const response = await fetch(feed.url);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.text();
    console.log(`✓ Fetched ${feed.source}`);
    return { source: feed.source, data };
  } catch (error) {
    console.error(`✗ Error fetching ${feed.source}: ${error.message}`);
  }
}

async function getSecurityAlerts() {
  console.log('Collecting Security & Breaking News...');
  const results = await Promise.all(securityFeeds.map(fetchRSS));
  return results.filter(r => r !== undefined);
}

module.exports = { getSecurityAlerts };