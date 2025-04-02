document.addEventListener('DOMContentLoaded', function() {
    // Load and display the list of websites
    loadSitesList();
    
    // Add event listener for the add button
    document.getElementById('add-btn').addEventListener('click', addNewSite);
    
    // Add event listener for the input field (Enter key)
    document.getElementById('new-site').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        addNewSite();
      }
    });
    
    // Add event listener for bypass current page button
    document.getElementById('bypass-current').addEventListener('click', bypassCurrentPage);
    
    // Add event listener for unbypass current page button (new)
    document.getElementById('unbypass-current').addEventListener('click', unbypassCurrentPage);
  });
  
  // Load and display the list of websites
  function loadSitesList() {
    chrome.storage.local.get(['bypassSites'], function(result) {
      const sitesList = document.getElementById('sites-list');
      sitesList.innerHTML = '';
      
      const sites = result.bypassSites || [];
      
      sites.forEach(function(site) {
        const li = document.createElement('li');
        
        const siteText = document.createElement('span');
        siteText.textContent = site;
        
        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.className = 'remove-btn';
        removeButton.addEventListener('click', function() {
          removeSite(site);
        });
        
        li.appendChild(siteText);
        li.appendChild(removeButton);
        sitesList.appendChild(li);
      });
    });
  }
  
  // Add a new site to the list
  function addNewSite() {
    const input = document.getElementById('new-site');
    const site = input.value.trim();
    
    if (site) {
      chrome.storage.local.get(['bypassSites'], function(result) {
        const sites = result.bypassSites || [];
        
        // Check if the site is already in the list
        if (!sites.includes(site)) {
          sites.push(site);
          chrome.storage.local.set({bypassSites: sites}, function() {
            loadSitesList();
            input.value = '';
          });
        } else {
          // Site already exists, clear the input
          input.value = '';
        }
      });
    }
  }
  
  // Remove a site from the list
  function removeSite(site) {
    chrome.storage.local.get(['bypassSites'], function(result) {
      const sites = result.bypassSites || [];
      const index = sites.indexOf(site);
      
      if (index !== -1) {
        sites.splice(index, 1);
        chrome.storage.local.set({bypassSites: sites}, function() {
          loadSitesList();
        });
      }
    });
  }
  
  // Bypass the current page
  function bypassCurrentPage() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        const currentUrl = tabs[0].url;
        
        // Skip if already using 12ft.io
        if (new URL(currentUrl).hostname === '12ft.io') return;
        
        const bypassUrl = `https://12ft.io/${currentUrl}`;
        chrome.tabs.update(tabs[0].id, {url: bypassUrl});
      }
    });
  }
  
  // Unbypass the current page (new)
  function unbypassCurrentPage() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        const currentUrl = tabs[0].url;
        const urlObj = new URL(currentUrl);
        
        // Only process if using 12ft.io
        if (urlObj.hostname !== '12ft.io') return;
        
        // Extract the original URL
        let originalUrl = currentUrl.replace('https://12ft.io/', '');
        
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
        chrome.tabs.update(tabs[0].id, {url: originalUrl});
      }
    });
  }