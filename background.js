// Default websites to bypass paywalls
const defaultSites = [
    "medium.com",
    "nytimes.com",
    "geeksforgeeks.org"
];

// Initialize storage with default sites
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['bypassSites'], (result) => {
        if (!result.bypassSites) {
            chrome.storage.local.set({ bypassSites: defaultSites });
        }
    });
});

// Listen for tab updates
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    // Only process main frame navigation (not iframes)
    if (details.frameId !== 0) return;

    const url = new URL(details.url);
    if (url.hostname === 'medium.com' && (url.pathname.includes('/login') || url.pathname.includes('/signup') || url.pathname.includes('/write'))) {
        return;
    }

    // Skip if already using 12ft.io
    if (url.hostname === '12ft.io') return;

    chrome.storage.local.get(['bypassSites'], (result) => {
        const bypassSites = result.bypassSites || defaultSites;

        // Check if the URL contains any of the sites in our list
        const shouldBypass = bypassSites.some(site => url.hostname.includes(site));

        if (shouldBypass) {
            // Create the 12ft.io URL
            const bypassUrl = `https://12ft.io/${details.url}`;

            // Navigate to the bypass URL
            chrome.tabs.update(details.tabId, { url: bypassUrl });
        }
    });
});