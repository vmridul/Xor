import { state } from "../services/State.js";

export class Sidebar {
  constructor(el) {
    this.el = el;
    this.container = document.getElementById('sidebarFolders');
  }

  render() {
    const tweetList = state.tweetList;
    document.getElementById("allCount").textContent = tweetList.length;

    this.container.innerHTML = state.allFolders
      .sort((a, b) => a.order - b.order)
      .map((f) => {
        const count = tweetList.filter((t) =>
          t.folderIds.includes(f.id),
        ).length;
        const active =
          state.currentView === "folder" && state.currentFolderId === f.id;
        return `
          <button class="folder-nav-item ${active ? "active" : ""}" data-id="${f.id}">
            <span class="folder-nav-icon">${f.icon}</span>
            <span class="folder-nav-dot" style="background:${f.color}"></span>
            <span class="folder-nav-name">${XOR_UTILS.escapeHtml(f.name)}</span>
            <span class="folder-nav-count">${count}</span>
          </button>`;
      })
      .join("");

    this.container.querySelectorAll(".folder-nav-item").forEach((btn) => {
      btn.onclick = () => state.setView("folder", btn.dataset.id);
    });
  }
}
