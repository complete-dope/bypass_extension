// This content script will modify link clicks if needed

// Function to check if a hostname contains any of our target sites
function shouldBypassSite(hostname, bypassSites) {
    return bypassSites.some(site => hostname.includes(site));
}

// Add event listener for link clicks
document.addEventListener('click', function (event) {
    // Check if the click is on a link
    let target = event.target;
    while (target && target.tagName !== 'A') {
        target = target.parentElement;
    }

    if (!target || !target.href) return;

    // Get the URL
    const url = new URL(target.href);

    // Skip if already using 12ft.io
    if (url.hostname === '12ft.io') return;

    chrome.storage.local.get(['bypassSites'], function (result) {
        const bypassSites = result.bypassSites || [];

        if (shouldBypassSite(url.hostname, bypassSites)) {
            // Prevent the default link behavior
            event.preventDefault();

            // Open with 12ft.io
            window.location.href = `https://12ft.io/${target.href}`;
        }
    });
}, true);