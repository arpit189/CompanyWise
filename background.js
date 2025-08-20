// LeetCode Company Finder Background Service Worker

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('LeetCode Company Finder extension installed');
        
        // Initialize storage with default values
        chrome.storage.local.set({
            lastCacheTime: null,
            companiesData: null,
            problemData: null,
            cacheExpiryHours: 24
        });
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('LeetCode Company Finder extension started');
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getCachedData') {
        chrome.storage.local.get(['companiesData', 'problemData', 'lastCacheTime'], (result) => {
            sendResponse(result);
        });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'setCachedData') {
        chrome.storage.local.set({
            companiesData: request.companiesData,
            problemData: request.problemData,
            lastCacheTime: Date.now()
        }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
    
    if (request.action === 'clearCache') {
        chrome.storage.local.remove(['companiesData', 'problemData', 'lastCacheTime'], () => {
            sendResponse({ success: true });
        });
        return true;
    }
});

// Optional: Handle periodic cache refresh
// This could be used to refresh data in the background
// For now, we'll let the content script handle data fetching on demand

// Handle extension icon click (if we add one later)
chrome.action?.onClicked?.addListener((tab) => {
    // This could be used to open the panel from the extension icon
    // For now, we're using the floating icon approach
    console.log('Extension icon clicked');
});
