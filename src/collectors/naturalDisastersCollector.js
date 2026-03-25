const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();

// Significant earthquakes of last 30 days
// EMSC old RSS = 404; replaced with SeismicPortal. NOAA climate series = 404; replaced with NHC.
const USGS_URL       = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson';
const SEISMIC_URL    = 'https://seismicportal.eu/fdsnws/event/1/query?format=text&limit=20&minmag=4.5';
const NOAA_URL       = 'https://www.nhc.noaa.gov/index-at.xml';

async function getUSGSEarthquakes() {
    try {
        const response = await axios.get(USGS_URL);
        const features = response.data?.features || [];
        console.log(`✓ USGS: ${features.length} significant earthquakes`);
        return features.map(e => {
            const mag = e.properties.mag;
            const place = e.properties.place || 'unknown location';
            return {
                source:        'USGS',
                title:         `Earthquake M${mag} - ${place}`,
                content:       `Magnitude ${mag} earthquake near ${place}.`,
                url:           e.properties.url || USGS_URL,
                published_at:  e.properties.time ? new Date(e.properties.time).toISOString() : new Date().toISOString(),
                source_weight: mag >= 6.0 ? 0.50 : mag >= 5.0 ? 0.35 : 0.20,
                category:      'disaster',
                event_type:    'earthquake',
                raw_data: {
                    magnitude:  mag,
                    depth_km:   e.geometry?.coordinates?.[2],
                    place,
                    usgs_id:    e.id,
                },
            };
        });
    } catch (error) {
        console.error('✗ USGS error:', error.message);
        return [];
    }
}

async function getSeismicPortalEarthquakes() {
    try {
        const response = await axios.get(SEISMIC_URL, { timeout: 10000 });
        const lines = response.data.split('\n').filter(l => l && !l.startsWith('#'));
        const articles = lines.map(line => {
            const cols = line.split('|');
            // format: EventID|Time|Lat|Lon|Depth|Author|Catalog|Contributor|...|MagType|Mag|MagAuthor|Location
            const time     = cols[1]?.trim();
            const mag      = parseFloat(cols[10]?.trim()) || 0;
            const location = cols[12]?.trim() || 'unknown';
            if (!time || mag < 4.5) return null;
            return {
                source:        'SeismicPortal',
                title:         `Earthquake M${mag.toFixed(1)} - ${location}`,
                content:       `Magnitude ${mag.toFixed(1)} earthquake near ${location}.`,
                url:           'https://seismicportal.eu',
                published_at:  new Date(time).toISOString(),
                source_weight: mag >= 6.0 ? 0.50 : mag >= 5.0 ? 0.35 : 0.20,
                category:      'disaster',
                event_type:    'earthquake',
                raw_data:      { magnitude: mag, location },
            };
        }).filter(Boolean);
        console.log(`✓ SeismicPortal: ${articles.length} earthquakes`);
        return articles;
    } catch (error) {
        console.error('✗ SeismicPortal error:', error.message);
        return [];
    }
}

async function getNOAAWeather() {
    try {
        const result = await parser.parseURL(NOAA_URL);
        console.log(`✓ NOAA: ${result.items.length} items`);
        return result.items.map(item => ({
            source:        'NOAA',
            title:         item.title || '',
            content:       item.contentSnippet || item.summary || '',
            url:           item.link || NOAA_URL,
            published_at:  item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            source_weight: 0.20,
            category:      'disaster',
            event_type:    'weather',
            raw_data:      null,
        }));
    } catch (error) {
        console.error('✗ NOAA error:', error.message);
        return [];
    }
}

async function getNaturalDisasters() {
    console.log('Collecting Natural Disasters...');
    const [usgs, seismic, noaa] = await Promise.all([
        getUSGSEarthquakes(),
        getSeismicPortalEarthquakes(),
        getNOAAWeather(),
    ]);
    return [...usgs, ...seismic, ...noaa];
}

module.exports = { getNaturalDisasters };