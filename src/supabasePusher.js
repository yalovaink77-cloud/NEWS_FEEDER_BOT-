// src/supabasePusher.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to push news to Supabase with duplicate prevention
async function pushNews(article) {
    const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('title', article.title);

    if (error) {
        console.error('Error fetching news:', error);
        return;
    }

    // Check if article already exists
    if (data.length === 0) {
        const { data: insertData, error: insertError } = await supabase
            .from('news')
            .insert(article);
        
        if (insertError) {
            console.error('Error inserting news:', insertError);
            return;
        }

        console.log('News article pushed:', insertData);
    } else {
        console.log('Duplicate article. Not pushing:', article.title);
    }
}

module.exports = { pushNews };