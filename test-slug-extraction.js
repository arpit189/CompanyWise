// Test file for slug extraction functionality
// This can be run in Node.js or browser console

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function extractProblemSlug(url) {
    const path = new URL(url).pathname;
    
    // Primary: extract from URL path /problems/<slug>/
    const problemMatch = path.match(/\/problems\/([^\/]+)/);
    if (problemMatch) {
        return problemMatch[1];
    }
    
    return null;
}

// Test cases
const testCases = [
    {
        url: 'https://leetcode.com/problems/two-sum/',
        expected: 'two-sum',
        description: 'Basic problem URL'
    },
    {
        url: 'https://leetcode.com/problems/add-two-numbers/',
        expected: 'add-two-numbers',
        description: 'Problem with multiple words'
    },
    {
        url: 'https://leetcode.com/problems/encode-and-decode-tinyurl/',
        expected: 'encode-and-decode-tinyurl',
        description: 'Long problem name with special characters'
    },
    {
        url: 'https://leetcode.com/problems/1234-abc/',
        expected: '1234-abc',
        description: 'Problem with numbers and letters'
    },
    {
        url: 'https://leetcode.com/problems/valid-parentheses/',
        expected: 'valid-parentheses',
        description: 'Common problem name'
    },
    {
        url: 'https://leetcode.cn/problems/two-sum/',
        expected: 'two-sum',
        description: 'Chinese LeetCode domain'
    },
    {
        url: 'https://leetcode.com/problems/',
        expected: null,
        description: 'No problem slug in URL'
    },
    {
        url: 'https://leetcode.com/',
        expected: null,
        description: 'Home page'
    }
];

// Test slugify function
const slugifyTests = [
    {
        input: 'Two Sum',
        expected: 'two-sum',
        description: 'Simple title'
    },
    {
        input: 'Add Two Numbers',
        expected: 'add-two-numbers',
        description: 'Multiple words'
    },
    {
        input: 'Encode and Decode TinyURL',
        expected: 'encode-and-decode-tinyurl',
        description: 'Complex title'
    },
    {
        input: 'Valid Parentheses',
        expected: 'valid-parentheses',
        description: 'Common problem'
    },
    {
        input: '1234. Replace the Substring for Balanced String',
        expected: '1234-replace-the-substring-for-balanced-string',
        description: 'Title with number'
    }
];

console.log('Testing URL slug extraction:');
console.log('============================');

testCases.forEach((testCase, index) => {
    const result = extractProblemSlug(testCase.url);
    const passed = result === testCase.expected;
    
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   URL: ${testCase.url}`);
    console.log(`   Expected: ${testCase.expected}`);
    console.log(`   Got: ${result}`);
    console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');
});

console.log('Testing slugify function:');
console.log('========================');

slugifyTests.forEach((testCase, index) => {
    const result = slugify(testCase.input);
    const passed = result === testCase.expected;
    
    console.log(`${index + 1}. ${testCase.description}`);
    console.log(`   Input: "${testCase.input}"`);
    console.log(`   Expected: "${testCase.expected}"`);
    console.log(`   Got: "${result}"`);
    console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');
});

// Example usage in content script context
console.log('Example usage in content script:');
console.log('================================');

const exampleUrl = 'https://leetcode.com/problems/two-sum/';
const exampleTitle = 'Two Sum';

console.log(`URL: ${exampleUrl}`);
console.log(`Extracted slug: ${extractProblemSlug(exampleUrl)}`);
console.log(`Title: "${exampleTitle}"`);
console.log(`Slugified title: "${slugify(exampleTitle)}"`);

// Test data matching logic
console.log('\nData matching test:');
console.log('==================');

// Simulate the data structure from the JSON files
const mockCompaniesData = {
    "1": {
        "title": "Two Sum",
        "companies": {
            "amazon": { "alltime": "2.5" },
            "google": { "alltime": "1.8" }
        }
    },
    "2": {
        "title": "Add Two Numbers",
        "companies": {
            "microsoft": { "alltime": "1.2" }
        }
    }
};

const mockProblemData = {
    "1": {
        "id": "1",
        "name": "Two Sum",
        "displayText": "1. Two Sum"
    },
    "2": {
        "id": "2", 
        "name": "Add Two Numbers",
        "displayText": "2. Add Two Numbers"
    }
};

function findProblemData(slug, companiesData, problemData) {
    // Try to find by slug first
    for (const [id, data] of Object.entries(companiesData)) {
        if (data.title && slugify(data.title) === slug) {
            return { type: 'companies', id, data };
        }
    }
    
    // If not found by slug, try to find by problem ID in problem_data.json
    for (const [id, data] of Object.entries(problemData)) {
        if (data.name && slugify(data.name) === slug) {
            // Look up companies by ID
            if (companiesData[id]) {
                return { type: 'problem', id, data: companiesData[id] };
            }
        }
    }
    
    return null;
}

const testSlug = 'two-sum';
const result = findProblemData(testSlug, mockCompaniesData, mockProblemData);

console.log(`Looking for slug: "${testSlug}"`);
if (result) {
    console.log(`Found: ${result.type} data for ID ${result.id}`);
    console.log(`Title: ${result.data.title}`);
    console.log(`Companies: ${Object.keys(result.data.companies).join(', ')}`);
} else {
    console.log('Not found in dataset');
}
