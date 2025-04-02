// Default websites to bypass paywalls
const defaultSites = [
    "nytimes.com",
    "geeksforgeeks.org"
  ];
  
  // Initialize storage with default sites
  chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['bypassSites'], (result) => {
      if (!result.bypassSites) {
        chrome.storage.local.set({bypassSites: defaultSites});
      }
    });
  });
  
  // Listen for tab updates
  chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    // Only process main frame navigation (not iframes)
    if (details.frameId !== 0) return;
    
    const url = new URL(details.url);
    
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
        chrome.tabs.update(details.tabId, {url: bypassUrl});
      }
    });
  });
  
  // Function to bypass current page
  function bypassCurrentPage(tabId, url) {
    // Skip if already using 12ft.io
    if (new URL(url).hostname === '12ft.io') return;
    
    const bypassUrl = `https://12ft.io/${url}`;
    chrome.tabs.update(tabId, {url: bypassUrl});
  }
  
  // Function to unbypass current page
  function unbypassCurrentPage(tabId, url) {
    const urlObj = new URL(url);
    
    // Only process if using 12ft.io
    if (urlObj.hostname !== '12ft.io') return;
    
    // Extract the original URL
    let originalUrl = url.replace('https://12ft.io/', '');
    
    // Handle path-based URLs
    if (urlObj.pathname.startsWith('/')) {
      // Remove the first slash if it exists
      originalUrl = urlObj.pathname.substring(1);
      
      // Handle cases where 12ft.io adds https:// or doesn't
      if (!originalUrl.startsWith('http')) {
        originalUrl = 'https://' + originalUrl;
      }
    }
    
    // Navigate to the original URL
    chrome.tabs.update(tabId, {url: originalUrl});
  }
  
  // Listen for keyboard shortcuts
  chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs.length === 0) return;
      
      const activeTab = tabs[0];
      
      if (command === 'bypass-current-page') {
        bypassCurrentPage(activeTab.id, activeTab.url);
      } else if (command === 'unbypass-current-page') {
        unbypassCurrentPage(activeTab.id, activeTab.url);
      }
    });
  });