const Parser = require('rss-parser');
const parser = new Parser();

const urls = [
    'https://www.kap.org.tr/en/rss', // KAP
    'https://www.bloomberght.com/rss', // Bloomberg HT
    'https://www.aa.com.tr/en/rss', // Anadolu Ajansı
];

async function fetchRSS() {
    try {
        const results = await Promise.all(urls.map(async (url) => {
            const feed = await parser.parseURL(url);
            return feed;
        }));
        return results;
    } catch (error) {
        console.error('An error occurred while fetching RSS feeds:', error);
    }
}

fetchRSS();
