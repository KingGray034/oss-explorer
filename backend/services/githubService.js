const GITHUB_API = 'https://api.github.com/search/issues';

const fetchIssues = async (query) => {

    const url = `${GITHUB_API}?q=${query}&per_page=10`;

    console.log('🌐 Fetching:', url);
    console.log('🔑 Token:', process.env.GITHUB_TOKEN_2 ? 'EXISTS' : 'MISSING');

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN_2}`,
            Accept: 'application/vnd.github+json',
            'User-Agent': 'OSS-Explorer-App'
        }
    });

    console.log('📡 Status:', response.status);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ GitHub API Error:', errorText);
        throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Found:', data.total_count, 'total,', data.items?.length, 'returned');

    return data.items || [];
};

const fetchIssuesForDifficulty = async (difficulty) => {
    let queryParts = ['state:open', 'type:issue'];

    switch (difficulty) {
        case 'Easy': 
            queryParts.push('label:"good first issue"');
            break;
        case 'Medium':
            queryParts.push('label:"help wanted"');
            break;
        case 'Hard':
            queryParts.push('label:bug');
            break;
    }

    const query = queryParts.join('+');
    console.log('🎯 Query:', query);

    return await fetchIssues(query);
};

export { fetchIssues, fetchIssuesForDifficulty };