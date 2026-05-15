/**
 * XOR — Storage Module
 * Chrome storage API wrapper for managing folders and tweets
 */

const XOR_STORAGE = (() => {
  const STORAGE_KEYS = {
    FOLDERS: 'xor_folders',
    TWEETS: 'xor_tweets',
    SETTINGS: 'xor_settings',
  };

  const DEFAULT_SETTINGS = {
    theme: 'auto',
    defaultFolder: null,
    showNotifications: true,
  };

  // ─── Internal Helpers ───

  async function _get(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
        resolve(result[key]);
      });
    });
  }

  async function _set(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, resolve);
    });
  }

  // ─── Folders ───

  async function getFolders() {
    const folders = await _get(STORAGE_KEYS.FOLDERS);
    return folders || [];
  }

  async function createFolder(name, color, icon) {
    const folders = await getFolders();
    const folder = {
      id: XOR_UTILS.generateId(),
      name: name.trim(),
      color: color || XOR_UTILS.FOLDER_COLORS[folders.length % XOR_UTILS.FOLDER_COLORS.length],
      icon: icon || '📁',
      createdAt: new Date().toISOString(),
      order: folders.length,
    };
    folders.push(folder);
    await _set({ [STORAGE_KEYS.FOLDERS]: folders });
    _notifyChange('folders');
    return folder;
  }

  async function updateFolder(folderId, updates) {
    const folders = await getFolders();
    const index = folders.findIndex((f) => f.id === folderId);
    if (index === -1) return null;
    folders[index] = { ...folders[index], ...updates };
    await _set({ [STORAGE_KEYS.FOLDERS]: folders });
    _notifyChange('folders');
    return folders[index];
  }

  async function deleteFolder(folderId) {
    let folders = await getFolders();
    folders = folders.filter((f) => f.id !== folderId);
    await _set({ [STORAGE_KEYS.FOLDERS]: folders });

    // Remove folder reference from tweets
    const tweets = await getTweets();
    let changed = false;
    for (const tweetId in tweets) {
      const idx = tweets[tweetId].folderIds.indexOf(folderId);
      if (idx !== -1) {
        tweets[tweetId].folderIds.splice(idx, 1);
        changed = true;
      }
    }
    if (changed) {
      // Remove tweets with no folders
      for (const tweetId in tweets) {
        if (tweets[tweetId].folderIds.length === 0) {
          delete tweets[tweetId];
        }
      }
      await _set({ [STORAGE_KEYS.TWEETS]: tweets });
    }
    _notifyChange('folders');
    _notifyChange('tweets');
    return true;
  }

  async function reorderFolders(folderIds) {
    const folders = await getFolders();
    const ordered = folderIds
      .map((id, index) => {
        const folder = folders.find((f) => f.id === id);
        if (folder) folder.order = index;
        return folder;
      })
      .filter(Boolean);
    await _set({ [STORAGE_KEYS.FOLDERS]: ordered });
    _notifyChange('folders');
  }

  // ─── Tweets ───

  async function getTweets() {
    const tweets = await _get(STORAGE_KEYS.TWEETS);
    return tweets || {};
  }

  async function saveTweet(tweetData, folderId) {
    const tweets = await getTweets();
    const tweetId = tweetData.id;

    if (tweets[tweetId]) {
      // Tweet already exists — add to folder if not already there
      if (!tweets[tweetId].folderIds.includes(folderId)) {
        tweets[tweetId].folderIds.push(folderId);
      }
    } else {
      // New tweet
      tweets[tweetId] = {
        ...tweetData,
        savedAt: new Date().toISOString(),
        folderIds: [folderId],
      };
    }

    await _set({ [STORAGE_KEYS.TWEETS]: tweets });
    _notifyChange('tweets');
    return tweets[tweetId];
  }

  async function removeTweetFromFolder(tweetId, folderId) {
    const tweets = await getTweets();
    if (!tweets[tweetId]) return false;

    const idx = tweets[tweetId].folderIds.indexOf(folderId);
    if (idx !== -1) {
      tweets[tweetId].folderIds.splice(idx, 1);
    }

    // Remove tweet entirely if no folders reference it
    if (tweets[tweetId].folderIds.length === 0) {
      delete tweets[tweetId];
    }

    await _set({ [STORAGE_KEYS.TWEETS]: tweets });
    _notifyChange('tweets');
    return true;
  }

  async function moveTweet(tweetId, fromFolderId, toFolderId) {
    const tweets = await getTweets();
    if (!tweets[tweetId]) return false;

    const fromIdx = tweets[tweetId].folderIds.indexOf(fromFolderId);
    if (fromIdx !== -1) {
      tweets[tweetId].folderIds.splice(fromIdx, 1);
    }
    if (!tweets[tweetId].folderIds.includes(toFolderId)) {
      tweets[tweetId].folderIds.push(toFolderId);
    }

    await _set({ [STORAGE_KEYS.TWEETS]: tweets });
    _notifyChange('tweets');
    return true;
  }

  async function deleteTweet(tweetId) {
    const tweets = await getTweets();
    delete tweets[tweetId];
    await _set({ [STORAGE_KEYS.TWEETS]: tweets });
    _notifyChange('tweets');
    return true;
  }

  async function getTweetsByFolder(folderId) {
    const tweets = await getTweets();
    const result = [];
    for (const tweetId in tweets) {
      if (tweets[tweetId].folderIds.includes(folderId)) {
        result.push(tweets[tweetId]);
      }
    }
    // Sort by savedAt descending
    result.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    return result;
  }

  async function getTweetFolders(tweetId) {
    const tweets = await getTweets();
    if (!tweets[tweetId]) return [];
    const folders = await getFolders();
    return folders.filter((f) => tweets[tweetId].folderIds.includes(f.id));
  }

  async function searchTweets(query) {
    const tweets = await getTweets();
    const q = query.toLowerCase();
    const results = [];
    for (const tweetId in tweets) {
      const tweet = tweets[tweetId];
      if (
        tweet.text.toLowerCase().includes(q) ||
        tweet.authorName.toLowerCase().includes(q) ||
        tweet.authorHandle.toLowerCase().includes(q)
      ) {
        results.push(tweet);
      }
    }
    results.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    return results;
  }

  // ─── Settings ───

  async function getSettings() {
    const settings = await _get(STORAGE_KEYS.SETTINGS);
    return { ...DEFAULT_SETTINGS, ...(settings || {}) };
  }

  async function updateSettings(updates) {
    const settings = await getSettings();
    const newSettings = { ...settings, ...updates };
    await _set({ [STORAGE_KEYS.SETTINGS]: newSettings });
    return newSettings;
  }

  // ─── Stats ───

  async function getStats() {
    const folders = await getFolders();
    const tweets = await getTweets();
    const tweetList = Object.values(tweets);

    const authorCounts = {};
    tweetList.forEach((t) => {
      authorCounts[t.authorHandle] = (authorCounts[t.authorHandle] || 0) + 1;
    });

    const topAuthors = Object.entries(authorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([handle, count]) => ({ handle, count }));

    return {
      totalTweets: tweetList.length,
      totalFolders: folders.length,
      topAuthors,
      oldestSave: tweetList.length
        ? tweetList.reduce((oldest, t) =>
            new Date(t.savedAt) < new Date(oldest.savedAt) ? t : oldest
          ).savedAt
        : null,
      newestSave: tweetList.length
        ? tweetList.reduce((newest, t) =>
            new Date(t.savedAt) > new Date(newest.savedAt) ? t : newest
          ).savedAt
        : null,
    };
  }

  // ─── Import / Export ───

  async function exportData() {
    const folders = await getFolders();
    const tweets = await getTweets();
    const settings = await getSettings();
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      folders,
      tweets,
      settings,
    };
  }

  async function importData(data) {
    if (!data || !data.folders || !data.tweets) {
      throw new Error('Invalid import data');
    }
    await _set({
      [STORAGE_KEYS.FOLDERS]: data.folders,
      [STORAGE_KEYS.TWEETS]: data.tweets,
    });
    if (data.settings) {
      await _set({ [STORAGE_KEYS.SETTINGS]: data.settings });
    }
    _notifyChange('folders');
    _notifyChange('tweets');
    return true;
  }

  // ─── Change Notification ───

  function _notifyChange(type) {
    try {
      chrome.runtime.sendMessage({ action: 'xor_data_changed', type });
    } catch (e) {
      // Content script may not always be able to send messages
    }
  }

  return {
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    reorderFolders,
    getTweets,
    saveTweet,
    removeTweetFromFolder,
    moveTweet,
    deleteTweet,
    getTweetsByFolder,
    getTweetFolders,
    searchTweets,
    getSettings,
    updateSettings,
    getStats,
    exportData,
    importData,
  };
})();

if (typeof window !== 'undefined') {
  window.XOR_STORAGE = XOR_STORAGE;
}
