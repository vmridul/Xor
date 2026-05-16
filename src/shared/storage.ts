import { XOR_UTILS } from "./utils";

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  order: number;
}

export interface Tweet {
  id: string;
  text: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  isVerified?: boolean;
  timestamp: string;
  url: string;
  savedAt: string;
  folderIds: string[];
  media: { type: string; url: string }[];
  stats: { likes: number; retweets: number; replies: number };
}

export interface Settings {
  theme: "auto" | "light" | "dark" | "dim";
  defaultFolder: string | null;
  showNotifications: boolean;
}

const STORAGE_KEYS = {
  FOLDERS: "xor_folders",
  TWEETS: "xor_tweets",
  SETTINGS: "xor_settings",
};

const DEFAULT_SETTINGS: Settings = {
  theme: "auto",
  defaultFolder: null,
  showNotifications: true,
};

async function _get<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result: { [key: string]: any }) => {
      resolve(result[key]);
    });
  });
}

async function _set(data: { [key: string]: any }): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, () => resolve());
  });
}

function _notifyChange(type: "folders" | "tweets") {
  try {
    chrome.runtime.sendMessage({ action: "xor_data_changed", type });
  } catch (e) {
    // Ignore message errors
  }
}

export const XOR_STORAGE = {
  getFolders: async (): Promise<Folder[]> => {
    const folders = await _get<Folder[]>(STORAGE_KEYS.FOLDERS);
    return folders || [];
  },

  createFolder: async (
    name: string,
    color?: string,
    icon?: string,
  ): Promise<Folder> => {
    const folders = await XOR_STORAGE.getFolders();
    const folder: Folder = {
      id: XOR_UTILS.generateId(),
      name: name.trim(),
      color:
        color ||
        XOR_UTILS.FOLDER_COLORS[
          folders.length % XOR_UTILS.FOLDER_COLORS.length
        ],
      icon: icon || "",
      createdAt: new Date().toISOString(),
      order: folders.length,
    };
    folders.push(folder);
    await _set({ [STORAGE_KEYS.FOLDERS]: folders });
    _notifyChange("folders");
    return folder;
  },

  updateFolder: async (
    folderId: string,
    updates: Partial<Folder>,
  ): Promise<Folder | null> => {
    const folders = await XOR_STORAGE.getFolders();
    const index = folders.findIndex((f) => f.id === folderId);
    if (index === -1) return null;
    folders[index] = { ...folders[index], ...updates };
    await _set({ [STORAGE_KEYS.FOLDERS]: folders });
    _notifyChange("folders");
    return folders[index];
  },

  deleteFolder: async (folderId: string): Promise<boolean> => {
    let folders = await XOR_STORAGE.getFolders();
    folders = folders.filter((f) => f.id !== folderId);
    await _set({ [STORAGE_KEYS.FOLDERS]: folders });

    const tweets = await XOR_STORAGE.getTweets();
    let changed = false;
    for (const tweetId in tweets) {
      const idx = tweets[tweetId].folderIds.indexOf(folderId);
      if (idx !== -1) {
        tweets[tweetId].folderIds.splice(idx, 1);
        changed = true;
      }
    }
    if (changed) {
      for (const tweetId in tweets) {
        if (tweets[tweetId].folderIds.length === 0) {
          delete tweets[tweetId];
        }
      }
      await _set({ [STORAGE_KEYS.TWEETS]: tweets });
    }
    _notifyChange("folders");
    _notifyChange("tweets");
    return true;
  },

  getTweets: async (): Promise<{ [key: string]: Tweet }> => {
    const tweets = await _get<{ [key: string]: Tweet }>(STORAGE_KEYS.TWEETS);
    return tweets || {};
  },

  saveTweet: async (tweetData: any, folderId: string): Promise<Tweet> => {
    const tweets = await XOR_STORAGE.getTweets();
    const tweetId = tweetData.id;

    if (tweets[tweetId]) {
      if (!tweets[tweetId].folderIds.includes(folderId)) {
        tweets[tweetId].folderIds.push(folderId);
      }
    } else {
      tweets[tweetId] = {
        ...tweetData,
        savedAt: new Date().toISOString(),
        folderIds: [folderId],
      };
    }

    await _set({ [STORAGE_KEYS.TWEETS]: tweets });
    _notifyChange("tweets");
    return tweets[tweetId];
  },

  removeTweetFromFolder: async (
    tweetId: string,
    folderId: string,
  ): Promise<boolean> => {
    const tweets = await XOR_STORAGE.getTweets();
    if (!tweets[tweetId]) return false;

    const idx = tweets[tweetId].folderIds.indexOf(folderId);
    if (idx !== -1) {
      tweets[tweetId].folderIds.splice(idx, 1);
    }

    if (tweets[tweetId].folderIds.length === 0) {
      delete tweets[tweetId];
    }

    await _set({ [STORAGE_KEYS.TWEETS]: tweets });
    _notifyChange("tweets");
    return true;
  },

  getTweetFolders: async (tweetId: string): Promise<Folder[]> => {
    const tweets = await XOR_STORAGE.getTweets();
    if (!tweets[tweetId]) return [];
    const folders = await XOR_STORAGE.getFolders();
    return folders.filter((f) => tweets[tweetId].folderIds.includes(f.id));
  },

  getSettings: async (): Promise<Settings> => {
    const settings = await _get<Settings>(STORAGE_KEYS.SETTINGS);
    return { ...DEFAULT_SETTINGS, ...(settings || {}) };
  },

  updateSettings: async (updates: Partial<Settings>): Promise<Settings> => {
    const settings = await XOR_STORAGE.getSettings();
    const newSettings = { ...settings, ...updates };
    await _set({ [STORAGE_KEYS.SETTINGS]: newSettings });
    return newSettings;
  },

  getAllData: async (): Promise<any> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (result) => {
        resolve(result);
      });
    });
  },

  importData: async (data: any): Promise<void> => {
    await _set(data);
    _notifyChange("folders");
    _notifyChange("tweets");
  },

  clearAllData: async (): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        _notifyChange("folders");
        _notifyChange("tweets");
        resolve();
      });
    });
  },
};
