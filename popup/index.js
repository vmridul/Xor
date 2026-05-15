/**
 * XOR — Popup Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Setup dashboard button immediately
  const dashboardBtn = document.getElementById('openDashboard');
  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard/index.html') });
      window.close();
    });
  }

  // 2. Load stats
  try {
    const tweets = await XOR_STORAGE.getTweets();
    const folders = await XOR_STORAGE.getFolders();
    const tweetList = Object.values(tweets);

    const totalTweetsEl = document.getElementById('totalTweets');
    const totalFoldersEl = document.getElementById('totalFolders');
    if (totalTweetsEl) totalTweetsEl.textContent = tweetList.length;
    if (totalFoldersEl) totalFoldersEl.textContent = folders.length;

    // Load recent folders
    const container = document.getElementById('recentFolders');
    if (container && folders.length > 0) {
      const recentFolders = folders.sort((a, b) => a.order - b.order).slice(0, 5);
      container.innerHTML = recentFolders.map(folder => {
        const count = tweetList.filter(t => t.folderIds.includes(folder.id)).length;
        return `
          <div class="folder-row">
            <span class="folder-row-icon">${folder.icon}</span>
            <span class="folder-row-dot" style="background: ${folder.color}"></span>
            <span class="folder-row-name">${XOR_UTILS.escapeHtml(folder.name)}</span>
            <span class="folder-row-count">${count}</span>
          </div>
        `;
      }).join('');
    }
  } catch (error) {
    console.error('[XOR] Error loading popup stats:', error);
  }
});
