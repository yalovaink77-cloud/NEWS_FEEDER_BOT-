const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();

// Verified working as of 2026-03-25. Kitco=404, Mining.com=403; replaced.
const COMMODITY_FEEDS = [
    { source: 'Commodity.com',   url: 'https://www.commodity.com/rss/',                        source_weight: 0.20 },
    { source: 'Investing Gold',  url: 'https://www.investing.com/rss/news_14.rss',             source_weight: 0.25 },
    { source: 'Bloomberg Mkt',   url: 'https://feeds.bloomberg.com/markets/news.rss',          source_weight: 0.22 },
];

async function getGoldPrice() {
    try {
        const response = await axios.get('https://api.metals.live/v1/spot/gold');
        console.log('✓ Gold price fetched');
        return response.data;
    } catch (error) {
        console.error('✗ Gold price API error:', error.message);
        return null;
    }
}

async function fetchCommodityFeed(feed) {
    try {
        const result = await parser.parseURL(feed.url);
        console.log(`✓ Commodities: ${feed.source} (${result.items.length} items)`);
        return result.items.map(item => ({
            source:        feed.source,
            title:         item.title || '',
            content:       item.contentSnippet || item.content || item.summary || '',
            url:           item.link || '',
            published_at:  item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            source_weight: feed.source_weight,
            category:      'commodity',
            event_type:    'commodity_news',
            raw_data:      null,
        }));
    } catch (error) {
        console.error(`✗ Commodity feed error [${feed.source}]: ${error.message}`);
        return [];
    }
}

async function getCommoditiesNews() {
    console.log('Collecting Commodities News...');
    const feedResults = await Promise.all(COMMODITY_FEEDS.map(fetchCommodityFeed));
    return feedResults.flat();
}

module.exports = { getCommoditiesNews };