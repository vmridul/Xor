/**
 * XOR — Background Service Worker
 * Handles badge updates, message routing, and keyboard shortcuts
 */

// Update badge with total tweet count
async function updateBadge() {
  try {
    const result = await chrome.storage.local.get('xor_tweets');
    const tweets = result.xor_tweets || {};
    const count = Object.keys(tweets).length;
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#6366f1' });
  } catch (e) {
    // Ignore errors during initialization
  }
}

// Listen for data changes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'xor_data_changed') {
    updateBadge();
    // Broadcast to all tabs
    chrome.tabs.query({ url: ['https://x.com/*', 'https://twitter.com/*'] }, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id !== sender.tab?.id) {
          chrome.tabs.sendMessage(tab.id, message).catch(() => {});
        }
      });
    });
  }

  if (message.action === 'xor_open_dashboard') {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/index.html') });
    return false;
  }
  
  if (message.action === 'xor_get_stats') {
    // Forward to storage and respond
    chrome.storage.local.get(['xor_tweets', 'xor_folders'], (result) => {
      const tweets = result.xor_tweets || {};
      const folders = result.xor_folders || [];
      sendResponse({
        totalTweets: Object.keys(tweets).length,
        totalFolders: folders.length,
      });
    });
    return true; // async response
  }
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'save-tweet') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'xor_trigger_save' });
      }
    });
  }
});

// Initialize badge on install/startup
chrome.runtime.onInstalled.addListener(() => {
  updateBadge();
  // Create default folder on first install
  chrome.storage.local.get('xor_folders', (result) => {
    if (!result.xor_folders || result.xor_folders.length === 0) {
      const defaultFolder = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
        name: 'Saved Tweets',
        color: '#1d9bf0',
        icon: '⭐',
        createdAt: new Date().toISOString(),
        order: 0,
      };
      chrome.storage.local.set({ xor_folders: [defaultFolder] });
    }
  });
});

chrome.runtime.onStartup.addListener(updateBadge);
