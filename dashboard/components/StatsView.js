import { state } from '../services/State.js';

export class StatsView {
  constructor(el) {
    this.el = el;
  }

  async render() {
    const stats = await XOR_STORAGE.getStats();
    document.getElementById('statTotalTweets').textContent = stats.totalTweets;
    document.getElementById('statTotalFolders').textContent = stats.totalFolders;
    document.getElementById('statFirstSave').textContent = stats.oldestSave ? XOR_UTILS.formatDate(stats.oldestSave) : '—';
    document.getElementById('statLastSave').textContent = stats.newestSave ? XOR_UTILS.formatDate(stats.newestSave) : '—';

    const authorsEl = document.getElementById('topAuthors');
    authorsEl.innerHTML = stats.topAuthors.length ? stats.topAuthors.map((a, i) =>
      `<div class="author-row"><span class="author-rank">#${i+1}</span><span class="author-handle">${XOR_UTILS.escapeHtml(a.handle)}</span><span class="author-count">${a.count} tweets</span></div>`
    ).join('') : '<div class="empty-state-small">No data yet</div>';
  }
}
