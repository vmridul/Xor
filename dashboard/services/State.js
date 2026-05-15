/**
 * XOR — Dashboard State Manager (Service)
 */
export class DashboardState {
  constructor() {
    this.allTweets = {};
    this.allFolders = [];
    this.currentView = "all";
    this.currentFolderId = null;
    this.listeners = [];
  }

  async load() {
    this.allFolders = await XOR_STORAGE.getFolders();
    this.allTweets = await XOR_STORAGE.getTweets();
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach((cb) => cb(this));
  }

  get tweetList() {
    return Object.values(this.allTweets);
  }

  setView(view, folderId = null) {
    this.currentView = view;
    this.currentFolderId = folderId;
    this.notify();
  }

  async refresh() {
    await this.load();
  }
}

export const state = new DashboardState();
