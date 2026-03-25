const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();

// Verified working as of 2026-03-25. Bloomberg Energy=404, EIA=406; using reliable alternatives.
const ENERGY_FEEDS = [
    { source: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex',    source_weight: 0.25 },
    { source: 'FT Energy',     url: 'https://www.ft.com/energy?format=rss',       source_weight: 0.30 },
    { source: 'Bloomberg Mkt', url: 'https://feeds.bloomberg.com/markets/news.rss', source_weight: 0.28 },
];

function detectEnergyEventType(title) {
    const t = title.toLowerCase();
    if (t.includes('cut') || t.includes('reduce') || t.includes('production cut'))   return 'opec_cut';
    if (t.includes('increase') || t.includes('output hike'))                         return 'opec_hike';
    if (t.includes('price') || t.includes('crude') || t.includes('brent'))           return 'price_update';
    if (t.includes('sanction') || t.includes('embargo'))                             return 'sanctions';
    return 'energy_news';
}

async function getOilPrice() {
    try {
        const response = await axios.get('https://api.oilpriceapi.com/v1/prices/latest', {
            headers: { Authorization: `Token ${process.env.OIL_PRICE_API_KEY || ''}` },
        });
        console.log('✓ Oil price fetched');
        return response.data;
    } catch (error) {
        console.error('✗ Oil price API error:', error.message);
        return null;
    }
}

async function fetchEnergyFeed(feed) {
    try {
        const result = await parser.parseURL(feed.url);
        console.log(`✓ Energy: ${feed.source} (${result.items.length} items)`);
        return result.items.map(item => ({
            source:        feed.source,
            title:         item.title || '',
            content:       item.contentSnippet || item.content || item.summary || '',
            url:           item.link || '',
            published_at:  item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            source_weight: feed.source_weight,
            category:      'energy',
            event_type:    detectEnergyEventType(item.title || ''),
            raw_data:      null,
        }));
    } catch (error) {
        console.error(`✗ Energy feed error [${feed.source}]: ${error.message}`);
        return [];
    }
}

async function getEnergyNews() {
    console.log('Collecting Energy News...');
    const feedResults = await Promise.all(ENERGY_FEEDS.map(fetchEnergyFeed));
    return feedResults.flat();
}

module.exports = { getEnergyNews };