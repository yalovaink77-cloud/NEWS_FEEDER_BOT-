const fetch = require('node-fetch');

// Array of geopolitical news RSS feeds from various sources
const rssFeeds = [
    { source: 'Reuters', url: 'https://feeds.reuters.com/reuters/worldnews' },
    { source: 'BBC', url: 'http://feeds.bbci.co.uk/news/world/rss.xml' },
    { source: 'AP', url: 'https://apnews.com/rss/world' },
    { source: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
    { source: 'UNIAN', url: 'https://www.unian.info/rss/world' }
];

// Function to fetch RSS feed data
async function fetchRSS(feed) {
    try {
        const response = await fetch(feed.url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.text();
        console.log(`Fetched ${feed.source} RSS feed`);
        return data;
    } catch (error) {
        console.error(`Error fetching ${feed.source} RSS feed: ${error.message}`);
    }
}

// Main function to get all feeds
async function getGeopoliticalNews() {
    for (const feed of rssFeeds) {
        await fetchRSS(feed);
    }
}

// Execute main function
getGeopoliticalNews();
