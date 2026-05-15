import { state } from '../services/State.js';

export class TweetGrid {
  constructor(el) {
    this.el = el;
    this.grid = document.getElementById('tweetsGrid');
    this.title = document.getElementById('viewTitle');
    this.subtitle = document.getElementById('viewSubtitle');
  }

  render() {
    let tweets = [];
    let title = '';

    if (state.currentView === 'all') {
      tweets = state.tweetList;
      title = 'All Tweets';
    } else if (state.currentView === 'folder') {
      const folder = state.allFolders.find(f => f.id === state.currentFolderId);
      tweets = state.tweetList.filter(t => t.folderIds.includes(state.currentFolderId));
      title = folder ? `${folder.icon} ${folder.name}` : 'Folder';
    }

    this.title.textContent = title;
    this.subtitle.textContent = `${tweets.length} tweets`;

    if (tweets.length === 0) {
      this.grid.innerHTML = '';
      document.getElementById('emptyState').style.display = '';
      return;
    }

    document.getElementById('emptyState').style.display = 'none';
    this.grid.innerHTML = tweets
      .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
      .map(t => this.cardHTML(t))
      .join('');
  }

  cardHTML(t) {
    const folders = state.allFolders.filter(f => t.folderIds.includes(f.id));
    const media = t.media && t.media.length ? `<div class="tweet-media has-${Math.min(t.media.length,4)}">${t.media.slice(0,4).map(m => `<img src="${m.url}" loading="lazy">`).join('')}</div>` : '';
    
    return `
      <div class="tweet-card" data-id="${t.id}">
        <div class="tweet-card-header">
          <img class="tweet-avatar" src="${t.authorAvatar || ''}">
          <div class="tweet-author">
            <div class="tweet-author-name">${XOR_UTILS.escapeHtml(t.authorName)}</div>
            <div class="tweet-author-handle">${XOR_UTILS.escapeHtml(t.authorHandle)}</div>
          </div>
        </div>
        <div class="tweet-text">${XOR_UTILS.escapeHtml(t.text)}</div>
        ${media}
        <div class="tweet-footer">
          <span class="tweet-date">${XOR_UTILS.timeAgo(t.savedAt)}</span>
        </div>
      </div>`;
  }
}
