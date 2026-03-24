const fetch = require('node-fetch');
const politicalFeeds = [
    { source: 'Reuters Politics', url: 'https://feeds.reuters.com/reuters/politicsNews' },
    { source: 'BBC Politics', url: 'http://feeds.bbci.co.uk/news/politics/rss.xml' },
    { source: 'AP Elections', url: 'https://apnews.com/hub/elections' },
    { source: 'Guardian Politics', url: 'https://www.theguardian.com/international/politics/rss' },
    { source: 'CNN Politics', url: 'http://rss.cnn.com/rss/cnn_allpolitics.rss' }
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

async function getPoliticalNews() {
    console.log('Collecting Political News...');
    const results = await Promise.all(politicalFeeds.map(fetchRSS));
    return results.filter(r => r !== undefined);
}

module.exports = { getPoliticalNews };