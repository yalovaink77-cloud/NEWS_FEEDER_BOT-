function normalizeNews(newsArray) {
    return newsArray.map(news => {
        return {
            source: news.source || 'unknown',
            title: news.title || 'no title',
            content: news.content || '',
            url: news.url || '',
            published_at: news.published_at ? validateISOTimestamp(news.published_at) : new Date().toISOString(),
            source_weight: news.source_weight || 1
        };
    });
}

function validateISOTimestamp(timestamp) {
    const date = new Date(timestamp);
    if (date.toISOString() === 'Invalid Date') {
        throw new Error('Invalid ISO Timestamp');
    }
    return date.toISOString();
}
