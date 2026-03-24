const axios = require('axios');

// Function to fetch whale alerts from Whale Alert API
async function fetchWhaleAlerts() {
    const url = 'https://api.whale-alert.io/v1/transactions';
    const params = {
        'currency': 'BTC,ETH,USDT',
        'min_value': 1000000,
        'api_key': 'YOUR_API_KEY' // Replace with your actual API key
    };
    
    try {
        const response = await axios.get(url, { params });
        return formatAlerts(response.data);
    } catch (error) {
        console.error('Error fetching whale alerts:', error);
        return [];
    }
}

// Function to format alerts into normalized news format
function formatAlerts(data) {
    return data.transactions.map(transaction => ({
        amount: transaction.amount,
        currency: transaction.currency,
        timestamp: transaction.timestamp,
        source_weight: 0.15,
        transaction_type: transaction.transaction_type,
        // Add more fields as necessary
    }));
}

// Export the fetch function for use in other modules
module.exports = { fetchWhaleAlerts };